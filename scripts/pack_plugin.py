#!/usr/bin/env python3
"""生成不可变的 .piplug 文件；同版本仅允许内容相同的重复打包。"""
import argparse
from plugin_center.cli import ROOT, run, selected_plugins
from plugin_center.package import pack_plugin


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugins", nargs="*")
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    for path in selected_plugins(args):
        print(pack_plugin(path, ROOT / "packages"))


if __name__ == "__main__":
    run(main)
