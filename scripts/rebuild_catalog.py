#!/usr/bin/env python3
"""重建 PI 兼容市场目录，--check 只验证而不改写。"""
import argparse
from plugin_center.catalog import build_catalog, write_catalog
from plugin_center.cli import ROOT, run
from plugin_center.common import json_bytes, read_file


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="检查已提交目录与发布包的一致性")
    args = parser.parse_args()
    catalog = build_catalog(ROOT)
    if args.check:
        if read_file(ROOT / "catalog.json") != json_bytes(catalog):
            raise ValueError("目录需要重建：python3 scripts/rebuild_catalog.py")
    else:
        write_catalog(ROOT, catalog)
    print(f"OK catalog.json · {len(catalog['plugins'])} plugins")


if __name__ == "__main__":
    run(main)
