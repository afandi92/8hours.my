"""Start a no-cache, local-only static test server on the first available port.

This avoids accidentally opening stale V2/V3 websites when port 8000 is busy.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


def main():
    server = None
    for port in range(8000, 8051):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", port), partial(NoCacheHandler, directory=str(ROOT)))
            break
        except OSError:
            continue
    if server is None:
        server = ThreadingHTTPServer(("127.0.0.1", 0), partial(NoCacheHandler, directory=str(ROOT)))

    url = f"http://localhost:{server.server_port}/"
    print("ATTENDANCE WEB V3 PREMIUM")
    print(f"Folder: {ROOT}")
    print(f"Open:   {url}")
    print("Press Ctrl+C to stop.\n")
    threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
