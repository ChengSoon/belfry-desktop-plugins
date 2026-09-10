"""校验边界和发布目录回归。"""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from plugin_center.common import decode_json, source_files
from plugin_center.manifest import validate_files, version_key
from plugin_center.scaffold import TEMPLATES, scaffold_files


class ValidationTests(unittest.TestCase):
    def files(self, template="panel-basic"):
        return scaffold_files({"id": "my.notes", "name": "Notes", "author": "Maker", "template": template})

    def test_all_templates_have_valid_declared_resources(self):
        for template in TEMPLATES:
            with self.subTest(template=template):
                self.assertEqual("my.notes", validate_files(self.files(template))["id"])

    def test_duplicate_manifest_fields_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "重复"):
            decode_json(b'{"id":"one","id":"two"}')

    def test_missing_panel_permission_or_entry_is_rejected(self):
        for change in ["permission", "entry"]:
            with self.subTest(change=change):
                files = self.files()
                manifest = json.loads(files["manifest.json"])
                if change == "permission":
                    manifest["permissions"] = []
                else:
                    files.pop("renderer/index.html")
                files["manifest.json"] = json.dumps(manifest).encode()
                with self.assertRaises(ValueError):
                    validate_files(files)

    def test_file_size_and_count_limits_are_enforced(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "large.txt").write_bytes(b"12345")
            with patch("plugin_center.common.MAX_BYTES", 4):
                with self.assertRaisesRegex(ValueError, "容量"):
                    source_files(root)
            with patch("plugin_center.common.MAX_FILES", 0):
                with self.assertRaisesRegex(ValueError, "容量"):
                    source_files(root)

    def test_secrets_and_dependency_directories_are_not_packaged(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "main.js").write_text("module.exports = {};")
            (root / ".env").write_text("TEST_ONLY=not-a-secret")
            (root / "node_modules").mkdir()
            (root / "node_modules" / "ignored.js").write_text("unused")
            self.assertEqual(["main.js"], list(source_files(root)))

    def test_semver_rejects_leading_zero_and_handles_large_identifiers(self):
        for version in ["01.0.0", "1.0", "1.0.0-beta.01"]:
            with self.assertRaises(ValueError):
                version_key(version)
        self.assertLess(version_key("1.0.0-alpha.999999999999999999"), version_key("1.0.0"))

    def test_packages_reject_names_that_cannot_install_on_windows(self):
        for name in ["con.txt", "NUL", "COM1.log", "bad?.txt", "trailing.", "trailing "]:
            with self.subTest(name=name):
                files = self.files()
                files[name] = b"content"
                with self.assertRaisesRegex(ValueError, "路径|Windows"):
                    validate_files(files)

    def test_packages_reject_case_aliases_and_file_directory_conflicts(self):
        for names in [["README.md", "readme.md"], ["Folder/a", "folder/b"], ["file", "file/nested"]]:
            with self.subTest(names=names):
                files = self.files()
                files.update({name: b"content" for name in names})
                with self.assertRaisesRegex(ValueError, "路径|冲突"):
                    validate_files(files)


if __name__ == "__main__":
    unittest.main()
