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
    'cierre.html',                                  # la presentacion del cierre
]

# Una pagina por linea tecnica, para el contraste del boton "Lo de hoy": su
# fondo cambia segun data-linea, y el bug que motivo esta comprobacion solo
# aparecia en unas lineas y no en otras, segun el color de fondo de cada una.
PAGINAS_LINEA = [
    os.path.join('equipos', 'equipo-1.html'),      # software
    os.path.join('equipos', 'equipo-10-1.html'),   # unity
    os.path.join('equipos', 'equipo-2-1.html'),    # audiovisual
    os.path.join('equipos', 'equipo-4.html'),      # electronica
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

// Contraste WCAG 2.1 entre dos "rgb(r, g, b)" tal como los devuelve
// getComputedStyle: no entre tokens en el papel, entre lo que de verdad
// quedo pintado despues de resolver toda la cascada.
function __contrasteWCAG(rgbA, rgbB) {
  function partes(rgb) {
    var m = (rgb || '').match(/[\\d.]+/g) || [0, 0, 0];
    return m.slice(0, 3).map(Number);
  }
  function luminancia(rgb) {
    var c = partes(rgb).map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  var l1 = luminancia(rgbA), l2 = luminancia(rgbB);
  var claro = Math.max(l1, l2), oscuro = Math.min(l1, l2);
  return (claro + 0.05) / (oscuro + 0.05);
}

window.addEventListener('load', function () {
  setTimeout(function () {
    var b = document.getElementById('tema');
    var bh = document.querySelector('.boton-hoy');
    var botonTxt = 'sin-boton';
    if (bh) {
      var cs = getComputedStyle(bh);
      var ratio = __contrasteWCAG(cs.color, cs.backgroundColor);
      botonTxt = ratio.toFixed(2);
    }
    document.title = 'AUD' + [
      'completo=' + (window.__sitioCompleto === true ? 'si' : 'NO'),
      'barra=' + (document.querySelector('.progreso-lectura') ? 'si' : 'NO'),
      'tiradores=' + document.querySelectorAll('[data-pliega][aria-expanded]').length,
      'tema=' + (b ? (b.getAttribute('data-tema') || 'SIN-ATRIBUTO') : 'sin boton'),
      'boton=' + botonTxt,
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
        # docs/juegos pesa decenas de megas y ninguna pagina auditada lo usa.
        shutil.copytree(DOCS, os.path.join(tmp, 'docs'),
                        ignore=shutil.ignore_patterns('juegos'))
        pg = os.path.join(tmp, 'docs', rel)
        with io.open(pg, encoding='utf-8') as fh:
            h = fh.read()
        # Las vistas previas en vivo de los proyectos publicados son sitios
        # externos: su tiempo de carga depende de la red del dia, no de este
        # codigo. Medido el 26 de octubre: sin ellas el portal carga en 4,7 s;
        # con ellas pasa de 120 s y la auditoria se agotaba. Aqui se mide el
        # JavaScript propio del sitio, asi que se quitan de la copia.
        h = re.sub(r'<iframe[^>]*src="https?://[^"]*"[^>]*>\s*</iframe>', '', h)
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

    # El contraste calculado del botón "Lo de hoy", una página por línea
    # técnica: su fondo cambia según data-linea y el bug que motivó esta
    # comprobación solo aparecía en unas líneas y no en otras.
    print('\n-- contraste calculado de "Lo de hoy", por línea técnica --')
    for rel in PAGINAS_LINEA:
        if not os.path.isfile(os.path.join(DOCS, rel)):
            fallas.append('%s: la página no existe' % rel)
            continue
        d = medir(chrome, rel)
        if d is None:
            fallas.append('%s: sin medida de contraste' % rel)
            continue
        boton = d.get('boton', 'sin-boton')
        print('   %-34s boton=%s' % (rel, boton))
        if boton == 'sin-boton':
            fallas.append('%s: no se encontró el botón "Lo de hoy"' % rel)
        else:
            try:
                ratio = float(boton)
            except ValueError:
                fallas.append('%s: no se pudo leer el contraste del botón' % rel)
            else:
                if ratio < 4.5:
                    fallas.append('%s: el botón "Lo de hoy" mide %.2f a 1 de '
                                  'contraste calculado en el navegador, por '
                                  'debajo del mínimo de 4.5 a 1 de WCAG AA'
                                  % (rel, ratio))

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
