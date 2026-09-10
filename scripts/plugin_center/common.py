"""有界读取、路径与原子写入。"""
import json
import os
from pathlib import Path, PurePosixPath
import tempfile

MAX_BYTES = 50 * 1024 * 1024
MAX_FILES = 2000
MAX_JSON_BYTES = 8 * 1024 * 1024
IGNORED = {".git", ".DS_Store", "node_modules", "__pycache__", ".next"}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"JSON 字段重复：{key}")
        result[key] = value
    return result


def decode_json(data):
    if len(data) > MAX_JSON_BYTES:
        raise ValueError("JSON 超过容量限制")
    return json.loads(data, object_pairs_hook=unique_object)


def read_json(path):
    return decode_json(read_file(path, MAX_JSON_BYTES))


def read_file(path, limit=MAX_BYTES):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"需要普通文件，不能是符号链接：{path}")
    with path.open("rb") as stream:
        data = stream.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"文件超过容量限制：{path}")
    return data


def resource_path(value):
    if not isinstance(value, str) or not value:
        raise ValueError("资源路径不能为空")
    if any(ord(char) < 32 for char in value) or "\\" in value or ":" in value:
        raise ValueError(f"资源路径无效：{value}")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError(f"资源路径必须位于插件目录内：{value}")
    return str(PurePosixPath(value))


def directory(path):
    path = Path(path).absolute()
    if path.is_symlink():
        raise ValueError(f"目录不能是符号链接：{path}")
    if path.exists() and not path.is_dir():
        raise ValueError(f"需要目录：{path}")
    return path.resolve()


def source_files(root):
    root = directory(root)
    files, total = {}, 0
    for parent, folders, names in os.walk(root, followlinks=False):
        reject_links(parent, [*folders, *names])
        folders[:] = sorted(name for name in folders if name not in IGNORED)
        for name in sorted(names):
            if ignored_file(name):
                continue
            path = Path(parent) / name
            key = resource_path(path.relative_to(root).as_posix())
            if len(files) >= MAX_FILES:
                raise ValueError("插件文件数量超过容量限制")
            files[key] = read_file(path, MAX_BYTES - total)
            total += len(files[key])
    return dict(sorted(files.items()))


def ignored_file(name):
    return name in IGNORED or name == ".env" or name.startswith(".env.")


def reject_links(parent, names):
    for name in names:
        if (Path(parent) / name).is_symlink():
            raise ValueError(f"插件不能包含符号链接：{name}")


def immutable_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix=".package-")
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
        try:
            os.link(temporary, path)
        except FileExistsError:
            if read_file(path) != data:
                raise ValueError(f"已发布版本不可变，请提高 version：{path.name}")
    finally:
        Path(temporary).unlink(missing_ok=True)


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def atomic_write(path, data):
    path = Path(path)
    directory(path.parent).mkdir(parents=True, exist_ok=True)
    if path.is_symlink():
        raise ValueError(f"不能覆盖符号链接：{path}")
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix=".publish-")
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)
