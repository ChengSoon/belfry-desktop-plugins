"""可重复的 ZIP Store 包，兼容 PI / Belfry 的 .piplug。"""
import hashlib
import io
from pathlib import Path
import stat
import zipfile
from . import common
from .manifest import validate_files

ZIP_EPOCH = (1980, 1, 1, 0, 0, 0)


def package_bytes(files):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, ZIP_EPOCH)
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(info, data)
    result = output.getvalue()
    if len(result) > common.MAX_BYTES:
        raise ValueError("插件包超过容量限制")
    return result


def pack_plugin(source, output):
    files = common.source_files(source)
    manifest = validate_files(files)
    name = f"{manifest['id']}-{manifest['version']}.piplug"
    target = common.directory(output) / name
    data = package_bytes(files)
    common.immutable_write(target, data)
    return target


def archive_files(archive):
    entries = archive.infolist()
    if len(entries) > common.MAX_FILES:
        raise ValueError("插件包文件数量超过限制")
    files, total = {}, 0
    for entry in entries:
        name = common.resource_path(entry.filename)
        mode = entry.external_attr >> 16
        if name in files or stat.S_ISLNK(mode):
            raise ValueError("插件包不能包含重复路径或符号链接")
        if entry.compress_type != zipfile.ZIP_STORED or entry.flag_bits & 1:
            raise ValueError("插件包必须是未加密的 ZIP Store")
        total += entry.file_size
        if total > common.MAX_BYTES:
            raise ValueError("插件包内容超过容量限制")
        files[name] = archive.read(entry)
    return files


def read_package(path):
    data = common.read_file(path)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        files = archive_files(archive)
    manifest = validate_files(files)
    return {"manifest": manifest, "files": files, "sizeBytes": len(data),
            "shasum": hashlib.sha256(data).hexdigest(), "path": Path(path)}
