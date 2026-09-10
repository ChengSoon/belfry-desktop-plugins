"""校验 PI 兼容清单；最终安装仍由宿主执行完整校验。"""
import re
from .common import decode_json, resource_path
from .paths import validate_paths

ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$")
VERSION = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
                     r"(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?"
                     r"(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$")
PERMISSIONS = {
    "ui.panel", "ui.view", "ui.theme", "notify", "clipboard.read", "clipboard.write",
    "fs.read", "fs.write", "fs.delete", "fs.read.workspace", "fs.write.workspace",
    "fs.delete.workspace", "shell.openExternal", "net.fetch", "agent.tool.register",
    "agent.prompt.inject", "agent.complete", "models.list", "session.read",
    "mcp.server.local", "mcp.server.remote", "background.service", "bus.publish",
    "bus.subscribe", "browser.cdp", "browser.control", "browser.read",
    "browser.interact", "browser.evaluate",
}
CONTRIBUTIONS = {"commands": "id", "agentTools": "name", "settings": "key",
                 "views": "id", "themes": "id", "services": "id", "mcpServers": "id"}
REQUIRED_PERMISSIONS = {"agentTools": "agent.tool.register", "skills": "agent.prompt.inject",
                        "views": "ui.view", "themes": "ui.theme", "services": "background.service"}


def valid_id(value):
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise ValueError("插件 ID 无效")
    if ".." in value or value.endswith("."):
        raise ValueError("插件 ID 无效")
    return value


def version_key(value):
    matched = VERSION.fullmatch(value) if isinstance(value, str) else None
    if not matched:
        raise ValueError(f"版本必须是 SemVer：{value}")
    major, minor, patch, pre, _ = matched.groups()
    identifiers = pre.split(".") if pre else []
    if any(item.isdigit() and len(item) > 1 and item.startswith("0") for item in identifiers):
        raise ValueError("预发布版本的数字不能有前导零")
    suffix = tuple((0, int(item)) if item.isdigit() else (1, item) for item in identifiers)
    return (int(major), int(minor), int(patch), not bool(pre), suffix)


def string_list(value, label):
    if not isinstance(value, list) or any(not isinstance(item, str) or not item for item in value):
        raise ValueError(f"{label} 必须是非空字符串数组")
    if len(set(value)) != len(value):
        raise ValueError(f"{label} 不能重复")
    return value


def validate_contributions(manifest):
    contributions = manifest.get("contributes", {})
    if not isinstance(contributions, dict) or "harnesses" in contributions:
        raise ValueError("contributes 无效；不支持 Harness")
    for kind, key in CONTRIBUTIONS.items():
        validate_group(contributions.get(kind, []), key, kind)
    for kind, permission in REQUIRED_PERMISSIONS.items():
        if contributions.get(kind) and permission not in manifest["permissions"]:
            raise ValueError(f"{kind} 缺少权限：{permission}")
    if manifest.get("ui", {}).get("panel") and "ui.panel" not in manifest["permissions"]:
        raise ValueError("面板缺少 ui.panel 权限")


def validate_group(entries, key, label):
    if not isinstance(entries, list) or len(entries) > 100:
        raise ValueError(f"{label} 贡献列表无效")
    identities = [valid_id(item.get(key)) for item in entries if isinstance(item, dict)]
    if len(identities) != len(entries):
        raise ValueError(f"{label} 贡献无效")
    string_list(identities, label)


def resources(manifest):
    result = [manifest["main"]]
    result += [value for value in [manifest.get("icon"), manifest.get("ui", {}).get("panel")] if value]
    for kind, field in [("skills", "path"), ("views", "entry"), ("themes", "path")]:
        for entry in manifest.get("contributes", {}).get(kind, []):
            result.append(entry if isinstance(entry, str) else entry.get(field))
    return [resource_path(value) for value in result]


def validate_metadata(manifest):
    if not isinstance(manifest, dict) or manifest.get("schemaVersion") != 1:
        raise ValueError("manifest.schemaVersion 必须为 1")
    valid_id(manifest.get("id"))
    version_key(manifest.get("version"))
    for field in ["name", "description", "author"]:
        if not isinstance(manifest.get(field), str) or not manifest[field].strip():
            raise ValueError(f"发布到市场需要 {field}")
    for field in ["ui", "fs", "net", "engines"]:
        if field in manifest and not isinstance(manifest[field], dict):
            raise ValueError(f"{field} 必须是对象")


def validate_files(files):
    validate_paths(files)
    if "manifest.json" not in files:
        raise ValueError("缺少 manifest.json；请用 new_plugin.py 创建插件")
    manifest = decode_json(files["manifest.json"])
    validate_metadata(manifest)
    permissions = string_list(manifest.get("permissions", []), "permissions")
    manifest["permissions"] = permissions
    if set(permissions) - PERMISSIONS:
        raise ValueError(f"未知权限：{set(permissions) - PERMISSIONS}")
    if not resource_path(manifest.get("main")).endswith((".js", ".cjs", ".mjs")):
        raise ValueError("main 必须是 JavaScript 文件路径")
    validate_contributions(manifest)
    for name in resources(manifest):
        if name not in files:
            raise ValueError(f"缺少声明的资源路径：{name}")
    return manifest
