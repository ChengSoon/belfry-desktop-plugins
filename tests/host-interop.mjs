// 用真实 Belfry 插件宿主检查发布产物，需指定 BELFRY_DESKTOP_ROOT。
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const desktop = process.env.BELFRY_DESKTOP_ROOT;
if (!desktop) throw new Error("请设置 BELFRY_DESKTOP_ROOT 为 Belfry 源码目录");
process.chdir(desktop);
const fromDesktop = (path) => import(pathToFileURL(resolve(desktop, path)).href);
const { host, temporary } = await fromDesktop("scripts/plugin-tests/support.mjs");
const { validateManifest } = await fromDesktop("src-tauri/src/plugins/node/manifest.mjs");
const { PluginMarket } = await fromDesktop("src-tauri/src/plugins/node/market.mjs");
const { PluginManagement } = await fromDesktop("src-tauri/src/plugins/node/management.mjs");

async function unpack(path, output) {
  const script = "import sys,zipfile;zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])";
  const result = spawnSync("python3", ["-c", script, path, output], { encoding: "utf8" });
  assert.equal(0, result.status, result.stderr);
  return { path: output, manifest: validateManifest(JSON.parse(await readFile(join(output, "manifest.json"), "utf8"))) };
}

async function marketFixture(t) {
  const base = await temporary(t);
  const catalog = JSON.parse(await readFile(join(root, "catalog.json"), "utf8"));
  const packages = new Map(await Promise.all(catalog.plugins.flatMap((plugin) => plugin.versions.map(async (version) =>
    [`/${version.url}`, await readFile(join(root, version.url))]))));
  const server = createServer((request, response) => {
    if (request.url === "/catalog.json") return response.end(JSON.stringify(catalog));
    if (packages.has(request.url)) return response.end(packages.get(request.url));
    response.writeHead(404); response.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const management = await new PluginManagement(base).init();
  const source = `http://127.0.0.1:${server.address().port}/catalog.json`;
  await management.setSource({ pluginMarketSource: "custom", pluginMarketCustomUrl: source });
  const market = new PluginMarket({ base, management, installed: () => [] });
  return { base, catalog, market };
}

async function panelInvoke(surface, api, payload) {
  const url = new URL(surface.url);
  const endpoint = new URL(url.pathname.slice(0, url.pathname.indexOf("/renderer/")) + "/__invoke", url.origin);
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Origin: url.origin },
    body: JSON.stringify({ api, payload }) });
  const result = await response.json();
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

test("catalog downloads every immutable package and the real host loads all contributions", async (t) => {
  const { base, catalog, market } = await marketFixture(t);
  const runtime = await host(t, base);
  await market.refresh();
  assert.equal(catalog.plugins.length, (await market.search()).plugins.length);
  for (const plugin of catalog.plugins) {
    const prepared = await market.prepare({ id: plugin.id });
    const entry = await unpack(prepared.path, join(base, plugin.id));
    assert.equal(plugin.id, entry.manifest.id);
    await runtime.call("load", entry);
  }
  const contributions = await runtime.call("catalog");
  assert.equal(3, contributions.plugins.length);
  assert.equal(1, contributions.tools.length);
  assert.equal(1, contributions.skills.length);
  const result = await runtime.call("tool", { pluginId: "belfry.text-tools", name: "inspect_text", args: { text: "hello 世界\nnext" } });
  assert.deepEqual({ characters: 13, words: 3, lines: 2 }, JSON.parse(result.content[0].text));
  assert.match(await runtime.call("skill", { pluginId: "belfry.review-guide", path: "skills/review.md" }), /当前 diff/);
});

test("packaged notes panel saves Unicode, persists on reload and rejects oversized input", async (t) => {
  const { base, market } = await marketFixture(t);
  let opened;
  const runtime = await host(t, base, { platform: (message) => { opened = message; return null; } });
  const prepared = await market.prepare({ id: "belfry.quick-notes" });
  const entry = await unpack(prepared.path, join(base, "notes"));
  await runtime.call("load", entry);
  await runtime.call("command", { pluginId: entry.manifest.id, commandId: entry.manifest.id + ".open" });
  assert.ok(opened.url);
  assert.match(await (await fetch(opened.url)).text(), /工作便笺/);
  assert.equal("", await panelInvoke(opened, "notes.read"));
  assert.deepEqual({ saved: true }, await panelInvoke(opened, "notes.save", { text: "下一步：完成插件中心 🚀" }));
  await assert.rejects(panelInvoke(opened, "notes.save", { text: "a".repeat(8001) }), /8000/);
  await runtime.call("unload", { pluginId: entry.manifest.id });
  await runtime.call("load", entry);
  await runtime.call("command", { pluginId: entry.manifest.id, commandId: entry.manifest.id + ".open" });
  assert.equal("下一步：完成插件中心 🚀", await panelInvoke(opened, "notes.read"));
});

test("all four generated templates satisfy the real host manifest and activate", async (t) => {
  const base = await temporary(t), runtime = await host(t, base);
  const script = "import sys,json;from pathlib import Path;sys.path.insert(0,sys.argv[1]);from plugin_center.scaffold import create_plugin;print(create_plugin(Path(sys.argv[2]),json.loads(sys.argv[3])))";
  for (const template of ["panel-basic", "agent-tool-basic", "skill-pack", "full-demo"]) {
    const options = { id: "test." + template, name: "模板校验", author: "Test", template };
    const result = spawnSync("python3", ["-c", script, join(root, "scripts"), base, JSON.stringify(options)], { encoding: "utf8" });
    assert.equal(0, result.status, result.stderr);
    const path = result.stdout.trim();
    const manifest = validateManifest(JSON.parse(await readFile(join(path, "manifest.json"), "utf8")));
    await runtime.call("load", { path, manifest });
  }
  assert.equal(4, (await runtime.call("catalog")).plugins.length);
});
