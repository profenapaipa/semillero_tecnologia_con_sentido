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
        # Se quita la huella de version: assets/x.css?v=abc123 es assets/x.css
        destino = m.group(1).split('?')[0]
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
            # El atributo, no la etiqueta entera: en <html> van tambien el
            # data-theme del tema por defecto y lo que venga despues.
            (r'<html[^>]*\slang="es"', 'falta lang="es"'),
            (r'<html[^>]*\sdata-theme="light"',
             'falta data-theme="light": el claro es el tema por defecto y debe '
             'quedar puesto en el HTML, tanto para que valga sin JavaScript '
             'como para que un equipo configurado en oscuro no entre en oscuro'),
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

# ---- 4.bis texto que no se lee sobre su fondo ----
# El error que aparecio en la revision del docente: se usaba --superficie
# como COLOR DE TEXTO sobre el panel oscuro y sobre rellenos saturados. En
# tema claro la superficie es blanca y funciona; en tema oscuro la
# superficie es OSCURA, y quedaba texto oscuro sobre fondo oscuro.
# Para eso existen --sobre-panel y --sobre-relleno.
PROHIBIDO_COMO_TEXTO = ('--superficie', '--superficie2', '--papel')
for i, linea in enumerate(sitio.splitlines(), 1):
    limpia = re.sub(r'/\*.*?\*/', '', linea)
    m = re.search(r'(?<!-)color:\s*var\((--[a-z0-9-]+)\)', limpia)
    if m and m.group(1) in PROHIBIDO_COMO_TEXTO:
        fallas.append('sitio.css linea %d usa %s como color de texto. En tema oscuro ese '
                      'token es oscuro: usa --sobre-panel o --sobre-relleno. [%s]'
                      % (i, m.group(1), limpia.strip()[:60]))
    f = re.search(r'fill:\s*var\((--[a-z0-9-]+)\)', limpia)
    if f and f.group(1) in PROHIBIDO_COMO_TEXTO:
        fallas.append('sitio.css linea %d usa %s como relleno de texto SVG. [%s]'
                      % (i, f.group(1), limpia.strip()[:60]))

# ---- 4.ter el CSS no puede esconder contenido ----
# El defecto de las tarjetas invisibles del portal: una regla de CSS ponia
# opacity:0 y esperaba que un script pusiera la clase que lo revelaba. Si el
# script falla, o si otra libreria toca la misma propiedad, queda contenido
# invisible que igual recibe el clic. Esconder es tarea del script, que si
# sabe si va a poder revelar; nunca de la hoja de estilo.
#
# Dos excepciones legitimas:
#   - dentro de @keyframes, donde opacity:0 es un fotograma de una animacion
#     que vuelve a dejar el elemento visible;
#   - las clases hechas para ocultar a proposito, como [hidden] o .no-js.
PERMITIDO_OCULTO = ('::backdrop', '[hidden]', '.no-js', 'sr-only', 'visually-hidden')

# Se quitan los comentarios de TODO el archivo, incluidos los de varias
# lineas: si no, la regla se marca a si misma al leer su propia explicacion.
_sin_coment = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), sitio, flags=re.S)
_lineas = _sin_coment.splitlines()

# Se marca que lineas caen dentro de un @keyframes, contando llaves.
_en_keyframes = [False] * len(_lineas)
_prof = 0
_dentro = False
for _i, _l in enumerate(_lineas):
    if '@keyframes' in _l:
        _dentro = True
        _prof = 0
    if _dentro:
        _en_keyframes[_i] = True
        _prof += _l.count('{') - _l.count('}')
        if _prof <= 0 and '{' in ''.join(_lineas[:_i + 1])[-400:]:
            if _l.count('}') and _prof <= 0:
                _dentro = False

for _i, _l in enumerate(_lineas):
    if not re.search(r'opacity:\s*0(?![.\d])', _l):
        continue
    if _en_keyframes[_i]:
        continue
    _ctx = '\n'.join(_lineas[max(0, _i - 5):_i + 1])
    if any(ok in _ctx for ok in PERMITIDO_OCULTO):
        continue
    fallas.append('sitio.css linea %d esconde contenido con opacity:0. Eso lo hace el '
                  'script, no la hoja de estilo. [%s]' % (_i + 1, _l.strip()[:60]))

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

# ---- 7.bis el estado de publicacion y la tarea s6 deben decir lo mismo ----
# Paso de verdad: se actualizo la publicacion de cuatro equipos y no sus tareas
# tecnicas, asi que la tarjeta decia "publicado y en linea" mientras la tarea s6
# del mismo equipo seguia diciendo "sin publicar". Son dos campos distintos que
# describen el mismo hecho, y por eso se pueden separar sin que nadie lo note.
for eq in datos['equipos']:
    pub = (eq.get('publicacion') or {}).get('estado')
    s6 = eq['estado'].get('s6')
    if s6 is None or pub is None:
        continue
    if (pub == 'en linea') != bool(s6[0]):
        fallas.append('equipo %s: la publicacion dice "%s" pero su tarea s6 dice %s. '
                      'Los dos campos describen lo mismo y tienen que coincidir'
                      % (eq['numero'], pub, 'hecha' if s6[0] else 'no hecha'))
    # Si esta publicado, la ficha tiene que traer la URL
    if pub == 'en linea' and not (eq.get('publicacion') or {}).get('url'):
        fallas.append('equipo %s: figura publicado pero no tiene url' % eq['numero'])

# ---- 7.ter ningun nombre de estudiante puede quedar publicado ----
# El portal es publico y son menores: no hay autorizacion para publicar sus
# nombres, y tratarlos sin ella va contra la Ley 1581 de 2012, articulo 7.
# Cada estudiante se identifica con un codigo E01, E02...
# La equivalencia vive FUERA del repositorio, en un archivo que .gitignore
# excluye, asi que esta regla solo puede correr en el equipo de Nestor. Donde
# no este el archivo, avisa y no finge que reviso.
RUTA_SEUDONIMOS = os.path.join(RAIZ, 'Proyectos repositorios Github', 'IA ValerIA',
                               'datos', 'seudonimos.json')
if not os.path.isfile(RUTA_SEUDONIMOS):
    avisos.append('no se encontro el archivo de seudonimos, asi que NO se pudo '
                  'comprobar que no haya nombres de estudiantes publicados')
else:
    with io.open(RUTA_SEUDONIMOS, encoding='utf-8') as fh:
        _seud = json.load(fh)
    # Se revisan las paginas y tambien los documentos del repositorio: la
    # bitacora y el README se publican igual que el sitio.
    _revisables = list(paginas)
    for _n in os.listdir(RAIZ):
        if _n.lower().endswith('.md'):
            _revisables.append(os.path.join(RAIZ, _n))
    _textos = [(os.path.relpath(_p, RAIZ), leer(_p)) for _p in _revisables]
    for _cod, _datos in _seud.get('estudiantes', {}).items():
        _nombre = (_datos or {}).get('nombre') or ''
        _partes = [t for t in _nombre.split() if len(t) >= 3]
        # El nombre completo y cada pareja de palabras seguidas: asi se detecta
        # una fuga parcial sin disparar con un nombre de pila suelto y comun.
        _agujas = [_nombre] if _nombre else []
        _agujas += ['%s %s' % (_partes[i], _partes[i + 1]) for i in range(len(_partes) - 1)]
        for _aguja in _agujas:
            if len(_aguja) < 7:
                continue
            for _rel, _txt in _textos:
                if _aguja.lower() in _txt.lower():
                    fallas.append('%s publica el nombre de un estudiante (%s). '
                                  'Va el codigo %s, no el nombre' % (_rel, _aguja, _cod))
                    break

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
    # Se busca el nombre en CUALQUIER tramo de la ruta, no solo al principio:
    # al mover las carpetas a una subcarpeta, la comparacion por prefijo dejo
    # de aplicar y se colaron al repositorio sin que esta guardia avisara.
    tramos = re.split(r'[\/]', ruta)
    for mala in PROHIBIDAS:
        if any(mala.lower() in t.lower() for t in tramos):
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
