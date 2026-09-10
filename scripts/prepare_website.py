#!/usr/bin/env python3
"""将已校验的目录和包放入静态网站，下载不依赖另一个服务器。"""
from plugin_center.catalog import build_catalog
from plugin_center.cli import ROOT, run
from plugin_center.common import atomic_write, json_bytes, read_file


def main():
    catalog = build_catalog(ROOT)
    if json_bytes(catalog) != read_file(ROOT / "catalog.json"):
        raise ValueError("目录尚未同步，请先运行 rebuild_catalog.py")
    public = ROOT / "website" / "public"
    atomic_write(public / "catalog.json", json_bytes(catalog))
    for plugin in catalog["plugins"]:
        for version in plugin["versions"]:
            path = version["url"]
            atomic_write(public / path, read_file(ROOT / path))
    atomic_write(public / ".nojekyll", b"")
    print(f"OK website assets · {len(catalog['plugins'])} plugins")


if __name__ == "__main__":
    run(main)
