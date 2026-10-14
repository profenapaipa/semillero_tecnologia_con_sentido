# -*- coding: utf-8 -*-
"""
auditar.py — revisa el sitio generado antes de publicarlo.

    python herramientas/auditar.py

Comprueba, sobre los archivos de docs/:
  1. Que todo enlace interno lleve a un archivo que existe.
  2. Que las etiquetas HTML abran y cierren bien.
  3. Que cada página traiga lo mínimo: idioma, viewport, título y las dos hojas.
  4. Disciplina de color: ningún color literal fuera de marca.css.
  5. Que todo token de color usado esté definido en el :root base de marca.css,
     que es el error clásico que deja una página ilegible en un tema.
  6. Que no queden emojis ni textos de relleno en lo publicado.
  7. Que las cuentas del semáforo cuadren con los datos.
"""
import io, json, os, re, sys, collections

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(RAIZ, 'docs')
CSS = os.path.join(DOCS, 'assets', 'css')

fallas, avisos = [], []


def leer(p):
    return io.open(p, encoding='utf-8').read()


paginas = []
for base, _d, archivos in os.walk(DOCS):
    for a in archivos:
        if a.endswith('.html'):
            paginas.append(os.path.join(base, a))

# ---- 1. enlaces internos ----
for p in paginas:
    s = leer(p)
    for m in re.finditer(r'(?:href|src)="([^"#:]+)(?:#[^"]*)?"', s):
        destino = m.group(1)
        if destino.startswith(('http', 'mailto:', 'data:', '//')) or not destino:
            continue
        real = os.path.normpath(os.path.join(os.path.dirname(p), destino))
        if not os.path.exists(real):
            fallas.append('enlace roto en %s -> %s'
                          % (os.path.relpath(p, RAIZ), destino))

# ---- 2. etiquetas ----
VACIAS = {'meta','link','br','hr','img','input','rect','circle','line','path',
          'polyline','polygon','use','source','col','area','base','embed','track','wbr'}
for p in paginas:
    s = leer(p)
    pila = []
    for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?(/?)>', s):
        cierre, tag, auto = m.group(1), m.group(2).lower(), m.group(3)
        if tag in VACIAS or auto == '/' or tag == '!doctype':
            continue
        if not cierre:
            pila.append(tag)
        elif pila and pila[-1] == tag:
            pila.pop()
        else:
            fallas.append('etiqueta descuadrada </%s> en %s' % (tag, os.path.relpath(p, RAIZ)))
            break
    if pila:
        fallas.append('sin cerrar %s en %s' % (pila[:3], os.path.relpath(p, RAIZ)))

# ---- 3. mínimos de cada página ----
for p in paginas:
    s = leer(p)
    rel = os.path.relpath(p, RAIZ)
    for patron, queja in [
            (r'<html lang="es">', 'falta lang="es"'),
            (r'name="viewport"', 'falta el viewport'),
            (r'<title>.+?</title>', 'falta el título'),
            (r'marca\.css', 'no enlaza marca.css'),
            (r'sitio\.css', 'no enlaza sitio.css'),
            (r'name="description"', 'falta la descripción')]:
        if not re.search(patron, s, re.S):
            fallas.append('%s: %s' % (rel, queja))

# ---- 4. disciplina de color ----
COLOR = re.compile(r'#[0-9A-Fa-f]{3,8}\b|\brgba?\(')
sitio = leer(os.path.join(CSS, 'sitio.css'))
for i, linea in enumerate(sitio.split('\n'), 1):
    sin_comentario = re.sub(r'/\*.*?\*/', '', linea)
    if COLOR.search(sin_comentario) and 'rgba(255, 255, 255' not in sin_comentario \
            and '#FFFFFF' not in sin_comentario and 'mask-image' not in sin_comentario:
        avisos.append('color literal en sitio.css linea %d: %s' % (i, linea.strip()[:70]))

for p in paginas:
    s = leer(p)
    cuerpo = re.sub(r'<svg.*?</svg>', '', s, flags=re.S)
    for m in COLOR.finditer(cuerpo):
        fallas.append('color literal dentro del HTML de %s: %s'
                      % (os.path.relpath(p, RAIZ), m.group(0)))
        break

# ---- 5. tokens definidos en el :root base ----
marca = leer(os.path.join(CSS, 'marca.css'))
base = marca.split('@media', 1)[0]
definidos = set(re.findall(r'(--[a-z0-9-]+)\s*:', base))
# sitio.css puede definir variables de posicion propias, como --desvio.
# Las de COLOR siguen teniendo que estar en marca.css: eso lo garantiza la
# comprobacion de los dos bloques de tema oscuro, mas abajo.
definidos |= set(re.findall(r'(--[a-z0-9-]+)\s*:', sitio))
usados = set(re.findall(r'var\((--[a-z0-9-]+)', marca + sitio))
for p in paginas:
    usados |= set(re.findall(r'var\((--[a-z0-9-]+)', leer(p)))
huerfanos = sorted(usados - definidos)
for t in huerfanos:
    fallas.append('token %s se usa pero no está definido en el :root base de marca.css' % t)

# Y que los dos bloques oscuros redefinan lo mismo
bloques = re.findall(r'(?:prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)|'
                     r':root\[data-theme="dark"\])\s*\{(.*?)\n\s*\}', marca, re.S)
if len(bloques) == 2:
    a = set(re.findall(r'(--[a-z0-9-]+)\s*:', bloques[0]))
    b = set(re.findall(r'(--[a-z0-9-]+)\s*:', bloques[1]))
    if a != b:
        fallas.append('los dos bloques de tema oscuro no redefinen los mismos tokens: %s'
                      % sorted(a ^ b))
else:
    avisos.append('no se pudieron leer los dos bloques de tema oscuro')

# ---- 6. emojis y relleno ----
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿️]')
for p in paginas:
    s = leer(p)
    if EMOJI.search(s):
        fallas.append('hay emoji en %s' % os.path.relpath(p, RAIZ))
    for malo in ['lorem ipsum', 'TODO', 'FIXME', 'Sin revisar', 'undefined', 'None']:
        if malo in s:
            fallas.append('texto de relleno "%s" en %s' % (malo, os.path.relpath(p, RAIZ)))

# ---- 7. cuentas del semáforo ----
sys.path.insert(0, os.path.join(RAIZ, 'herramientas'))
import generar as g
datos = json.load(io.open(os.path.join(RAIZ, 'datos', 'semillero.json'), encoding='utf-8'))
for eq in datos['equipos']:
    hh, tt, nv = g.totales(datos, eq)
    for n in nv:
        c = g.color_de(n['hechas'], n['total'])
        esperado = 'gris' if n['hechas'] == 0 else ('verde' if n['hechas'] == n['total'] else 'ambar')
        if c != esperado:
            fallas.append('semaforo mal en equipo %s nivel %s' % (eq['numero'], n['n']))
    pagina = os.path.join(DOCS, 'equipos', '%s.html' % eq['slug'])
    if not os.path.exists(pagina):
        fallas.append('falta la pagina del equipo %s' % eq['numero'])
    else:
        s = leer(pagina)
        if '%d de %d' % (hh, tt) not in s:
            avisos.append('equipo %s: el total %d de %d no aparece en su pagina'
                          % (eq['numero'], hh, tt))

# ---- 8. que carpetas estan versionadas ----
# El portal no debe llevarse el codigo de los estudiantes. Cuatro de esas
# carpetas traen su propio .git y se guardarian como enlaces rotos.
import subprocess
PROHIBIDAS = ('La web de la iguana', 'Wisfox', 'ZOCALAB', 'Diverse',
              'ROULETTE', 'App para planeaci')
try:
    seguidos = subprocess.run(['git', 'ls-files'], cwd=RAIZ, capture_output=True,
                              text=True, encoding='utf-8', timeout=60).stdout.splitlines()
except Exception:
    seguidos = []
    avisos.append('no se pudo consultar git para revisar que se versiona')
for ruta in seguidos:
    for mala in PROHIBIDAS:
        if ruta.startswith(mala):
            fallas.append('el repositorio del portal esta versionando %s, que es de un '
                          'equipo y tiene su propio repositorio' % ruta)
            break

# ---- informe ----
print('paginas revisadas: %d' % len(paginas))
print('tokens de color definidos: %d · usados: %d' % (len(definidos), len(usados)))
print()
if fallas:
    print('FALLAS (%d):' % len(fallas))
    for f in collections.OrderedDict.fromkeys(fallas):
        print('  x', f)
else:
    print('FALLAS: ninguna')
print()
if avisos:
    print('AVISOS (%d):' % len(avisos))
    for a in list(collections.OrderedDict.fromkeys(avisos))[:12]:
        print('  -', a)
sys.exit(1 if fallas else 0)
