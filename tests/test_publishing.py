"""发布行为测试：包不可变、历史可追溯、目录能被宿主消费。"""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from plugin_center.catalog import build_catalog, write_catalog
from plugin_center.package import pack_plugin, read_package
from plugin_center.scaffold import create_plugin


class PublishingTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.config = {"name": "测试市场", "repository": "owner/plugins",
                       "branch": "main", "providerId": "test.plugins"}
        (self.root / "marketplace.json").write_text(json.dumps(self.config))
        self.plugin = create_plugin(self.root, {
            "id": "mine.notes", "name": "便笺", "author": "Author",
            "template": "panel-basic"})

    def release(self):
        package = pack_plugin(self.plugin, self.root / "packages")
        catalog = build_catalog(self.root)
        write_catalog(self.root, catalog)
        return package, catalog

    def change_version(self, version):
        path = self.plugin / "manifest.json"
        manifest = json.loads(path.read_text())
        manifest["version"] = version
        path.write_text(json.dumps(manifest))

    def test_package_is_reproducible_and_identical_republish_is_allowed(self):
        first, catalog = self.release()
        before = first.read_bytes()
        self.assertEqual(first, pack_plugin(self.plugin, self.root / "packages"))
        self.assertEqual(before, first.read_bytes())
        version = catalog["plugins"][0]["versions"][0]
        self.assertEqual(hashlib.sha256(before).hexdigest(), version["shasum"])
        self.assertEqual(len(before), version["sizeBytes"])
        self.assertEqual("packages/mine.notes-0.1.0.piplug", version["url"])
        self.assertEqual(catalog, build_catalog(self.root))

    def test_republishing_changed_bytes_preserves_released_package(self):
        package, _ = self.release()
        before = package.read_bytes()
        with (self.plugin / "main.js").open("a") as stream:
            stream.write("\n// changed\n")
        with self.assertRaisesRegex(ValueError, "版本|version"):
            pack_plugin(self.plugin, self.root / "packages")
        self.assertEqual(before, package.read_bytes())

    def test_catalog_retains_old_releases_and_orders_semver(self):
        _, first = self.release()
        for version in ["1.0.0-beta.10", "1.0.0-beta.2", "1.0.0"]:
            self.change_version(version)
            _, catalog = self.release()
        versions = catalog["plugins"][0]["versions"]
        self.assertEqual(["1.0.0", "1.0.0-beta.10", "1.0.0-beta.2", "0.1.0"],
                         [version["version"] for version in versions])
        self.assertEqual(first["plugins"][0]["versions"][0], versions[-1])
        self.assertNotIn("downloads", catalog["plugins"][0])
        self.assertFalse(catalog["plugins"][0].get("verified", False))

    def test_catalog_detects_tampered_existing_package(self):
        package, _ = self.release()
        with zipfile.ZipFile(package, "a") as archive:
            archive.writestr("tampered.txt", "changed")
        with self.assertRaisesRegex(ValueError, "摘要|不可变"):
            build_catalog(self.root)

    def test_catalog_rejects_source_without_its_release(self):
        self.release()
        self.change_version("0.2.0")
        with self.assertRaisesRegex(ValueError, "打包|package"):
            build_catalog(self.root)

    def test_catalog_check_catches_source_changed_without_a_new_release(self):
        self.release()
        with (self.plugin / "main.js").open("a") as stream:
            stream.write("\n// unpublished change\n")
        with self.assertRaisesRegex(ValueError, "源码|版本"):
            build_catalog(self.root)

    def test_package_rejects_symlink_and_escaping_resource(self):
        link = self.plugin / "outside.txt"
        link.symlink_to(self.root / "marketplace.json")
        with self.assertRaisesRegex(ValueError, "符号链接"):
            pack_plugin(self.plugin, self.root / "packages")
        link.unlink()
        path = self.plugin / "manifest.json"
        manifest = json.loads(path.read_text())
        manifest["main"] = "../main.js"
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, "路径"):
            pack_plugin(self.plugin, self.root / "packages")

    def test_archive_rejects_traversal_and_duplicate_entries(self):
        for names in [["../escape", "manifest.json"], ["manifest.json"] * 2]:
            with self.subTest(names=names):
                package = self.root / "bad.piplug"
                with zipfile.ZipFile(package, "w") as archive:
                    for name in names:
                        archive.writestr(name, "{}")
                with self.assertRaises(ValueError):
                    read_package(package)

    def test_scaffold_rejects_existing_directory(self):
        before = (self.plugin / "manifest.json").read_bytes()
        with self.assertRaises(ValueError):
            create_plugin(self.root, {"id": "mine.notes", "name": "覆盖",
                                     "author": "Author", "template": "full-demo"})
        self.assertEqual(before, (self.plugin / "manifest.json").read_bytes())


if __name__ == "__main__":
    unittest.main()
