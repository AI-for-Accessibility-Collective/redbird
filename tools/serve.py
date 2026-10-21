#!/usr/bin/env python3
"""Serve the store on your computer the way GitHub Pages does, so /search opens search.html.

    python3 tools/serve.py          # then open http://localhost:8000
    python3 tools/serve.py 8080     # another port
"""
import http.server, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        local = pathlib.Path(super().translate_path(path))
        if not local.exists() and local.with_suffix('.html').exists():
            return str(local.with_suffix('.html'))
        return str(local)


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f'Redbird is at http://localhost:{port}')
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
