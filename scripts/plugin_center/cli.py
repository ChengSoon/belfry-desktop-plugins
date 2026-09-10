"""命令行公共入口。"""
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]


def run(operation):
    try:
        operation()
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile) as error:
        print(f"错误：{error}", file=sys.stderr)
        raise SystemExit(1) from error


def selected_plugins(arguments):
    if arguments.all:
        return sorted(path for path in (ROOT / "plugins").iterdir() if not path.name.startswith("."))
    if not arguments.plugins:
        raise ValueError("请提供插件目录，或使用 --all")
    return [Path(path) for path in arguments.plugins]
