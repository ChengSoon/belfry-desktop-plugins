#!/usr/bin/env python3
"""本地预览 GitHub Pages 构建，支持项目子路径。"""
import argparse
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, base_path="", **kwargs):
        self.base_path = base_path.rstrip("/")
        super().__init__(*args, **kwargs)

    def send_head(self):
        path = urlsplit(self.path).path
        if self.base_path and not path.startswith(self.base_path + "/"):
            self.send_error(404)
            return None
        original = self.path
        self.path = self.path[len(self.base_path):]
        try:
            return super().send_head()
        finally:
            self.path = original

    def log_message(self, format, *args):
        if self.command not in {"GET", "HEAD"}:
            super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8767)
    parser.add_argument("--base-path", default=os.environ.get("NEXT_PUBLIC_BASE_PATH", ""))
    args = parser.parse_args()
    output = Path(__file__).resolve().parents[1] / "website" / "out"
    handler = partial(WebsiteHandler, directory=str(output), base_path=args.base_path)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"http://127.0.0.1:{args.port}{args.base_path}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
