const $ = id => document.getElementById(id);
let refreshing = false, testing = false;
const invoke = channel => window.pluginBridge.invoke(channel);
function notice(message, error = false) { $("notice").hidden = !message; $("notice").textContent = message; $("notice").classList.toggle("error", error); }
function render(status) {
  const connected = status.extensions.length > 0, ready = status.phase === "ready" && status.relayRunning;
  const state = status.phase === "error" ? "error" : connected ? "connected" : "waiting";
  $("badge").dataset.state = state;
  $("badge").textContent = state === "error" ? "连接异常" : connected ? "已连接" : status.phase === "preparing" ? "准备组件中" : "等待浏览器";
  $("status-message").textContent = state === "error" ? status.lastError : connected
    ? "浏览器已连接，可以测试连接或在 Belfry 的 Agent 中开始任务。"
    : status.phase === "preparing" ? "正在准备内置运行组件，首次使用需要稍等片刻。"
    : "本地服务就绪。请在 Chrome 中点击 Playwriter 扩展图标，连接需要操作的网页。";
  $("engine").textContent = `Playwriter ${status.engineVersion}`;
  $("relay").textContent = ready ? "已启动" : status.phase === "preparing" ? "准备中" : "未启动";
  $("browsers").textContent = String(status.extensions.length);
  $("test").disabled = testing || !connected || !ready;
  $("connect").hidden = ready || status.phase === "preparing";
}
async function refresh() {
  if (refreshing || document.hidden) return;
  refreshing = true;
  try { render(await invoke("playwriter.status")); }
  catch (error) { notice(error.message, true); }
  finally { refreshing = false; }
}
$("refresh").onclick = refresh;
for (const [id, channel] of [["install", "playwriter.installExtension"], ["docs", "playwriter.openDocs"]]) {
  $(id).onclick = async () => { try { await invoke(channel); } catch (error) { notice(error.message, true); } };
}
$("connect").onclick = async () => { try { render(await invoke("playwriter.connect")); } catch (error) { notice(error.message, true); } };
$("test").onclick = async () => {
  testing = true; $("test").disabled = true; $("test").textContent = "正在测试…"; notice("");
  try {
    const result = await invoke("playwriter.test");
    const message = result.content.filter(item => item.type === "text").map(item => item.text).join("\n");
    notice(result.isError ? message : "连接测试通过。网页读取、输入和点击均正常，可以向 Agent 下任务了。", result.isError);
  } catch (error) { notice(error.message, true); }
  finally { testing = false; $("test").textContent = "测试连接"; await refresh(); }
};
try {
  const appearance = await window.pluginBridge.invoke("app.getAppearance");
  if (appearance?.theme) document.documentElement.dataset.theme = appearance.theme;
} catch {}
await refresh();
const timer = setInterval(refresh, 2000);
window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
