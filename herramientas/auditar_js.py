# -*- coding: utf-8 -*-
"""
auditar_js.py — comprueba que el script de la página corre hasta el final.

    python herramientas/auditar_js.py

POR QUÉ EXISTE ESTA HERRAMIENTA
  Todo sitio.js vive dentro de una sola función anónima en modo estricto. Si
  una línea lanza una excepción, muere todo lo que viene después de ella y la
  página no se queja: se ve completa, solo que a medias de funcionar.

  Fue exactamente lo que pasó. La variable cabecera se usaba sin declarar, y
  leer una variable que no existe, en modo estricto, lanza ReferenceError.
  Eso dejó apagadas cinco cosas de un golpe: la barra de avance de lectura,
  las cifras que cuentan, las lecciones en ventana emergente, el plegado de
  los paneles y el selector de tema. Ni la auditoría general ni la de
  contraste lo veían, porque el HTML y el CSS estaban bien. Y en el
  navegador, abriendo el archivo directamente, Chrome enmascara el error
  como "Script error." sin archivo ni línea.

  Un solo descuido de una línea apagó cinco funciones durante varios
  commits. De ahí esta herramienta.

CÓMO LO COMPRUEBA
  Abre páginas de verdad en Chrome sin ventana, y exige dos cosas:

    1. que al final exista window.__sitioCompleto, la señal que sitio.js
       pone en su última línea. Si falta, el script se murió a mitad.
    2. que no se haya registrado ningún error de JavaScript.

  Y de paso confirma que lo que depende del script quedó en pie: la barra de
  avance, los tiradores de los paneles y el botón de tema con su estado.

REQUISITO
  Chrome instalado. Si no está, la herramienta lo dice y no finge que pasó.
"""

import io
import os
import re
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(RAIZ, 'docs')

CHROMES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    os.path.expandvars(r'%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe'),
]

# Páginas representativas: el portal, una vista de proyecto y la de módulos,
# que es la que más cosas mueve (carrusel, vídeos, lecciones).
PAGINAS = [
    'index.html',
    os.path.join('equipos', 'equipo-1.html'),
    os.path.join('equipos', 'equipo-1-ruta.html'),
    os.path.join('equipos', 'equipo-2-2-modulos.html'),
]

SONDA = """
<script>
window.__errJS = [];
window.addEventListener('error', function (e) {
  window.__errJS.push((e.message || 'error') + ' @ ' +
    (e.filename || '?').split('/').pop() + ':' + (e.lineno || '?'));
}, true);
window.addEventListener('unhandledrejection', function (e) {
  window.__errJS.push('promesa sin atender: ' + e.reason);
});
window.addEventListener('load', function () {
  setTimeout(function () {
    var b = document.getElementById('tema');
    document.title = 'AUD' + [
      'completo=' + (window.__sitioCompleto === true ? 'si' : 'NO'),
      'barra=' + (document.querySelector('.progreso-lectura') ? 'si' : 'NO'),
      'tiradores=' + document.querySelectorAll('[data-pliega][aria-expanded]').length,
      'tema=' + (b ? (b.getAttribute('data-tema') || 'SIN-ATRIBUTO') : 'sin boton'),
      'errores=' + (window.__errJS.length ? window.__errJS.join(' / ') : 'ninguno')
    ].join('|');
  }, 2600);
});
</script>
"""


def buscar_chrome():
    for c in CHROMES:
        if os.path.isfile(c):
            return c
    return None


def medir(chrome, rel):
    """Abre una copia de la página con la sonda puesta y devuelve lo medido."""
    tmp = tempfile.mkdtemp(prefix='audjs_')
    try:
        shutil.copytree(DOCS, os.path.join(tmp, 'docs'))
        pg = os.path.join(tmp, 'docs', rel)
        with io.open(pg, encoding='utf-8') as fh:
            h = fh.read()
        with io.open(pg, 'w', encoding='utf-8') as fh:
            fh.write(h.replace('</body>', SONDA + '</body>'))
        url = 'file:///' + pg.replace(os.sep, '/')
        salida = subprocess.run(
            [chrome, '--headless=new', '--disable-gpu', '--no-sandbox',
             '--virtual-time-budget=13000', '--window-size=1600,1000',
             '--dump-dom', url],
            capture_output=True, timeout=180).stdout.decode('utf-8', 'replace')
        m = re.search(r'<title>AUD([^<]*)</title>', salida)
        if not m:
            return None
        return dict(par.split('=', 1) for par in m.group(1).split('|'))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    chrome = buscar_chrome()
    if not chrome:
        print('No se encontró Chrome, así que esto no se pudo comprobar.')
        print('Instálalo o ajusta la lista CHROMES de este archivo.')
        return 2

    fallas = []
    for rel in PAGINAS:
        if not os.path.isfile(os.path.join(DOCS, rel)):
            fallas.append('%s: la página no existe' % rel)
            continue
        d = medir(chrome, rel)
        print('\n== %s ==' % rel)
        if d is None:
            print('   sin medida: la página no llegó a responder')
            fallas.append('%s: sin medida' % rel)
            continue
        for k in ('completo', 'barra', 'tiradores', 'tema', 'errores'):
            print('   %-10s %s' % (k, d.get(k, '?')))

        if d.get('completo') != 'si':
            fallas.append('%s: sitio.js NO llegó a su última línea, así que una '
                          'excepción dejó muertas las secciones de abajo' % rel)
        if d.get('errores') != 'ninguno':
            fallas.append('%s: errores de JavaScript: %s' % (rel, d.get('errores')))
        if d.get('barra') != 'si':
            fallas.append('%s: no se pintó la barra de avance de lectura' % rel)
        if d.get('tema') in ('SIN-ATRIBUTO',):
            fallas.append('%s: el botón de tema quedó sin estado, o sea que el '
                          'selector no corrió' % rel)

    print()
    if fallas:
        print('FALLAS (%d):' % len(fallas))
        for f in fallas:
            print('  x', f)
        return 1
    print('El script corre completo en las %d páginas, sin errores.' % len(PAGINAS))
    return 0


if __name__ == '__main__':
    sys.exit(main())
