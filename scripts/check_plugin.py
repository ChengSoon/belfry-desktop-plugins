#!/usr/bin/env python3
"""检查清单、声明资源、权限、链接和包容量。"""
import argparse
from plugin_center.cli import run, selected_plugins
from plugin_center.common import source_files
from plugin_center.manifest import validate_files
from plugin_center.package import package_bytes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugins", nargs="*")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    for path in selected_plugins(args):
        files = source_files(path)
        manifest = validate_files(files)
        data = package_bytes(files)
        print(f"OK {manifest['id']}@{manifest['version']} · {len(files)} files · {len(data)} bytes")


if __name__ == "__main__":
    run(main)
