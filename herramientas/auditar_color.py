# -*- coding: utf-8 -*-
"""
auditar_color.py — describe la paleta en términos medibles.

    python herramientas/auditar_color.py

No dice si una paleta es bonita: eso no se mide. Dice tres cosas que sí se
miden y que explican por qué una paleta se siente apagada o genérica:

  TEMPERATURA del papel. Un fondo con el matiz hacia el naranja (20 a 60
  grados) se lee como crema o café. Es la zona donde viven casi todas las
  plantillas cálidas, y la que hace que una página se sienta vista antes.

  SATURACIÓN de los acentos. Por debajo de 45% un color se percibe apagado
  aunque sea oscuro. "Vivo" es, medido, saturación alta.

  SEPARACIÓN de matiz entre los colores de línea técnica. Si dos están a
  menos de 35 grados, a simple vista se confunden y dejan de servir para
  orientarse.
"""

import colorsys
import io
import json
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARCA = os.path.join(RAIZ, 'datos', 'marca.json')


def hsl(hx):
    hx = hx.lstrip('#')
    r, g, b = (int(hx[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s * 100, l * 100


def nombre_matiz(h, s):
    if s < 8:
        return 'gris neutro'
    tabla = [(15, 'rojo'), (45, 'naranja o crema'), (70, 'amarillo'),
             (160, 'verde'), (200, 'turquesa'), (250, 'azul'),
             (290, 'violeta'), (330, 'magenta'), (360, 'rojo')]
    for tope, nom in tabla:
        if h < tope:
            return nom
    return 'rojo'


LINEAS = ('software', 'unity', 'electronica', 'audiovisual')


def main():
    with io.open(MARCA, encoding='utf-8') as fh:
        m = json.load(fh)

    print('PALETA: %s, version %s' % (m['identidad']['concepto'],
                                      m['identidad']['version']))
    avisos = []

    for tema in ('claro', 'oscuro'):
        c = m['color'][tema]
        print('\n== tema %s ==' % tema)
        h, s, l = hsl(c['papel'])
        print('  papel        %s   matiz %3.0f  sat %3.0f%%  luz %3.0f%%   %s'
              % (c['papel'], h, s, l, nombre_matiz(h, s)))
        if tema == 'claro' and 20 <= h <= 60 and s > 10:
            avisos.append('el papel del tema claro esta en la zona crema o cafe '
                          '(matiz %.0f, saturacion %.0f%%): es la zona de las '
                          'plantillas calidas' % (h, s))
        h, s, l = hsl(c['tinta'])
        print('  tinta        %s   matiz %3.0f  sat %3.0f%%  luz %3.0f%%   %s'
              % (c['tinta'], h, s, l, nombre_matiz(h, s)))

        print('  acentos:')
        matices = {}
        for k in ('cian',) + tuple('linea-%s' % x for x in LINEAS):
            if k not in c:
                continue
            h, s, l = hsl(c[k])
            matices[k] = h
            marca = '' if s >= 45 else '   <- apagado'
            print('    %-20s %s  matiz %3.0f  sat %3.0f%%  luz %3.0f%%  %s%s'
                  % (k, c[k], h, s, l, nombre_matiz(h, s), marca))
            if s < 45:
                avisos.append('%s / %s tiene saturacion %.0f%%: por debajo de 45 se '
                              'percibe apagado' % (tema, k, s))

        # Separacion entre las cuatro lineas tecnicas
        claves = ['linea-%s' % x for x in LINEAS if 'linea-%s' % x in matices]
        for i in range(len(claves)):
            for j in range(i + 1, len(claves)):
                a, b = matices[claves[i]], matices[claves[j]]
                d = abs(a - b)
                d = min(d, 360 - d)
                if d < 35:
                    avisos.append('%s / %s y %s estan a %.0f grados de matiz: a simple '
                                  'vista se confunden' % (tema, claves[i], claves[j], d))

    print()
    if avisos:
        print('LO QUE SE PUEDE MEJORAR (%d):' % len(avisos))
        vistos = set()
        for a in avisos:
            if a not in vistos:
                print('  -', a)
                vistos.add(a)
    else:
        print('Papel fuera de la zona calida, acentos saturados y lineas bien separadas.')


if __name__ == '__main__':
    main()
