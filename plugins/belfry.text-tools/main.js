// pi 由 Belfry / PI 插件宿主注入。
async function onLoad() {
  await pi.agent.registerTool({ name: "inspect_text", description: "统计文本字符、词语和行数",
    risk: "low", schema: { type: "object", properties: { text: { type: "string" } },
      required: ["text"], additionalProperties: false }, execute: inspectText });
}
async function onUnload() {
  await pi.agent.unregisterTool("inspect_text");
}

function inspectText(args) {
  const text = String(args.text ?? "");
  const result = { characters: [...text].length,
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    lines: text ? text.split(/\r?\n/u).length : 0 };
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

module.exports = { onLoad, onUnload };
