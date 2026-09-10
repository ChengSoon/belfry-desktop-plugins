"""保证发布路径在 macOS、Windows 和 Linux 上指向同一组文件。"""
import re
import unicodedata
from .common import resource_path

MAX_PATH_BYTES = 1024
MAX_DEPTH = 12
MAX_ENTRIES = 4000
RESERVED = {"CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$"}
DEVICE = re.compile(r"(?:COM|LPT)[1-9¹²³]$")


def portable_parts(path):
    name = resource_path(path)
    if len(name.encode("utf-8")) > MAX_PATH_BYTES or any(unicodedata.category(char) == "Cc" for char in name):
        raise ValueError(f"路径过长或包含控制字符：{path}")
    if any(char in name for char in '<>"|?*'):
        raise ValueError(f"Windows 不支持此路径：{path}")
    parts = name.split("/")
    if len(parts) - 1 > MAX_DEPTH:
        raise ValueError("插件目录层数超过限制")
    for part in parts:
        if invalid_component(part):
            raise ValueError(f"Windows 不支持此路径名称：{path}")
    return parts


def invalid_component(part):
    base = part.split(".", 1)[0].upper()
    return part.endswith((".", " ")) or base in RESERVED or DEVICE.fullmatch(base) is not None


def reserve(parts, nodes):
    for index in range(len(parts)):
        path = "/".join(parts[:index + 1])
        key, is_file = path.lower(), index == len(parts) - 1
        previous = nodes.get(key)
        if previous and (previous[0] != path or previous[1] or is_file):
            raise ValueError(f"路径重名或文件/目录冲突：{path}")
        nodes[key] = (path, is_file)
        if len(nodes) > MAX_ENTRIES:
            raise ValueError("插件文件与目录总数量超过限制")


def validate_paths(files):
    nodes = {}
    for path in files:
        reserve(portable_parts(path), nodes)
