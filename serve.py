#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        file_path = (ROOT / path.lstrip("/")).resolve()
        if path != "/" and not str(file_path).startswith(str(ROOT)):
            return super().do_GET()
        if path != "/" and not file_path.is_file():
            self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
    print("Serving Food Places at http://127.0.0.1:8765")
    server.serve_forever()
