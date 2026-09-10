#!/usr/bin/env python3
"""从模板创建一个插件，自动写入清单和入口。"""
import argparse
from plugin_center.cli import ROOT, run
from plugin_center.scaffold import TEMPLATES, create_plugin


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("id", help="插件 ID，例如 myteam.notes")
    parser.add_argument("--name", required=True, help="显示名称")
    parser.add_argument("--author", required=True, help="作者")
    parser.add_argument("--template", choices=TEMPLATES, default="panel-basic")
    options = vars(parser.parse_args())
    print(create_plugin(ROOT, options))
    print("在 Belfry → 插件 → 加载开发插件中选择这个目录，即可开始调试。")


if __name__ == "__main__":
    run(main)
