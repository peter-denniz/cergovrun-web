"""Lokálny náhľad: zostaví weby s adresami http://localhost:<port>/ do dist/_nahlad a každý servíruje na vlastnom porte."""
import functools
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import zostav

CIEL = zostav.KOREN / "dist" / "_nahlad"


def server(priecinok: Path, port: int) -> ThreadingHTTPServer:
    return ThreadingHTTPServer(("127.0.0.1", port), functools.partial(SimpleHTTPRequestHandler, directory=str(priecinok)))


def main():
    weby = zostav.zostav(CIEL, nahlad=True)
    stranky = zostav.nacitaj(zostav.KOREN / "stranky" / "stranky.json")
    servery = []
    for web, priecinok in weby.items():
        port = stranky[web]["nahlad"]
        s = server(priecinok, port)
        threading.Thread(target=s.serve_forever, daemon=True).start()
        servery.append(s)
        print(f"{web:8} http://localhost:{port}/  ({priecinok.name})", flush=True)
    print("Ctrl+C ukončí náhľad.", flush=True)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for s in servery:
            s.shutdown()
        print("Koniec.")


if __name__ == "__main__":
    main()
