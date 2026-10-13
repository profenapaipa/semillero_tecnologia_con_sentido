# -*- coding: utf-8 -*-
"""
extraer_modulos.py — convierte las diapositivas de cada sesión en módulos.

    python herramientas/extraer_modulos.py

Lee las presentaciones de la carpeta de Drive montada y escribe
datos/modulos.json, que es lo que el sitio convierte en módulos de
aprendizaje: cada semana, lo que se pidió, y las diapositivas legibles
dentro de la página.

Por qué texto y no imágenes
---------------------------
Convertir una presentación a imágenes necesita PowerPoint automatizado o
LibreOffice, y en este computador no hay ninguno de los dos disponibles por
línea de comandos. Pero extraer el contenido tiene ventajas propias:

  - pesa unos pocos kilobytes en vez de varios megas por sesión
  - se puede buscar con Ctrl+F y se lee con lector de pantalla
  - se adapta al tema claro y oscuro
  - carga al instante en los computadores de la sala

Las presentaciones del semillero son de texto y tablas, así que casi no se
pierde nada. El archivo original queda enlazado por si alguien lo quiere.

Cómo están hechas las diapositivas
----------------------------------
Cada una lleva arriba a la izquierda la etiqueta de su sección: Unity,
Desarrollo web, Electrónica y robótica, Producción audiovisual o
Documentación. Eso permite que a cada equipo se le muestren solo las
diapositivas de SU línea más las que son para todos, que es justo lo que
dice la segunda diapositiva de cada sesión.
"""

import io
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVE = r'K:\Mi unidad\Napaipa Injuv 2026\Proyectos semillero 2026'
LOCAL = os.path.join(RAIZ, 'SEMILLERO AULA MAKER')
DESTINO = os.path.join(RAIZ, 'datos', 'modulos.json')

# Las sesiones del semestre, en orden, con el archivo que les corresponde.
SESIONES = [
    ('A', '29 y 30 de julio',        'Sesion_29-30_julio.pptx',        '2026-07-29'),
    ('B', '5 y 6 de agosto',         'Paso_a_paso_05-06_agosto.pptx',  '2026-08-05'),
    ('C', '12 y 13 de agosto',       'Sesion_12-13_agosto.pptx',       '2026-08-12'),
    ('D', '19 y 20 de agosto',       None,                             '2026-08-19'),
    ('E', '26 y 27 de agosto',       'Sesion_26-27_agosto.pptx',       '2026-08-26'),
    ('F', '9 y 10 de septiembre',    'Sesion_09-10_septiembre.pptx',   '2026-09-09'),
    ('G', '16 y 17 de septiembre',   'Sesion_16-17_septiembre_1.pptx', '2026-09-16'),
]

# Etiqueta de sección -> clave de línea técnica del sitio.
SECCIONES = {
    'unity': 'unity',
    'desarrollo web': 'software',
    'desarrollo de software': 'software',
    'electrónica y robótica': 'electronica',
    'electronica y robotica': 'electronica',
    'electrónica': 'electronica',
    'producción audiovisual': 'audiovisual',
    'produccion audiovisual': 'audiovisual',
    'audiovisual': 'audiovisual',
    'documentación': 'todos',
    'documentacion': 'todos',
}

EMU_CM = 360000.0

# Marcadores decorativos al inicio de una linea de la diapositiva. Se quitan
# porque la palabra que sigue ya dice lo mismo: "✓ Asi si" se lee igual como
# "Asi si", y el simbolo se dibuja distinto en cada sistema. La flecha → no
# se toca: ahi si significa algo, "esto lleva a esto".
MARCADORES = re.compile(r'^[▶✓✗✔✘•·\s]+')


def limpiar(t):
    return MARCADORES.sub('', t or '').strip()


def buscar(nombre):
    """Busca el archivo primero en Drive y, si no, en la carpeta local."""
    if not nombre:
        return None
    for base in (DRIVE, LOCAL):
        if not os.path.isdir(base):
            continue
        for r, _d, archivos in os.walk(base):
            if nombre in archivos:
                return os.path.join(r, nombre)
    return None


def etiqueta_de(diapo, ancho_cm):
    """
    La etiqueta de sección va arriba a la izquierda y es corta.
    Si no hay, la diapositiva es para todos.
    """
    mejor = None
    for sh in diapo.shapes:
        if not sh.has_text_frame or sh.top is None or sh.left is None:
            continue
        t = sh.text_frame.text.strip()
        if not t or len(t) > 36:
            continue
        arriba = sh.top / EMU_CM < 2.2
        izquierda = sh.left / EMU_CM < ancho_cm * 0.42
        if arriba and izquierda:
            clave = SECCIONES.get(t.lower().strip(' .·|'))
            if clave:
                mejor = clave
    return mejor


def leer_diapo(diapo, ancho_cm):
    """Saca de una diapositiva su título, sus textos y sus tablas."""
    bloques, tablas = [], []
    for sh in diapo.shapes:
        if sh.has_text_frame:
            lineas = [limpiar(p.text) for p in sh.text_frame.paragraphs if limpiar(p.text)]
            if lineas:
                bloques.append({'y': sh.top or 0, 'x': sh.left or 0, 'lineas': lineas})
        elif getattr(sh, 'has_table', False) and sh.has_table:
            filas = []
            for fila in sh.table.rows:
                filas.append([limpiar(c.text) for c in fila.cells])
            if filas:
                tablas.append(filas)
    # De arriba abajo y de izquierda a derecha, que es como se lee.
    bloques.sort(key=lambda b: (b['y'], b['x']))
    texto = []
    for b in bloques:
        texto.extend(b['lineas'])

    titulo = ''
    for t in texto:
        # El título es la primera línea con sustancia que no sea un número suelto.
        if len(t) > 3 and not re.fullmatch(r'\d+', t):
            titulo = t
            break
    cuerpo = [t for t in texto if t != titulo]
    return titulo, cuerpo, tablas


def main():
    try:
        from pptx import Presentation
    except ImportError:
        raise SystemExit('Falta python-pptx. Instálalo con:  pip install python-pptx')

    modulos = []
    for letra, nombre_sesion, archivo, fecha in SESIONES:
        ruta = buscar(archivo)
        mod = {
            'letra': letra,
            'sesion': nombre_sesion,
            'fecha': fecha,
            'archivo': archivo,
            'encontrado': bool(ruta),
            'diapositivas': [],
        }
        if ruta:
            pr = Presentation(ruta)
            ancho_cm = pr.slide_width / EMU_CM
            seccion_actual = 'todos'
            for i, diapo in enumerate(pr.slides, 1):
                et = etiqueta_de(diapo, ancho_cm)
                if et:
                    seccion_actual = et
                titulo, cuerpo, tablas = leer_diapo(diapo, ancho_cm)
                mod['diapositivas'].append({
                    'n': i,
                    'seccion': et or ('todos' if i <= 3 else seccion_actual),
                    'titulo': titulo,
                    'cuerpo': cuerpo,
                    'tablas': tablas,
                })
            # El título del módulo sale de la primera diapositiva.
            if mod['diapositivas']:
                primera = mod['diapositivas'][0]
                partes = [x for x in ([primera['titulo']] + primera['cuerpo'][:1]) if x]
                mod['titulo'] = ' '.join(partes)[:90]
        modulos.append(mod)

    with io.open(DESTINO, 'w', encoding='utf-8') as f:
        json.dump({'modulos': modulos}, f, ensure_ascii=False, indent=1)

    print('escrito  datos/modulos.json')
    for m in modulos:
        if m['encontrado']:
            porsec = {}
            for d in m['diapositivas']:
                porsec[d['seccion']] = porsec.get(d['seccion'], 0) + 1
            print('  %s) %-26s %2d diapositivas  %s'
                  % (m['letra'], m['sesion'], len(m['diapositivas']),
                     ' '.join('%s:%d' % kv for kv in sorted(porsec.items()))))
        else:
            print('  %s) %-26s sin presentación' % (m['letra'], m['sesion']))


if __name__ == '__main__':
    main()
