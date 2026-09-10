"""从源码和所有已发布包生成目录；重建不会改写历史版本。"""
from datetime import datetime, timezone
import re
from .common import directory, json_bytes, read_json, source_files, atomic_write
from .manifest import validate_files, version_key, string_list
from .package import read_package


def configuration(root):
    config = read_json(root / "marketplace.json")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", config.get("repository", "")):
        raise ValueError("marketplace.repository 必须是 owner/repo")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", config.get("branch", "main")):
        raise ValueError("marketplace.branch 无效")
    for key in ["name", "providerId"]:
        if not isinstance(config.get(key), str) or not config[key].strip():
            raise ValueError(f"marketplace.{key} 不能为空")
    return config


def source_plugins(root):
    sources = {}
    source_root = directory(root / "plugins")
    for path in sorted(source_root.iterdir()):
        if path.name.startswith("."):
            continue
        files = source_files(path)
        manifest = validate_files(files)
        if path.name != manifest["id"]:
            raise ValueError(f"插件目录名称需要与 id 相同：{path.name}")
        sources[manifest["id"]] = {"manifest": manifest, "files": files}
    return sources


def previous_versions(root):
    path = root / "catalog.json"
    if not path.exists():
        return {}
    catalog = read_json(path)
    return {(plugin["id"], version["version"]): version
            for plugin in catalog["plugins"] for version in plugin["versions"]}


def release_version(package, previous):
    manifest, path = package["manifest"], package["path"]
    expected = f"{manifest['id']}-{manifest['version']}.piplug"
    if path.name != expected:
        raise ValueError(f"插件包文件名与清单不一致：{path.name}")
    old = previous.get((manifest["id"], manifest["version"]), {})
    if old and old.get("shasum") != package["shasum"]:
        raise ValueError(f"已发布包的摘要改变；发布版本不可变：{path.name}")
    published = old.get("publishedAt") or datetime.now(timezone.utc).isoformat(timespec="seconds")
    changelog = package["files"].get("CHANGELOG.md", b"").decode("utf-8")
    notices = {key: old[key] for key in ["yanked", "yankedReason"] if key in old}
    result = {**notices, "version": manifest["version"], "publishedAt": published,
              "url": f"packages/{path.name}", "shasum": package["shasum"],
              "sizeBytes": package["sizeBytes"], "permissions": manifest["permissions"]}
    if changelog:
        result["changelog"] = changelog
    for field in ["fs", "net"]:
        if field in manifest:
            result[field] = manifest[field]
    engine = manifest.get("engines", {}).get("piDesktop", "")
    if engine.startswith(">="):
        result["minPiDesktop"] = engine[2:].strip()
    return result


def releases(root, sources, previous):
    result = {identity: [] for identity in sources}
    for path in sorted(directory(root / "packages").glob("*.piplug")):
        package = read_package(path)
        identity = package["manifest"]["id"]
        if identity not in sources:
            raise ValueError(f"发布包缺少对应源码目录：{identity}")
        version = release_version(package, previous)
        validate_current_source(package, sources[identity])
        result[identity].append(version)
    for identity, versions in result.items():
        versions.sort(key=lambda item: version_key(item["version"]), reverse=True)
        published = {version["version"] for version in versions}
        if sources[identity]["manifest"]["version"] not in published:
            raise ValueError(f"当前源码版本尚未打包：{identity}；请运行 pack_plugin.py")
    actual = {(identity, item["version"]) for identity, items in result.items() for item in items}
    if set(previous) - actual:
        raise ValueError("不能丢失已发布版本；撤回请保留包并设置 yanked")
    return result


def validate_current_source(package, source):
    if package["manifest"]["version"] != source["manifest"]["version"]:
        return
    if package["files"] != source["files"]:
        raise ValueError(f"源码与发布包不一致：{source['manifest']['id']}；请提高版本并重新打包")


def plugin_entry(source, versions, config):
    manifest = source["manifest"]
    identity = manifest["id"]
    repository = f"https://github.com/{config['repository']}"
    branch = config.get("branch", "main")
    entry = {key: manifest[key] for key in ["id", "name", "description", "author"]}
    entry.update({"categories": string_list(manifest.get("categories", ["community"]), "categories"),
                  "repository": f"{repository}/tree/{branch}/plugins/{identity}",
                  "homepage": manifest.get("homepage", repository), "trust": "community",
                  "readmeMarkdown": source["files"].get("README.md", b"").decode("utf-8"),
                  "versions": versions})
    for field in ["i18n", "safetyNotes", "screenshots", "license"]:
        if field in manifest:
            entry[field] = manifest[field]
    return entry


def build_catalog(root):
    root = directory(root)
    config, sources = configuration(root), source_plugins(root)
    versions = releases(root, sources, previous_versions(root))
    plugins = [plugin_entry(source, versions[identity], config)
               for identity, source in sources.items()]
    dates = [version["publishedAt"] for items in versions.values() for version in items]
    return {"schemaVersion": 1, "providerId": config["providerId"], "name": config["name"],
            "homepage": config.get("homepage", f"https://github.com/{config['repository']}"),
            "updatedAt": max(dates, default="1970-01-01T00:00:00+00:00"), "plugins": plugins}


def write_catalog(root, catalog):
    atomic_write(root / "catalog.json", json_bytes(catalog))
