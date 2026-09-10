// pi 由 Belfry / PI 插件宿主注入。
async function onLoad() {
  await pi.commands.register({ id: "belfry.quick-notes.open", title: "打开 工作便笺",
    run: () => pi.ui.openPanel() });
}
async function onUnload() {
  await pi.commands.unregister("belfry.quick-notes.open");
}

const MAX_NOTE_LENGTH = 8000;
async function onPanelInvoke(channel, payload) {
  if (channel === "notes.read") return (await pi.plugin.getSettings()).note ?? "";
  if (channel === "notes.save") {
    const text = String(payload?.text ?? "");
    if (text.length > MAX_NOTE_LENGTH) throw new Error("便笺最多 8000 个字符");
    await pi.plugin.setSettings({ note: text });
    return { saved: true };
  }
  throw new Error("未知面板消息");
}

module.exports = { onLoad, onUnload, onPanelInvoke };
