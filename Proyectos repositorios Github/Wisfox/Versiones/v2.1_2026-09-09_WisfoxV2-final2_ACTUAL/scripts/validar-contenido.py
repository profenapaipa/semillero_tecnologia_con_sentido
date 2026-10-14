"""
scripts/validar-contenido.py — revisa los archivos de contenido de inglés
=========================================================================
Recorre src/content/ingles/ingles-<grado>-<periodo>.json y comprueba que
cada unidad tenga la forma que espera el resto del proyecto:

  - JSON válido y campos obligatorios presentes.
  - ids consistentes: la unidad es "ingles-<grado>-<periodo>" y cada
    lección es "ingles-<grado>-<periodo>-<n>" con n empezando en 1 y sin
    saltos (scripts/generar-malla.js y data/curriculum.js dependen de que
    el orden del arreglo coincida con el número del id).
  - toda pregunta de quiz o de repaso tiene 4 opciones en es y en en, y
    su respuesta correcta `a` cae dentro del rango.
  - toda lección trae contenido en los dos idiomas y al menos una ficha.

Se corre con:  python scripts/validar-contenido.py
Sale con código 1 si encuentra algún problema, así que sirve para CI.
"""

import json
import os
import re
import sys

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DIR = os.path.join(RAIZ, 'src', 'content', 'ingles')

CAMPOS_UNIDAD = ['id', 'materia', 'grado', 'periodo', 'titulo', 'lecciones', 'repaso']
CAMPOS_LECCION = ['id', 'num', 'tipo', 't', 't_en', 'd', 'content_es', 'content_en', 'fichas', 'quiz']


def revisar_pregunta(p, donde, errores):
    for campo in ('q', 'q_en', 'o', 'o_en', 'a'):
        if campo not in p:
            errores.append(f'{donde}: falta el campo "{campo}"')
            return
    if len(p['o']) != 4 or len(p['o_en']) != 4:
        errores.append(f'{donde}: debe tener 4 opciones en es y en en (tiene {len(p["o"])} / {len(p["o_en"])})')
    if not isinstance(p['a'], int) or not 0 <= p['a'] < len(p['o']):
        errores.append(f'{donde}: la respuesta "a"={p["a"]} está fuera de rango')


def revisar_unidad(ruta, errores):
    with open(ruta, encoding='utf-8') as f:
        u = json.load(f)

    nombre = os.path.basename(ruta)
    for campo in CAMPOS_UNIDAD:
        if campo not in u:
            errores.append(f'{nombre}: falta el campo "{campo}"')
    if errores:
        return None

    esperado = f'ingles-{u["grado"]}-{u["periodo"]}'
    if u['id'] != esperado:
        errores.append(f'{nombre}: el id es "{u["id"]}" pero debería ser "{esperado}"')
    if nombre != esperado + '.json':
        errores.append(f'{nombre}: el archivo debería llamarse {esperado}.json')

    for i, l in enumerate(u['lecciones'], start=1):
        for campo in CAMPOS_LECCION:
            if campo not in l:
                errores.append(f'{nombre} lección {i}: falta el campo "{campo}"')
                continue
        id_esperado = f'{esperado}-{i}'
        if l.get('id') != id_esperado:
            errores.append(f'{nombre} lección {i}: id "{l.get("id")}" debería ser "{id_esperado}"')
        if l.get('num') != i:
            errores.append(f'{nombre} lección {i}: num "{l.get("num")}" debería ser {i}')
        if l.get('tipo') not in ('grammar', 'vocabulary'):
            errores.append(f'{nombre} lección {i}: tipo "{l.get("tipo")}" no es grammar ni vocabulary')
        if not l.get('fichas'):
            errores.append(f'{nombre} lección {i}: no tiene fichas')
        for j, fi in enumerate(l.get('fichas', []), start=1):
            for campo in ('t', 'd', 'd_en'):
                if not fi.get(campo):
                    errores.append(f'{nombre} lección {i} ficha {j}: falta "{campo}"')
        if not l.get('quiz'):
            errores.append(f'{nombre} lección {i}: no tiene preguntas de quiz')
        for j, p in enumerate(l.get('quiz', []), start=1):
            revisar_pregunta(p, f'{nombre} lección {i} pregunta {j}', errores)

    r = u['repaso']
    if r.get('id') != esperado + '-repaso':
        errores.append(f'{nombre}: el repaso debería tener id "{esperado}-repaso"')
    for campo in ('resumen_es', 'resumen_en', 'puntos_clave', 'preguntas'):
        if not r.get(campo):
            errores.append(f'{nombre} repaso: falta "{campo}"')
    for j, par in enumerate(r.get('puntos_clave', []), start=1):
        if not isinstance(par, list) or len(par) != 2:
            errores.append(f'{nombre} repaso punto clave {j}: debe ser un par [es, en]')
    for j, p in enumerate(r.get('preguntas', []), start=1):
        revisar_pregunta(p, f'{nombre} repaso pregunta {j}', errores)

    return u


def main():
    archivos = sorted(
        (f for f in os.listdir(DIR) if re.fullmatch(r'ingles-\d+-\d\.json', f)),
        key=lambda f: (int(f.split('-')[1]), int(f.split('-')[2][0])),
    )
    if not archivos:
        print('No se encontró ningún archivo de contenido en', DIR)
        sys.exit(1)

    errores = []
    lecciones = fichas = preguntas = 0
    for f in archivos:
        u = revisar_unidad(os.path.join(DIR, f), errores)
        if not u:
            continue
        nl = len(u['lecciones'])
        nf = sum(len(l.get('fichas', [])) for l in u['lecciones'])
        nq = sum(len(l.get('quiz', [])) for l in u['lecciones']) + len(u['repaso'].get('preguntas', []))
        lecciones += nl
        fichas += nf
        preguntas += nq
        print(f'  {u["id"]:<14} {nl:>3} lecciones  {nf:>3} fichas  {nq:>3} preguntas   {u["titulo"][:48]}')

    print(f'\n{len(archivos)} unidades · {lecciones} lecciones · {fichas} fichas · {preguntas} preguntas')

    if errores:
        print('\nProblemas encontrados:')
        for e in errores:
            print('  -', e)
        sys.exit(1)
    print('Todo el contenido está bien formado.')


if __name__ == '__main__':
    main()
