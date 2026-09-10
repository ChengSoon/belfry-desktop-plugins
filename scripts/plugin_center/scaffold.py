"""四种可直接开发加载的模板，自动生成 manifest.json。"""
from .common import directory, json_bytes
from .manifest import valid_id, validate_files
from .template_main import main_source
from .template_panel import panel_source

TEMPLATES = ("panel-basic", "agent-tool-basic", "skill-pack", "full-demo")
GUIDE = """---
name: review-changes
description: 审查当前工作区修改，报告可复现的问题与验证方法。
---

# 审查工作区修改

1. 阅读项目约定和当前 diff，确认任务范围。
2. 沿调用链核对行为、权限边界、取消与异常处理。
3. 运行与修改直接相关的测试；明确记录无法验证的项目。
4. 只报告有证据的问题，给出文件位置、触发方式和建议。
5. 未经用户要求，不提交、不推送、不修改无关文件。
"""


def template_manifest(options):
    panel = options["template"] in {"panel-basic", "full-demo"}
    tool = options["template"] in {"agent-tool-basic", "full-demo"}
    skill = options["template"] in {"skill-pack", "full-demo"}
    contributes, permissions = {}, []
    if panel:
        contributes["commands"] = [{"id": options["id"] + ".open", "title": "打开 " + options["name"]}]
        permissions.append("ui.panel")
    if tool:
        contributes["agentTools"] = [{"name": "inspect_text", "description": "统计文本字符、词语和行数",
                                      "risk": "low", "schema": {"type": "object",
                                      "properties": {"text": {"type": "string"}}, "required": ["text"]}}]
        permissions.append("agent.tool.register")
    if skill:
        contributes["skills"] = ["skills/review.md"]
        permissions.append("agent.prompt.inject")
    manifest = {"schemaVersion": 1, "id": valid_id(options["id"]), "name": options["name"],
                "version": "0.1.0", "description": "使用 Belfry 插件中心模板创建的插件。",
                "author": options["author"], "license": "MIT", "main": "main.js",
                "categories": ["community", "template"], "permissions": permissions,
                "engines": {"piDesktop": ">=0.1.0"}, "activationEvents": ["onStartup"],
                "contributes": contributes}
    if panel:
        manifest["ui"] = {"panel": "renderer/index.html", "title": options["name"]}
    return manifest, {**options, "panel": panel, "tool": tool, "skill": skill}


def scaffold_files(options):
    if options.get("template") not in TEMPLATES:
        raise ValueError(f"请选择模板：{', '.join(TEMPLATES)}")
    manifest, features = template_manifest(options)
    files = {"manifest.json": json_bytes(manifest), "main.js": main_source(features).encode(),
             "README.md": f"# {options['name']}\n\n在 Belfry 插件中心加载开发目录，编辑后自动重载。\n".encode(),
             "CHANGELOG.md": b"## 0.1.0\n\nInitial release.\n"}
    if features["panel"]:
        files["renderer/index.html"] = panel_source(options["name"]).encode()
    if features["skill"]:
        files["skills/review.md"] = GUIDE.encode()
    validate_files(files)
    return files


def create_plugin(root, options):
    identity = valid_id(options.get("id"))
    files = scaffold_files(options)
    parent = directory(root / "plugins")
    target = parent / identity
    if target.exists() or target.is_symlink():
        raise ValueError(f"目标插件目录已存在：{target}")
    target.mkdir(parents=True)
    for name, data in files.items():
        path = target / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return target
