# -*- coding: utf-8 -*-
"""
contraste.py — comprueba que TODO texto se lea sobre su fondo.

    python herramientas/contraste.py

Revisa la paleta de datos/marca.json contra la norma WCAG 2.1:
    4.5 a 1   texto normal          (AA)
    3.0 a 1   texto grande y bordes (AA)

Por que existe este archivo aparte
----------------------------------
La primera revision comprobo una docena de pares elegidos a mano y los dio
todos por buenos. El problema es que el sitio usa muchas mas combinaciones:
un chip de color sobre su propio fondo tenue, el color de una linea tecnica
sobre la superficie tintada de su seccion, el texto suave sobre el panel
oscuro de segundo nivel. Esas no se habian mirado, y ahi estaban las que no
contrastaban.

Aqui se enumeran TODAS las combinaciones que el sitio produce de verdad, en
los dos temas, y el script falla si alguna no cumple.
"""

import io
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARCA = os.path.join(RAIZ, 'datos', 'marca.json')

LINEAS = ('software', 'unity', 'electronica', 'audiovisual')


def lum(hx):
    hx = hx.lstrip('#')
    c = [int(hx[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    c = [(x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4) for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def mezclar(frente, fondo, alfa):
    """Un color con transparencia encima de otro: el color que se ve de verdad."""
    f = [int(frente.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(fondo.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    return '#%02X%02X%02X' % tuple(int(round(f[i] * alfa + b[i] * (1 - alfa))) for i in range(3))


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def pares(c):
    """Todas las combinaciones que el sitio produce de verdad."""
    sup, sup2, papel = c['superficie'], c['superficie2'], c['papel']
    panel, panel2 = c['panel'], c['panel-2']
    P = []

    # Texto corriente sobre cada superficie clara
    for fondo, nf in [(papel, 'papel'), (sup, 'superficie'), (sup2, 'superficie2')]:
        P.append(('texto principal sobre %s' % nf, c['tinta'], fondo, 4.5))
        P.append(('texto suave sobre %s' % nf, c['tinta-suave'], fondo, 4.5))
        P.append(('enlace sobre %s' % nf, c['cian'], fondo, 4.5))

    # Sobre el panel oscuro y su segundo tono
    for fondo, nf in [(panel, 'panel'), (panel2, 'panel-2')]:
        P.append(('texto sobre %s' % nf, c['sobre-panel'], fondo, 4.5))
        P.append(('texto suave sobre %s' % nf, c['sobre-panel-suave'], fondo, 4.5))
        # Sobre el panel NO se usa el color oscuro sino su variante -panel:
        # asi lo hace sitio.css, redefiniendo las variables dentro del panel.
        P.append(('enlace sobre %s' % nf, c['cian-panel'], fondo, 4.5))

    # Semaforo: el color de texto sobre su propia pastilla tenue, que es
    # como aparece de verdad en los chips
    for est in ('verde', 'ambar', 'gris'):
        tenue = mezclar(c['%s-fill' % est], sup, 0.13)
        P.append(('chip %s sobre su fondo tenue' % est, c['%s-texto' % est], tenue, 4.5))
        P.append(('texto %s sobre superficie' % est, c['%s-texto' % est], sup, 4.5))
        P.append(('relleno %s sobre superficie (borde)' % est, c['%s-fill' % est], sup, 3.0))

    # Texto encima de un relleno saturado. Este es el caso que fallaba: se
    # usaba la superficie, blanca en claro pero oscura en oscuro.
    rell = c['sobre-relleno']
    P.append(('texto sobre relleno verde', rell, c['verde-fill'], 4.5))
    P.append(('texto sobre relleno cian', rell, c['cian'], 4.5))
    P.append(('texto sobre panel (titulo)', c['sobre-panel'], panel, 4.5))
    P.append(('numero sobre ambar', panel, c['ambar-fill'], 4.5))
    for ln in LINEAS:
        P.append(('texto sobre relleno de %s' % ln, rell, c['linea-%s' % ln], 4.5))

    # Lineas tecnicas: sobre superficie, sobre su tenue, y como relleno
    for ln in LINEAS:
        col = c['linea-%s' % ln]
        tenue_sup = mezclar(col, sup, 0.14)
        tenue_papel = mezclar(col, papel, 0.14)
        P.append(('linea %s sobre superficie' % ln, col, sup, 4.5))
        P.append(('linea %s sobre su tenue' % ln, col, tenue_sup, 4.5))
        P.append(('linea %s sobre su tenue en papel' % ln, col, tenue_papel, 4.5))
        P.append(('texto sobre relleno de linea %s' % ln, sup, col, 4.5))
        # La insignia de linea sobre el panel usa la variante clara
        colp = c['linea-%s-panel' % ln]
        tenue_panel = mezclar(colp, panel, 0.14)
        P.append(('linea %s sobre panel' % ln, colp, panel, 4.5))
        P.append(('linea %s sobre panel tenue' % ln, colp, tenue_panel, 4.5))
        P.append(('texto sobre relleno de linea %s en panel' % ln, panel, colp, 4.5))

    # Secciones tintadas del portal: el texto corriente sobre el tinte
    for ln in LINEAS:
        tinte = mezclar(c['linea-%s' % ln], sup, 0.14)
        P.append(('texto principal sobre seccion tintada %s' % ln, c['tinta'], tinte, 4.5))
        P.append(('texto suave sobre seccion tintada %s' % ln, c['tinta-suave'], tinte, 4.5))

    # Bordes y filetes: no son texto, pero tienen que verse
    P.append(('filete sobre superficie', c['filete'], sup, 1.3))
    P.append(('filete sobre papel', c['filete'], papel, 1.15))
    return P


def main():
    m = json.load(io.open(MARCA, encoding='utf-8'))
    fallos = []
    lineas_informe = []
    for tema in ('claro', 'oscuro'):
        c = m['color'][tema]
        lineas_informe.append('\n== tema %s ==' % tema)
        for nombre, frente, fondo, minimo in pares(c):
            r = ratio(frente, fondo)
            ok = r >= minimo
            if not ok:
                fallos.append('%s / %s: %.2f, necesita %.1f' % (tema, nombre, r, minimo))
            lineas_informe.append('  %-46s %5.2f  min %.1f  %s'
                                  % (nombre, r, minimo, 'ok' if ok else 'FALLA'))

    informe = '\n'.join(lineas_informe)
    io.open(os.path.join(RAIZ, 'contraste-informe.txt'), 'w', encoding='utf-8').write(informe)
    print('pares revisados: %d por tema' % len(pares(m['color']['claro'])))
    if fallos:
        print('\nNO CUMPLEN (%d):' % len(fallos))
        for f in fallos:
            print('  x', f)
        print('\nInforme completo en contraste-informe.txt')
        sys.exit(1)
    print('todos cumplen WCAG AA')
    print('informe en contraste-informe.txt')


if __name__ == '__main__':
    main()
