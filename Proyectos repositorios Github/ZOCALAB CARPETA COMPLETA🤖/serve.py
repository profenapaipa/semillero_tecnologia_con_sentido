"""Servidor estatico de ZocaLab (solo libreria estandar de Python).

Uso: python serve.py [--host 127.0.0.1] [--port 5500] [--nocache]
"""
import argparse
import functools
import http.server
import os
import socketserver

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ZocaLab")


class Manejador(http.server.SimpleHTTPRequestHandler):
    sin_cache = False

    def end_headers(self):
        if self.sin_cache:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=5500)
    p.add_argument("--nocache", action="store_true")
    a = p.parse_args()

    if not os.path.isfile(os.path.join(RAIZ, "index.html")):
        raise SystemExit("No se encontro ZocaLab\\index.html en " + RAIZ)

    Manejador.sin_cache = a.nocache
    handler = functools.partial(Manejador, directory=RAIZ)
    with Servidor((a.host, a.port), handler) as srv:
        print("Sirviendo %s en http://%s:%d  (Ctrl+C para detener)" % (RAIZ, a.host, a.port))
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")


if __name__ == "__main__":
    main()
