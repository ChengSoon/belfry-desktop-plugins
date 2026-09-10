"""模板入口通过宿主公开的 pi API 工作。"""
import json

PANEL_HANDLERS = '''
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
'''
TOOL_HANDLER = '''
function inspectText(args) {
  const text = String(args.text ?? "");
  const result = { characters: [...text].length,
    words: text.trim() ? text.trim().split(/\\s+/u).length : 0,
    lines: text ? text.split(/\\r?\\n/u).length : 0 };
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}
'''


def main_source(options):
    identity = json.dumps(options["id"] + ".open", ensure_ascii=False)
    title = json.dumps("打开 " + options["name"], ensure_ascii=False)
    load, unload = [], []
    if options["panel"]:
        load += [f"  await pi.commands.register({{ id: {identity}, title: {title},",
                 "    run: () => pi.ui.openPanel() });"]
        unload += [f"  await pi.commands.unregister({identity});"]
    if options["tool"]:
        load += ['  await pi.agent.registerTool({ name: "inspect_text", description: "统计文本字符、词语和行数",',
                 '    risk: "low", schema: { type: "object", properties: { text: { type: "string" } },',
                 '      required: ["text"], additionalProperties: false }, execute: inspectText });']
        unload += ['  await pi.agent.unregisterTool("inspect_text");']
    blocks = ["// pi 由 Belfry / PI 插件宿主注入。", "async function onLoad() {",
              *load, "}", "async function onUnload() {", *unload, "}"]
    if options["panel"]:
        blocks.append(PANEL_HANDLERS)
    if options["tool"]:
        blocks.append(TOOL_HANDLER)
    exports = "onLoad, onUnload" + (", onPanelInvoke" if options["panel"] else "")
    blocks.append(f"module.exports = {{ {exports} }};\n")
    return "\n".join(blocks)
