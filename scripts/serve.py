#!/usr/bin/env python3
"""Serve the static app locally without installing dependencies."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4184)
parser.add_argument('--open', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'docs'
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
except OSError as exc:
    raise SystemExit(f'Could not start on port {args.port}: {exc}. Try --port 4186.')
url = f'http://127.0.0.1:{args.port}/'
print(f'Shinzen Practice: {url}\nPress Control-C to stop.', flush=True)
if args.open:
    threading.Timer(0.4, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
