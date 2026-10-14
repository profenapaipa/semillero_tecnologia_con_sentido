# -*- coding: utf-8 -*-
"""
medir_ux.py — audita las distancias reales del sitio, en un navegador.

    python herramientas/medir_ux.py

Por qué existe
--------------
Los dos últimos defectos visuales no se veían leyendo el HTML ni el CSS: el
carrusel crecía hasta el tope del navegador y las tarjetas quedaban
invisibles. Los dos se encontraron midiendo. Esto deja ese método como
herramienta, en vez de rehacerlo a mano cada vez.

Qué mide
--------
Para cada página y cada ancho de pantalla, el ancho real de las columnas, la
medida de lectura en caracteres, y los márgenes. La medida de lectura es la
cifra que manda: la tipografía se lee cómoda entre 60 y 75 caracteres por
línea. Por debajo de 45 el ojo salta de línea demasiado seguido y el texto
cansa; por encima de 90 se pierde el renglón al volver.

Necesita Chrome instalado. Si no está, avisa y no falla el resto del build.
"""

import io
import json
import os
import re
import shutil
import subprocess
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(RAIZ, 'docs')

CHROME = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
]

# Qué páginas y a qué anchos. Los anchos son los reales de una sala de
# cómputo, un portátil y una pantalla grande.
PAGINAS = [
    ('portal', 'index.html'),
    ('equipo', 'equipos/equipo-2-2.html'),
    ('modulos', 'equipos/equipo-2-2-modulos.html'),
    ('ruta', 'equipos/equipo-2-2-ruta.html'),
]
ANCHOS = [1366, 1600, 1920]

MEDIDOR = r'''
<script>
window.addEventListener('load', function () {
  setTimeout(function () {
    function caja(sel) {
      var el = document.querySelector(sel);
      if (!el) { return null; }
      var r = el.getBoundingClientRect();
      var cs = getComputedStyle(el);
      return { an: Math.round(r.width), al: Math.round(r.height),
               izq: Math.round(r.left), der: Math.round(window.innerWidth - r.right),
               pad: cs.paddingLeft + ' ' + cs.paddingRight };
    }
    // Medida de lectura: cuantos caracteres caben en una linea de texto.
    function medida(sel) {
      var el = document.querySelector(sel);
      if (!el) { return null; }
      var cs = getComputedStyle(el);
      var lona = document.createElement('canvas').getContext('2d');
      lona.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var anchoCar = lona.measureText('0123456789').width / 10;
      var util = el.getBoundingClientRect().width -
                 parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      return Math.round(util / anchoCar);
    }
    var r = {
      ventana: window.innerWidth,
      pagina_alto: document.documentElement.scrollHeight,
      izquierda: caja('.lateral-izq, .indice-portal'),
      centro: caja('main.principal'),
      derecha: caja('aside.lateral'),
      rejilla: caja('.con-lateral, .portal-cuerpo'),
      parrafo: caja('.cab-seccion p, .entradilla'),
      medida_parrafo: medida('.cab-seccion p, .entradilla'),
      medida_tarea: medida('.tareas .como'),
      carrusel: caja('.principal-swiper'),
      desborde: document.documentElement.scrollWidth > window.innerWidth + 1
    };
    document.title = 'MX' + JSON.stringify(r);
  }, 2200);
});
</script>
'''


def buscar_chrome():
    for c in CHROME:
        if os.path.exists(c):
            return c
    return None


def main():
    chrome = buscar_chrome()
    if not chrome:
        print('No hay Chrome ni Edge: no se puede medir. El resto del build sigue.')
        return

    tmp = tempfile.mkdtemp(prefix='medir_')
    shutil.copytree(DOCS, os.path.join(tmp, 'docs'))

    # Se inyecta el medidor en una copia, nunca en los archivos del sitio.
    for _n, rel in PAGINAS:
        ruta = os.path.join(tmp, 'docs', rel.replace('/', os.sep))
        with io.open(ruta, encoding='utf-8') as fh:
            html = fh.read()
        with io.open(ruta, 'w', encoding='utf-8') as fh:
            fh.write(html.replace('</body>', MEDIDOR + '</body>'))

    filas = []
    for nombre, rel in PAGINAS:
        ruta = os.path.join(tmp, 'docs', rel.replace('/', os.sep))
        url = 'file:///' + ruta.replace('\\', '/')
        for ancho in ANCHOS:
            try:
                salida = subprocess.run(
                    [chrome, '--headless=new', '--disable-gpu', '--no-sandbox',
                     '--virtual-time-budget=9000',
                     '--window-size=%d,1000' % ancho, '--dump-dom', url],
                    capture_output=True, timeout=120).stdout.decode('utf-8', 'replace')
            except Exception as err:
                print('  %s @%d: no se pudo medir (%s)' % (nombre, ancho, err))
                continue
            m = re.search(r'<title>MX(\{.*?\})</title>', salida, re.S)
            if not m:
                print('  %s @%d: sin medida' % (nombre, ancho))
                continue
            filas.append((nombre, ancho, json.loads(m.group(1))))

    shutil.rmtree(tmp, ignore_errors=True)

    def an(c):
        return c['an'] if c else 0

    print('%-9s %6s %8s %8s %8s %9s %7s %7s' %
          ('pagina', 'ancho', 'izq', 'centro', 'der', 'borde-izq', 'medida', 'desbor'))
    print('-' * 70)
    avisos = []
    for nombre, ancho, r in filas:
        borde = r['izquierda']['izq'] if r['izquierda'] else 0
        med = r.get('medida_parrafo') or 0
        print('%-9s %6d %8d %8d %8d %9d %7s %7s'
              % (nombre, ancho, an(r['izquierda']), an(r['centro']), an(r['derecha']),
                 borde, med or '-', 'SI' if r['desborde'] else 'no'))
        if r['desborde']:
            avisos.append('%s @%d: la pagina se desborda a lo ancho' % (nombre, ancho))
        if med and med < 45:
            avisos.append('%s @%d: la columna de lectura tiene %d caracteres, '
                          'quedan cortos (comodo: 60 a 75)' % (nombre, ancho, med))
        if med and med > 95:
            avisos.append('%s @%d: la columna de lectura tiene %d caracteres, '
                          'queda larga (comodo: 60 a 75)' % (nombre, ancho, med))
        c = r.get('centro')
        izq = r.get('izquierda')
        der = r.get('derecha')
        if c and izq and der:
            lados = an(izq) + an(der)
            if lados > an(c):
                avisos.append('%s @%d: los paneles laterales suman %dpx y el contenido '
                              'solo %dpx: los lados pesan mas que lo que se lee'
                              % (nombre, ancho, lados, an(c)))

    print()
    if avisos:
        print('LO QUE HAY QUE ARREGLAR (%d):' % len(avisos))
        vistos = set()
        for a in avisos:
            if a not in vistos:
                print('  -', a)
                vistos.add(a)
    else:
        print('Proporciones correctas en todos los anchos medidos.')


if __name__ == '__main__':
    main()
