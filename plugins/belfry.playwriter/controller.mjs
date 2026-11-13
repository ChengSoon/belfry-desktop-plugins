import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadEngine, ENGINE_VERSION } from "./runtime.mjs";

export const EXTENSION_URL = "https://chromewebstore.google.com/detail/playwriter/jfeammnjpkecdekppnclgkkffahnhfhe";
export const DEFAULT_PORT = 19988;
const MAX_SESSIONS = 16;
const text = value => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
export const errorResult = error => ({ ...text(error.message || String(error)), isError: true });
const hint = `请先安装 Playwriter 浏览器扩展，保持 Chrome 打开，并在一个普通网页点击扩展图标使其变绿：${EXTENSION_URL}`;

export function createController({ dataPath, port = DEFAULT_PORT, engineLoader = loadEngine, fetchImpl = fetch }) {
  let engine, starting, ownedRelay, phase = "idle", lastError = "", closed = false;
  const shutdown = new AbortController(), sessions = new Map(), instanceId = randomUUID();
  const logger = { log() {}, error: (...args) => { lastError = args.map(String).join(" ").slice(0, 1000); } };
  const request = async (path, timeout = 1200) => {
    const response = await fetchImpl(`http://127.0.0.1:${port}${path}`, {
      signal: AbortSignal.any([shutdown.signal, AbortSignal.timeout(timeout)]), redirect: "error",
    });
    if (!response.ok) throw new Error(`浏览器连接服务返回 HTTP ${response.status}`);
    return response.json();
  };
  async function probe() {
    try {
      const info = await request("/version");
      // Never kill or replace an existing process on the port.
      if (typeof info.version !== "string" || typeof info.instanceId !== "string") throw new Error("端口被其他服务占用");
      return info;
    } catch (error) {
      if (error.cause?.code === "ECONNREFUSED") return null;
      throw error;
    }
  }
  function start() {
    if (closed) return Promise.reject(new Error("插件已停止"));
    if (starting) return starting;
    starting = (async () => {
      phase = "preparing"; lastError = "";
      engine ??= await engineLoader(await dataPath(), { signal: shutdown.signal });
      shutdown.signal.throwIfAborted();
      const existing = await probe();
      if (!existing) {
        try {
          ownedRelay = await engine.startPlayWriterCDPRelayServer({ port, host: "127.0.0.1", logger,
            cdpLogger: { log() {} } });
        } catch (error) {
          if (error.code !== "EADDRINUSE" || !await probe()) throw error;
        }
      }
      if (closed) { ownedRelay?.close(); ownedRelay = null; throw new Error("插件已停止"); }
      phase = "ready";
    })().catch(error => { if (!closed) { phase = "error"; lastError = error.message; } throw error; })
      .finally(() => { starting = null; });
    return starting;
  }
  async function status() {
    let relay = null, extensions = [];
    if (phase === "ready") {
      try {
        relay = await probe();
        if (relay) extensions = (await request("/extensions/status")).extensions ?? [];
      } catch (error) { lastError = error.message; }
    }
    return { phase, engineVersion: ENGINE_VERSION, relayRunning: Boolean(relay), relayVersion: relay?.version ?? null,
      ownedRelay: Boolean(ownedRelay), port, sessions: sessions.size, lastError,
      extensions: extensions.map(item => ({ id: item.extensionId, browser: item.browser ?? "Chromium",
        activeTabs: item.activeTargets ?? 0, version: item.playwriterVersion ?? null })), extensionUrl: EXTENSION_URL };
  }
  async function ready() {
    if (phase !== "ready") await start();
    if (!await probe()) { phase = "idle"; ownedRelay = null; await start(); }
    const extensions = (await request("/extensions/status")).extensions ?? [];
    if (!extensions.length) throw new Error(hint);
    return extensions;
  }
  async function session(scope) {
    if (!scope?.sessionId || !scope.workspace) throw new Error("需要有效的 Agent 会话和项目目录，请从 Belfry 项目中的 Agent 调用此工具。");
    const key = JSON.stringify([scope.workspace, scope.sessionId]);
    if (sessions.has(key)) return sessions.get(key);
    const extensions = await ready();
    if (extensions.length > 1) throw new Error("检测到多个浏览器连接。请先断开暂时不用的 Playwriter 扩展，只保留需要操作的浏览器，再重试。");
    if (sessions.has(key)) return sessions.get(key);
    if (sessions.size >= MAX_SESSIONS) throw new Error("浏览器会话已达 16 个，请在不用的会话调用 playwriter_reset 后重试。");
    const id = createHash("sha256").update(instanceId).update(key).digest("hex").slice(0, 16);
    const executor = new engine.PlaywrightExecutor({ cwd: scope.workspace, logger,
      cdpConfig: { host: "127.0.0.1", port, extensionId: extensions[0].extensionId,
        sessionId: `belfry-${id}`, tabGroup: `belfry-${id.slice(0, 5)}` } });
    const value = { executor, key };
    sessions.set(key, value);
    return value;
  }
  async function execute(args, scope) {
    if (typeof args?.code !== "string" || !args.code.trim() || args.code.length > 50_000) throw new Error("code 需要 1–50000 个字符的 Playwright JavaScript。");
    const timeout = args.timeout ?? 10_000;
    if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 60_000) throw new Error("timeout 必须是 1000–60000 毫秒的整数。");
    scope.signal?.throwIfAborted();
    const { executor } = await session(scope);
    scope.signal?.throwIfAborted();
    const signal = scope.signal ? AbortSignal.any([scope.signal, shutdown.signal]) : shutdown.signal;
    const result = await executor.execute(args.code, { timeout, signal });
    const screenshots = (result.screenshots ?? []).map(image => `\n截图：${image.path}\n${image.snapshot ?? ""}`).join("\n");
    const content = [{ type: "text", text: (String(result.text || "操作完成。") + screenshots).slice(0, 20_000) }];
    let bytes = Buffer.byteLength(content[0].text);
    for (const image of result.images ?? []) {
      if (bytes + image.data.length > 750_000) {
        content[0].text += "\n图片超过工具传输上限，请截取较小区域或降低截图尺寸后重试。"; break;
      }
      bytes += image.data.length; content.push({ type: "image", data: image.data, mimeType: image.mimeType });
    }
    return { content, ...(result.isError ? { isError: true } : {}) };
  }
  async function reset(scope) {
    if (!scope?.sessionId || !scope.workspace) throw new Error("缺少 Agent 会话或项目目录。");
    const key = JSON.stringify([scope.workspace, scope.sessionId]), value = sessions.get(key);
    if (value) { sessions.delete(key); await value.executor.dispose(); }
    return text("当前会话的浏览器连接和 state 已清空。浏览器标签页保留；下次执行时重新连接。");
  }
  async function help() {
    if (!engine) await start();
    return text((await readFile(join(engine.root, "node_modules/playwriter/dist/prompt.md"), "utf8")).slice(0, 60_000));
  }
  async function testConnection(workspace) {
    const scope = { sessionId: "__connection-test__", workspace };
    try {
      return await execute({ code: `const tab = await context.newPage(); try { await tab.setContent('<title>Belfry 连接测试</title><label>测试输入<input aria-label="测试输入"></label><button>验证</button><output></output><script>document.querySelector("button").onclick=()=>document.querySelector("output").textContent=document.querySelector("input").value<\/script>'); await tab.getByRole('textbox', { name: '测试输入' }).fill('Belfry 已连接'); await tab.getByRole('button', { name: '验证' }).click(); console.log(await tab.locator('output').textContent()); } finally { await tab.close(); }` }, scope);
    } finally { await reset(scope); }
  }
  async function stop() {
    closed = true; phase = "stopped"; shutdown.abort(new Error("插件已停止"));
    const disposals = [...sessions.values()].map(value => value.executor.dispose()); sessions.clear();
    await Promise.allSettled(disposals);
    ownedRelay?.close(); ownedRelay = null;
  }
  return { start, status, execute, reset, help, testConnection, stop };
}
