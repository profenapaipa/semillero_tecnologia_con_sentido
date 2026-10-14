# -*- coding: utf-8 -*-
"""
generar.py — construye el sitio del Semillero Maker de Tecnología con Sentido.

Qué escribe
-----------
    docs/index.html                        el portal
    docs/equipos/<slug>.html               resumen del equipo, con su nivel actual
    docs/equipos/<slug>-ruta.html          vista 1: la ruta por niveles, completa
    docs/equipos/<slug>-desarrollo.html    vista 2: el desarrollo tecnológico
    docs/equipos/<slug>-articulo.html      vista 3: la documentación del artículo

Son 1 + 14 x 4 = 57 páginas. Por eso se generan y no se escriben a mano.

Cómo se usa
-----------
    python herramientas/generar.py

Para cambiar el estado de un equipo NO se toca este archivo ni el HTML:
se edita  datos/semillero.json  y se vuelve a correr esto.

La jerarquía de navegación
--------------------------
    Portal  →  Equipo  →  una de sus tres vistas

Cada página sabe dónde está: barra de navegación arriba, migas debajo, y un
panel introductorio que explica cómo se lee antes de soltar el dato.

Cómo se calcula el semáforo (BRIEF.md 4.2)
------------------------------------------
Cada tarea es binaria. El color de un nivel sale de contar sus tareas:
gris = ninguna, amarillo = algunas, verde = todas.

Las tareas de un nivel son dos cosas sumadas:
  1. las tareas documentales comunes a todos los equipos  (tareasComunes)
  2. los hitos técnicos de su línea que pertenecen a esa fase  (lineas[*].hitos)

Eso es lo que entrelaza el desarrollo tecnológico con las fases del Design
Thinking: cada hito declara su fase, y la fase lo cuenta.
"""

import json
import html
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATOS = os.path.join(RAIZ, 'datos', 'semillero.json')
SALIDA = os.path.join(RAIZ, 'docs')

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
         'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11.2.6/swiper-bundle.min.css'
SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11.2.6/swiper-bundle.min.js'
GSAP_JS = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'
GSAP_ST = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'

FUENTES_WEB = ('https://fonts.googleapis.com/css2'
               '?family=IBM+Plex+Serif:wght@600;700'
               '&family=IBM+Plex+Sans:wght@400;500;600;700'
               '&family=IBM+Plex+Mono:wght@400;500;600&display=swap')


# Cada tarea cumplida vale esto. No hay otra forma de sumar: los puntos NO
# se regalan ni se ganan por entrar, se ganan cumpliendo lo que ya se pedía.
PUNTOS_TAREA = 10

# Se calcula en main() a partir del contenido real de las hojas y el script.
VERSION_ASSETS = '0'


def huella(*rutas):
    """
    Numero corto que cambia cuando cambia el archivo.

    Se cuelga de las hojas de estilo y del script como ?v=... Sin esto, el
    navegador y la cache de GitHub Pages siguen sirviendo la version vieja
    y parece que el cambio no se aplico.
    """
    import hashlib
    h = hashlib.sha1()
    for r in rutas:
        ruta = os.path.join(SALIDA, r)
        if os.path.exists(ruta):
            with open(ruta, 'rb') as fh:
                h.update(fh.read())
    return h.hexdigest()[:8]


def e(t):
    return html.escape(str(t), quote=True)


def fecha_larga(iso):
    a, m, d = (int(x) for x in iso.split('-'))
    return '%d de %s de %d' % (d, MESES[m - 1], a)


# ====================================================================
# Iconografía: SVG dibujados a mano, misma retícula de 24 y mismo grosor.
# No se usan emojis: un emoji cambia de dibujo en cada sistema operativo y
# no se puede teñir con el color del tema.
# ====================================================================

# Iconografia: set Lucide, incrustado desde docs/assets/iconos/.
# No se carga desde un CDN a proposito: en la sala de computo la conexion
# falla, y la via de JavaScript de Lucide hace que los iconos aparezcan un
# instante despues de la pagina. Incrustados estan desde el primer cuadro,
# heredan currentColor y funcionan sin conexion.
# Para agregar uno: se añade a herramientas/traer_iconos.py y se corre.
CARPETA_ICONOS = os.path.join(SALIDA, 'assets', 'iconos')

# Nombres internos -> nombre del archivo de Lucide.
ALIAS = {
    'software': 'code-xml', 'unity': 'gamepad-2', 'electronica': 'cpu',
    'audiovisual': 'clapperboard', 'mapa': 'map', 'cohete': 'rocket',
    'documento': 'file-text', 'check': 'check', 'reloj': 'clock',
    'lupa': 'search', 'externo': 'external-link', 'flecha': 'arrow-right',
    'chevron': 'chevron-right', 'capas': 'layers', 'diana': 'target',
    'bombilla': 'lightbulb', 'llave': 'key-round', 'carpeta': 'folder',
    'github': 'github', 'inicio': 'house', 'tablero': 'layout-grid',
    'brujula': 'compass', 'rama': 'git-branch', 'globo': 'globe',
    'regla': 'pencil-ruler', 'lista': 'list-checks', 'matraz': 'flask-conical',
    'llave-inglesa': 'wrench', 'birrete': 'graduation-cap', 'libro': 'book-open',
    'video': 'video', 'ayuda': 'circle-help', 'tendencia': 'trending-up',
    'play': 'play', 'punteado': 'circle-dashed', 'listo': 'circle-check-big',
}

_cache_iconos = {}


def _cuerpo_icono(nombre):
    """Saca el interior del SVG de Lucide, sin su etiqueta <svg> exterior."""
    archivo = ALIAS.get(nombre, nombre)
    if archivo in _cache_iconos:
        return _cache_iconos[archivo]
    ruta = os.path.join(CARPETA_ICONOS, '%s.svg' % archivo)
    if not os.path.exists(ruta):
        raise SystemExit('Falta el icono %s.svg. Corre: python herramientas/traer_iconos.py'
                         % archivo)
    with open(ruta, encoding='utf-8') as fh:
        svg = fh.read()
    dentro = re.sub(r'^.*?<svg[^>]*>', '', svg, flags=re.S)
    dentro = re.sub(r'</svg>\s*$', '', dentro).strip()
    _cache_iconos[archivo] = dentro
    return dentro


def ico(nombre, tam=20, clase=''):
    """Un icono incrustado. Hereda currentColor, asi sirve en los dos temas."""
    return ('<svg class="ico %s" width="%d" height="%d" viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" '
            'aria-hidden="true">%s</svg>' % (clase, tam, tam, _cuerpo_icono(nombre)))


ICONO_LINEA = {'software': 'software', 'unity': 'unity',
               'electronica': 'electronica', 'audiovisual': 'audiovisual'}


# ====================================================================
# Cálculo del estado
# ====================================================================

GRUPOS_ARTICULO = {
    'a2': ['2', '2.1'],
    'a3': ['3.1', '3.2', '3.3', '3.4', '3.5'],
    'a4': ['4'],
    'a5': ['5.1', '5.2'],
}


def color_de(hechas, total):
    if total == 0 or hechas == 0:
        return 'gris'
    return 'verde' if hechas == total else 'ambar'


def pct(hechas, total):
    return 0 if total == 0 else int(round(hechas * 100.0 / total))


def tarea_articulo(datos, equipo, tarea_id):
    ids = GRUPOS_ARTICULO[tarea_id]
    est = equipo.get('articuloEstado', {})
    titulos = {s['id']: s['titulo'] for s in datos['articulo']}
    faltan = [titulos.get(i, i) for i in ids if not est.get(i, False)]
    if not faltan:
        return True, 'Las %d secciones del grupo están escritas' % len(ids)
    if len(faltan) == len(ids):
        return False, 'Sin escribir: %s' % ', '.join(faltan)
    return False, 'Falta todavía: %s' % ', '.join(faltan)


def tareas_de_fase(datos, equipo, fase_id):
    estado = equipo['estado']
    salida = []
    for t in datos['tareasComunes'].get(fase_id, []):
        if t['id'] in GRUPOS_ARTICULO:
            hecha, fuente = tarea_articulo(datos, equipo, t['id'])
        else:
            hecha, fuente = estado.get(t['id'], [False, 'Sin revisar'])
        salida.append((t['id'], t['texto'], hecha, fuente, False))
    for hito in datos['lineas'][equipo['linea']]['hitos']:
        if hito['fase'] == fase_id:
            hecha, fuente = estado.get(hito['id'], [False, 'Sin revisar'])
            salida.append((hito['id'], hito['nombre'], hecha, fuente, True))
    return salida


def niveles_de(datos, equipo):
    """Las siete fases convertidas en niveles, con su avance."""
    filas = []
    for i, fase in enumerate(datos['fases']):
        tareas = tareas_de_fase(datos, equipo, fase['id'])
        hechas = sum(1 for t in tareas if t[2])
        filas.append({
            'n': i + 1, 'fase': fase, 'tareas': tareas,
            'hechas': hechas, 'total': len(tareas),
            'color': color_de(hechas, len(tareas)),
            'pct': pct(hechas, len(tareas)),
        })
    return filas


def nivel_actual(niveles):
    """Donde va el equipo: el primer nivel que todavía no está superado."""
    for n in niveles:
        if n['color'] != 'verde':
            return n
    return niveles[-1]


def resumen_articulo(datos, equipo):
    est = equipo.get('articuloEstado', {})
    filas = [(s, bool(est.get(s['id'], False))) for s in datos['articulo']]
    hechas = sum(1 for _, ok in filas if ok)
    return filas, hechas, len(filas)


def resumen_desarrollo(datos, equipo):
    filas = []
    for h in datos['lineas'][equipo['linea']]['hitos']:
        hecha, fuente = equipo['estado'].get(h['id'], [False, 'Sin revisar'])
        filas.append({'hito': h, 'hecha': hecha, 'fuente': fuente})
    hechas = sum(1 for f in filas if f['hecha'])
    return filas, hechas, len(filas)


def totales(datos, equipo):
    nv = niveles_de(datos, equipo)
    return sum(n['hechas'] for n in nv), sum(n['total'] for n in nv), nv


ESTADO_NIVEL = {'verde': 'Nivel superado', 'ambar': 'En curso', 'gris': 'Sin empezar'}


# ====================================================================
# Piezas reutilizables
# ====================================================================

def chip(color, texto, icono=None):
    dentro = ico(icono, 13) if icono else '<span class="pt"></span>'
    return '<span class="chip %s">%s%s</span>' % (color, dentro, e(texto))


def barra(hechas, total, alta=False):
    c = color_de(hechas, total)
    return ('<div class="barra-progreso %s%s"><span style="width:%d%%"></span></div>'
            % (c, ' alta' if alta else '', pct(hechas, total)))


def progreso(etiqueta, hechas, total, alta=False):
    c = color_de(hechas, total)
    return ('<div class="linea-progreso %s"><div class="leyenda"><span>%s</span>'
            '<b>%d de %d · %d%%</b></div>%s</div>'
            % (c, e(etiqueta), hechas, total, pct(hechas, total), barra(hechas, total, alta)))


def anillo(hechas, total):
    """Anillo de avance total, para la portada oscura del equipo."""
    p = pct(hechas, total)
    r = 30
    circ = 2 * 3.14159 * r
    avance = circ * p / 100.0
    color = {'verde': 'var(--verde-fill)', 'ambar': 'var(--ambar-fill)',
             'gris': 'var(--gris-fill)'}[color_de(hechas, total)]
    return ('<div class="anillo">'
            '<svg viewBox="0 0 76 76" role="img" aria-label="Avance total: %d por ciento">'
            '<circle class="pista" cx="38" cy="38" r="%d" fill="none" stroke-width="7"/>'
            '<circle class="avance" cx="38" cy="38" r="%d" fill="none" stroke="%s" stroke-width="7" '
            'stroke-dasharray="%.1f %.1f"/>'
            '<text class="num" x="38" y="44" text-anchor="middle">%d%%</text></svg>'
            '<div class="detalle"><span class="grande">%d de %d</span>'
            '<small>tareas con evidencia</small></div></div>'
            % (p, r, r, color, avance, circ - avance, p, hechas, total))


def vista_previa(url, nombre):
    """
    Miniatura en vivo del proyecto publicado.
    Se puede incrustar porque GitHub Pages no manda X-Frame-Options
    (verificado el 13 de octubre de 2026). El sandbox deja correr el
    JavaScript que varios de estos proyectos necesitan para armarse, pero
    le quita la navegación de ventana y los formularios.
    """
    return ('<div class="vistaprevia">'
            '<iframe src="%s" title="Vista previa de %s" loading="lazy" tabindex="-1" '
            'sandbox="allow-scripts allow-same-origin"></iframe>'
            '<div class="pie-previa"><span>vista previa en vivo</span><span>%s</span></div></div>'
            % (e(url), e(nombre), e(url.replace('https://', ''))))


PUBLICACION = {
    'en linea':           ('verde', 'Publicado y en línea'),
    'sin publicar':       ('ambar', 'Tiene repositorio, falta publicarlo'),
    'sin repositorio':    ('ambar', 'Todavía sin repositorio en GitHub'),
    'pendiente de build': ('gris',  'Se podrá publicar cuando haya build'),
    'no aplica':          ('gris',  'No se publica como sitio web'),
}


def bloque_publicacion(equipo, con_previa=True):
    pub = equipo.get('publicacion') or {}
    color, rotulo = PUBLICACION.get(pub.get('estado', 'no aplica'), PUBLICACION['no aplica'])
    p = ['<div class="publicacion %s">' % color]
    p.append('<div class="encima">%s<span class="rotulo-pub">%s</span></div>'
             % (chip(color, 'publicación', 'cohete'), e(rotulo)))
    if con_previa and pub.get('url'):
        p.append(vista_previa(pub['url'], equipo['nombre']))
    bot = []
    if pub.get('url'):
        bot.append('<a class="boton principal" href="%s">%s Abrir el proyecto</a>'
                   % (e(pub['url']), ico('externo', 17)))
    if pub.get('repo'):
        bot.append('<a class="boton" href="%s">%s Código en GitHub</a>'
                   % (e(pub['repo']), ico('github', 17)))
    if bot:
        p.append('<div class="botones">%s</div>' % ''.join(bot))
    if pub.get('nota'):
        p.append('<p class="nota">%s</p>' % e(pub['nota']))
    p.append('</div>')
    return ''.join(p)


# ====================================================================
# Armazón de página
# ====================================================================

MENU = [('Inicio', 'index.html', 'inicio', 'inicio'),
        ('Proyectos', 'index.html#proyectos', 'proyectos', 'tablero'),
        ('Publicados', 'index.html#publicados', 'publicados', 'cohete'),
        ('Cómo funciona', 'index.html#como', 'como', 'ayuda'),
        ('Filosofartec', 'index.html#hermanos', 'hermanos', 'globo')]


def mini_camino(nv, act):
    """Vista previa del camino, en siete puntos. Va en los desplegables."""
    p = ['<span class="mini-camino" aria-hidden="true">']
    for n in nv:
        aqui = ' aqui' if n is act else ''
        p.append('<i class="%s%s"></i>' % (n['color'], aqui))
    p.append('</span>')
    return ''.join(p)


def desplegable_proyectos(datos, pre):
    """
    El menu de proyectos: los quince, agrupados por linea tecnica, cada uno
    con la vista previa de su camino. Es un <details>, asi que funciona con
    teclado y tambien si el JavaScript no carga.
    """
    p = ['<details class="desplegable proyectos-menu"><summary>%s Proyectos %s</summary>'
         '<div class="panel-desplegable"><div class="panel-rejilla">'
         % (ico('tablero', 15), ico('chevron', 13, 'giro'))]
    for clave, linea in datos['lineas'].items():
        equipos = [x for x in datos['equipos'] if x['linea'] == clave]
        if not equipos:
            continue
        p.append('<div class="panel-grupo" data-linea="%s">' % e(clave))
        p.append('<span class="panel-titulo">%s %s</span>'
                 % (ico(ICONO_LINEA.get(clave, 'diana'), 14), e(linea['nombre'])))
        for eq in equipos:
            hh, tt, nv = totales(datos, eq)
            act = nivel_actual(nv)
            p.append('<a href="%sequipos/%s.html"><span class="n">%s</span>'
                     '<span class="txt"><b>%s</b>%s</span>'
                     '<span class="pc dato">%d%%</span></a>'
                     % (pre, e(eq['slug']), e(eq['numero']), e(eq['nombre']),
                        mini_camino(nv, act), pct(hh, tt)))
        p.append('</div>')
    p.append('</div></div></details>')
    return ''.join(p)


def desplegable_secciones(pre):
    """Las secciones del portal, tambien desplegables."""
    items = [('como', 'Como funciona', 'ayuda', 'Que es la ruta y como se lee'),
             ('numeros', 'Diagnostico', 'tendencia', 'El semillero en numeros'),
             ('proyectos', 'Los proyectos', 'tablero', 'Los quince, por linea tecnica'),
             ('publicados', 'Publicados', 'cohete', 'Lo que ya se puede abrir'),
             ('hermanos', 'Hermanos', 'globo', 'Filosofartec y Un Cafe con la Iguana')]
    p = ['<details class="desplegable"><summary>%s Secciones %s</summary>'
         '<div class="panel-desplegable estrecho-menu">'
         % (ico('capas', 15), ico('chevron', 13, 'giro'))]
    for ancla, titulo, icono, pie_ in items:
        p.append('<a href="%sindex.html#%s">%s<span class="txt"><b>%s</b>'
                 '<small>%s</small></span></a>' % (pre, ancla, ico(icono, 16), e(titulo), e(pie_)))
    p.append('</div></details>')
    return ''.join(p)


def cabeza(titulo, desc, pre, activo=None, linea=None, datos=None):
    menu = ['<li><a href="%sindex.html"%s>%s Inicio</a></li>'
            % (pre, ' aria-current="page"' if activo == 'inicio' else '', ico('inicio', 15))]
    if datos:
        menu.append('<li>%s</li>' % desplegable_secciones(pre))
        menu.append('<li>%s</li>' % desplegable_proyectos(datos, pre))
    menu.append('<li><a href="%sindex.html#publicados">%s Publicados</a></li>'
                % (pre, ico('cohete', 15)))
    return """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(tit)s</title>
<meta name="description" content="%(desc)s">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="%(fuentes)s">
<link rel="stylesheet" href="%(pre)sassets/css/marca.css?v=%(v)s">
<link rel="stylesheet" href="%(swiper_css)s">
<link rel="stylesheet" href="%(pre)sassets/css/sitio.css?v=%(v)s">
<script src="%(swiper_js)s" defer></script>
<script src="%(gsap)s" defer></script>
<script src="%(gsap_st)s" defer></script>
<script src="%(pre)sassets/js/sitio.js?v=%(v)s" defer></script>
</head>
<body%(linea)s class="no-js">
<script>document.body.classList.remove('no-js');</script>
<nav class="barra" aria-label="Navegacion principal"><div class="envoltura">
<a class="marca-sitio" href="%(pre)sindex.html">
<span class="sigla">%(logo)s</span>
<span>Tecnologia con Sentido<small>Semillero Maker</small></span>
</a>
<ul class="menu">%(menu)s</ul>
</div></nav>
""" % {'tit': e(titulo), 'desc': e(desc), 'pre': pre, 'fuentes': FUENTES_WEB,
       'menu': ''.join(menu), 'logo': ico('capas', 18),
       'v': VERSION_ASSETS,
       'swiper_css': SWIPER_CSS, 'swiper_js': SWIPER_JS,
       'gsap': GSAP_JS, 'gsap_st': GSAP_ST,
       'linea': ' data-linea="%s"' % e(linea) if linea else ''}


VISTAS = [('Resumen', '', 'brujula'), ('Módulos', '-modulos', 'libro'),
          ('La ruta', '-ruta', 'mapa'), ('Desarrollo', '-desarrollo', 'cohete'),
          ('El artículo', '-articulo', 'documento')]

# Qué se pidió en cada sesión. Enlaza el módulo de la semana con las tareas
# que el sitio ya mide, para que cada módulo muestre el avance real del equipo
# en lo que se pidió ESA semana, y no un avance general.
ENTREGABLES = {
    'A': ['prop'],
    'B': ['cron', 'acue', 'nece'],
    'C': ['bocg', 'bocr'],
    'D': ['fich'],
    'E': ['preg', 'barr', 'casi'],
    'F': ['evid'],
    'G': ['dect'],
}

# Recursos que complementan cada módulo, fuera de la presentación.
# Cuando no hay uno que sirva, se deja dicho qué tendría que explicar el
# tutorial que el profe va a grabar, igual que en los hitos.
RECURSOS_MODULO = {
    'A': {'recursos': [], 'porGrabar': 'Cómo plantear el problema a partir de lo observado, con un ejemplo real de un equipo.'},
    'B': {'recursos': [], 'porGrabar': 'Cómo repartir tareas en un cronograma de tres meses sin que todo quede para la última semana.'},
    'C': {'recursos': [{'titulo': 'Primeros pasos en la web, MDN en español', 'url': 'https://developer.mozilla.org/es/docs/Learn_web_development/Getting_started/Your_first_website'}],
          'porGrabar': 'Cómo pasar de un boceto en papel a la primera pantalla, sin saltarse el boceto.'},
    'D': {'recursos': [], 'porGrabar': 'Cómo llenar la ficha técnica: qué es un requerimiento y cómo se comprueba.'},
    'E': {'recursos': [], 'porGrabar': 'Cómo escribir la sección 1.2 citando tres autores con año, sin copiar y pegar.'},
    'F': {'recursos': [{'titulo': 'Unity Essentials, ruta oficial', 'url': 'https://learn.unity.com/pathway/unity-essentials'},
                       {'titulo': 'Fundamentos de servomotores con Arduino', 'url': 'https://docs.arduino.cc/learn/electronics/servo-motors/'}],
          'porGrabar': None},
    'G': {'recursos': [{'titulo': 'Agregar un sistema de puntaje en Unity', 'url': 'https://learn.unity.com/pathway/game-development/unit/create-a-basic-2d-game/tutorial/add-a-scoring-system'},
                       {'titulo': 'Empezar con CSS, MDN en español', 'url': 'https://developer.mozilla.org/es/docs/Learn_web_development/Core/Styling_basics/Getting_started'}],
          'porGrabar': 'Cómo guardar una versión nueva del artículo sin perder la anterior.'},
}


def cargar_modulos():
    ruta = os.path.join(RAIZ, 'datos', 'modulos.json')
    if not os.path.exists(ruta):
        return []
    with open(ruta, encoding='utf-8') as fh:
        return json.load(fh).get('modulos', [])


def mapa_fijo(datos, equipo, nv, act, vista_activa):
    """
    El mapa que queda pegado arriba. Responde siempre tres preguntas:
    en que proyecto estoy, en cual de sus cuatro vistas, y en que nivel va
    el proyecto. Es lo que vuelve navegable una jerarquia de tres pisos.
    """
    linea = datos['lineas'][equipo['linea']]
    s = equipo['slug']
    p = ['<div class="mapa"><div class="envoltura">']

    # fila 1: donde estoy en la jerarquia
    p.append('<ol class="mapa-ruta">')
    p.append('<li><a href="../index.html">%s Portal</a></li>' % ico('inicio', 14))
    p.append('<li><a href="../index.html#linea-%s"><span class="insignia">%s %s</span></a></li>'
             % (e(equipo['linea']), ico(ICONO_LINEA.get(equipo['linea'], 'diana'), 13),
                e(linea['nombre'])))
    p.append('<li><a class="aqui" href="%s.html">'
             '<span class="num-mapa">%s</span>%s</a></li>'
             % (e(s), e(equipo['numero']), e(equipo['nombre'])))
    p.append('</ol>')

    # fila 2: las cuatro subsecciones
    p.append('<nav class="mapa-vistas" aria-label="Vistas del proyecto">')
    for titulo, sufijo, icono in VISTAS:
        actual = ' aria-current="page"' if sufijo == vista_activa else ''
        p.append('<a href="%s%s.html"%s>%s%s</a>' % (e(s), sufijo, actual, ico(icono, 15), e(titulo)))
    p.append('</nav>')

    # fila 3: los siete niveles, siempre visibles
    p.append('<ol class="mapa-niveles" aria-label="Avance por niveles">')
    for i, n in enumerate(nv):
        if i:
            p.append('<li class="guion" aria-hidden="true"></li>')
        aqui = ' aqui' if n is act else ''
        marca = ico('check', 13) if n['color'] == 'verde' else str(n['n'])
        p.append('<li class="%s%s"><a class="punto" href="%s-ruta.html#nivel-%d" '
                 'title="Nivel %d: %s, %d de %d tareas">%s</a></li>'
                 % (n['color'], aqui, e(s), n['n'], n['n'], e(n['fase']['nombre']),
                    n['hechas'], n['total'], marca))
    p.append('<li class="rotulo-aqui">vas en <b>%s</b>, nivel %d de 7</li>'
             % (e(act['fase']['nombre']), act['n']))
    p.append('</ol>')

    p.append('</div></div>')
    return ''.join(p)


def mapa_portal(secciones, activa=None):
    """El mismo mapa, para el portal: sus secciones en vez de las vistas."""
    p = ['<div class="mapa"><div class="envoltura">']
    p.append('<ol class="mapa-ruta"><li><span class="aqui">%s Portal del semillero</span></li>'
             '<li>quince proyectos, cuatro lineas tecnicas</li></ol>' % ico('inicio', 14))
    p.append('<nav class="mapa-vistas" id="mapa-secciones" aria-label="Secciones del portal">')
    for ancla, titulo, icono in secciones:
        p.append('<a href="#%s" data-seccion="%s">%s%s</a>' % (e(ancla), e(ancla), ico(icono, 15), e(titulo)))
    p.append('</nav></div></div>')
    return ''.join(p)


def migas(items):
    """items: lista de (texto, url o None). El último es la página actual."""
    li = []
    for i, (texto, url) in enumerate(items):
        if url and i < len(items) - 1:
            li.append('<li><a href="%s">%s</a></li>' % (e(url), e(texto)))
        else:
            li.append('<li><span aria-current="page">%s</span></li>' % e(texto))
    return ('<nav class="migas" aria-label="Ruta de navegación"><div class="envoltura">'
            '<ol>%s</ol></div></nav>' % ''.join(li))


def pie(meta):
    return """<footer class="pie"><div class="envoltura">
<span class="nombre">Semillero Maker de Tecnología con Sentido</span>
<p>%(doc)s · %(col)s · Semestre %(sem)s. Última revisión: %(rev)s.</p>
<p>Tres espacios con nombre propio: el Semillero Maker de Tecnología con Sentido,
Filosofartec y Un Café con la Iguana.</p>
</div></footer>
</body>
</html>
""" % {'doc': e(meta['docente']), 'col': e(meta['colegio']),
       'sem': e(meta['semestre']), 'rev': e(fecha_larga(meta['revisado']))}


def panel_intro(piezas):
    """Panel introductorio: explica cómo se lee antes de soltar el dato."""
    li = ''.join(
        '<li><div class="pieza"><span class="icono">%s</span><h3>%s</h3><p>%s</p></div></li>'
        % (ico(i, 19), e(t), e(d)) for i, t, d in piezas)
    return '<ul class="intro">%s</ul>' % li


LEYENDA = """<div class="convenciones">
<div>%s<b>Superado:</b><small>todas las tareas del nivel</small></div>
<div>%s<b>En curso:</b><small>algunas, no todas</small></div>
<div>%s<b>Sin empezar:</b><small>ninguna todavía</small></div>
</div>""" % (chip('verde', 'verde', 'check'), chip('ambar', 'amarillo'), chip('gris', 'gris'))


# ====================================================================
# Portal
# ====================================================================

def pagina_portal(datos):
    meta = datos['meta']
    n = len(datos['equipos'])
    agre = {'prop': 0, 'fich': 0, 'casi': 0}
    art_con_algo = 0
    glob_h = glob_t = 0
    for eq in datos['equipos']:
        for k in agre:
            if eq['estado'].get(k, [False])[0]:
                agre[k] += 1
        _, ah, _ = resumen_articulo(datos, eq)
        if ah:
            art_con_algo += 1
        hh, tt, _ = totales(datos, eq)
        glob_h += hh
        glob_t += tt

    h = [cabeza('Semillero Maker de Tecnología con Sentido',
                'Portal del Semillero Maker de Tecnología con Sentido: catorce proyectos, '
                'su ruta por niveles y acceso a los que ya están publicados.',
                '', 'inicio', datos=datos)]
    h.append(mapa_portal([('como', 'Como funciona', 'ayuda'),
                          ('numeros', 'Diagnostico', 'tendencia'),
                          ('proyectos', 'Los proyectos', 'tablero'),
                          ('publicados', 'Publicados', 'cohete'),
                          ('hermanos', 'Hermanos', 'globo')]))

    # --- portada oscura ---
    h.append('<header class="portada"><div class="envoltura">')
    h.append('<p class="rotulo">Semestre %s · grados 9°, 10° y 11°</p>' % e(meta['semestre']))
    h.append('<h1>Semillero Maker de Tecnología con Sentido</h1>')
    h.append('<p class="bajada">Catorce equipos construyen algo que sirve y lo documentan como '
             'investigación. Aquí cada uno ve en qué nivel va, qué le falta y dónde está lo que '
             'ya publicó.</p>')
    h.append('<ul class="portada-cifras">')
    for cifra, pie_ in [(n, 'subequipos'), (len(datos['lineas']), 'líneas técnicas'),
                        ('%d%%' % pct(glob_h, glob_t), 'avance del semillero'),
                        (len(meta['sesionesRestantes']), 'sesiones restantes')]:
        h.append('<li><span class="cifra">%s</span><span class="pie">%s</span></li>' % (e(cifra), e(pie_)))
    h.append('</ul>')
    h.append('<div class="botones portada-acciones">'
             '<a class="boton principal" href="#proyectos">%s Ver los proyectos</a>'
             '<a class="boton" href="#como">Cómo funciona esto</a></div>' % ico('flecha', 17))
    h.append('</div></header>')

    h.append('<main>')

    # --- cómo funciona: panel introductorio ---
    h.append('<section class="bloque sobre-superficie" id="como" data-tinte="teal">'
             '<div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Cómo funciona</span>'
             '<h2>Cada proyecto es una ruta de siete niveles</h2>'
             '<p>Las fases del Design Thinking, anidadas con el método científico. '
             'Un nivel se supera cuando todas sus tareas tienen evidencia real en la carpeta '
             'del equipo o en su repositorio. Nadie marca nada a mano.</p></div>')
    h.append(panel_intro([
        ('mapa', 'Niveles por superar',
         'Siete niveles, de Empatizar a Comunicar. Cada uno muestra su barra de avance y si está '
         'superado, en curso o sin empezar.'),
        ('capas', 'Dos niveles de detalle',
         'La tarea suelta es binaria: hecha o no hecha. El nivel completo lleva semáforo de tres '
         'colores, calculado contando sus tareas.'),
        ('lupa', 'Todo con evidencia',
         'Debajo de cada tarea dice de qué archivo o de qué commit salió. Si no hay nada que '
         'citar, la tarea no está hecha.'),
        ('cohete', 'Acceso a lo publicado',
         'Los proyectos que ya están en internet se abren desde aquí, con una vista previa en '
         'vivo de cómo se ven hoy.'),
    ]))
    h.append('<div class="tras-intro">%s</div>' % LEYENDA)
    h.append('</div></section>')

    # --- números ---
    h.append('<section class="bloque" id="numeros" data-tinte="carmin">'
             '<div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Diagnóstico</span>'
             '<h2>El semillero, de un vistazo</h2>'
             '<p>Estos números salen de medir los documentos por dentro, no de contar si el '
             'archivo existe. Dicen lo que hay, no lo que debería haber.</p></div>')
    h.append('<div class="rejilla c4">')
    for valor, leyenda, clase in [
            ('%d de %d' % (agre['prop'], n), 'propuestas escritas de verdad',
             'bien' if agre['prop'] > n / 2 else 'alerta'),
            ('%d de %d' % (agre['fich'], n), 'fichas técnicas diligenciadas',
             'bien' if agre['fich'] > n / 2 else 'alerta'),
            ('%d de %d' % (art_con_algo, n), 'artículos con alguna sección escrita',
             'bien' if art_con_algo > n / 2 else 'alerta'),
            ('%d de %d' % (agre['casi'], n), 'hojas de barreras con casillas marcadas', 'alerta')]:
        h.append('<div class="celda"><span class="cifra %s">%s</span>'
                 '<p class="leyenda">%s</p></div>' % (clase, e(valor), e(leyenda)))
    h.append('</div>')
    h.append('<div class="nota-caja cian" style="margin-top:16px">'
             '<span class="titulo">%s<b>Lo que esto significa</b></span>'
             'Hay equipos con software funcionando y publicado cuyo artículo sigue en blanco. '
             'El desfase no es de avance, es de registro.</div>' % ico('bombilla', 17))
    h.append('</div></section>')

    # --- proyectos por línea ---
    h.append('<section class="bloque sobre-superficie" id="proyectos" data-tinte="indigo">'
             '<div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Los proyectos</span>'
             '<h2>Catorce equipos, cuatro líneas técnicas</h2>'
             '<p>Cada tarjeta trae el avance de la ruta completa y el del artículo. '
             'Entra a la del equipo para ver su nivel actual y qué sigue.</p></div>')
    h.append('<div class="buscador">')
    h.append('<label class="campo" for="q">%s'
             '<input type="search" id="q" placeholder="Busca por numero, nombre, '
             'integrante o linea" autocomplete="off" spellcheck="false">'
             '<button type="button" id="q-limpiar" hidden aria-label="Limpiar busqueda">%s</button>'
             '</label>' % (ico('lupa', 19), ico('check', 16)))
    h.append('<p class="buscador-estado dato" id="q-estado" role="status">'
             '%d proyectos</p>' % len(datos['equipos']))
    h.append('</div>')
    h.append('<p class="sin-resultados dato" id="q-vacio" hidden>%s '
             'No hay ningun proyecto con eso. Prueba con el numero del equipo, '
             'con un nombre o con el de un integrante.</p>' % ico('ayuda', 17))

    for clave, linea in datos['lineas'].items():
        equipos = [x for x in datos['equipos'] if x['linea'] == clave]
        if not equipos:
            continue
        h.append('<div class="grupo-linea" data-grupo="%s">' % e(clave))
        h.append('<div class="cab-sub" id="linea-%s" data-linea="%s">'
                 '<span class="icono">%s</span><h3>%s</h3>'
                 '<span class="dato">%d equipos</span></div>'
                 % (e(clave), e(clave), ico(ICONO_LINEA.get(clave, 'diana'), 20),
                    e(linea['nombre']), len(equipos)))
        h.append('<p class="dato" style="margin:-8px 0 14px;max-width:72ch">%s</p>' % e(linea['nota']))
        h.append('<div class="rejilla c3">')
        for eq in equipos:
            hh, tt, nv = totales(datos, eq)
            _, ah, at = resumen_articulo(datos, eq)
            act = nivel_actual(nv)
            buscable = ' '.join([eq['numero'], 'equipo ' + eq['numero'], eq['nombre'],
                                 eq['integrantes'], linea['nombre'], eq.get('stack', '')])
            h.append('<a class="equipo revelar" data-linea="%s" data-buscar="%s" '
                     'href="equipos/%s.html">'
                     % (e(clave), e(buscable.lower()), e(eq['slug'])))
            h.append('<div class="banda">%s<span>%s</span></div>'
                     % (ico(ICONO_LINEA.get(clave, 'diana'), 17), e(linea['nombre'])))
            h.append('<div class="interior">')
            h.append('<div class="titular"><span class="numero-equipo">'
                     '<small>equipo</small><b>%s</b></span><h3>%s</h3></div>'
                     % (e(eq['numero']), e(eq['nombre'])))
            h.append('<p class="quien">%s</p>' % e(eq['integrantes']))
            h.append('<div class="medidas">%s%s</div>'
                     % (progreso('Ruta, nivel %d de 7' % act['n'], hh, tt),
                        progreso('Artículo', ah, at)))
            if (eq.get('publicacion') or {}).get('estado') == 'en linea':
                h.append('<span class="sello"><span class="punto"></span>publicado y en línea</span>')
            h.append('</div></a>')
        h.append('</div></div>')
    h.append('</div></section>')

    # --- publicados ---
    h.append('<section class="bloque" id="publicados" data-tinte="violeta">'
             '<div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Acceso directo</span>'
             '<h2>Proyectos ejecutables</h2>'
             '<p>Lo que ya se puede abrir, y lo que falta para abrir el resto. Cuando un proyecto '
             'está publicado se ve aquí mismo, cargado en vivo desde su propia dirección.</p></div>')
    h.append('<div class="rejilla c2">')
    for eq in datos['equipos']:
        pub = eq.get('publicacion') or {}
        if not pub.get('url') and not pub.get('repo'):
            continue
        color, rotulo = PUBLICACION.get(pub.get('estado', 'no aplica'), PUBLICACION['no aplica'])
        h.append('<div class="publicacion %s">' % color)
        h.append('<div class="encima">%s<span class="rotulo-pub">%s</span></div>'
                 % (chip(color, rotulo, 'cohete' if pub.get('url') else None), e(eq['nombre'])))
        h.append('<p class="dato">Equipo %s · %s</p>' % (e(eq['numero']), e(eq['integrantes'])))
        if pub.get('url'):
            h.append(vista_previa(pub['url'], eq['nombre']))
        bot = []
        if pub.get('url'):
            bot.append('<a class="boton principal" href="%s">%s Abrir</a>'
                       % (e(pub['url']), ico('externo', 17)))
        if pub.get('repo'):
            bot.append('<a class="boton" href="%s">%s GitHub</a>' % (e(pub['repo']), ico('github', 17)))
        bot.append('<a class="boton" href="equipos/%s.html">Ver su ruta</a>' % e(eq['slug']))
        h.append('<div class="botones">%s</div>' % ''.join(bot))
        if pub.get('nota'):
            h.append('<p class="nota">%s</p>' % e(pub['nota']))
        h.append('</div>')
    h.append('</div></div></section>')

    # --- hermanos ---
    h.append('<section class="bloque sobre-superficie" id="hermanos"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Proyectos hermanos</span>'
             '<h2>Filosofartec y Un Café con la Iguana</h2>'
             '<p>Dos espacios con nombre propio, distintos del semillero y distintos entre sí. '
             'El semillero los enlaza, no los absorbe.</p></div>')
    h.append('<div class="rejilla c2">')
    for herm in datos['hermanos']:
        h.append('<div class="hermano"><h3>%s</h3><p>%s</p><p class="relacion">%s</p>'
                 % (e(herm['nombre']), e(herm['que']), e(herm['relacion'])))
        if herm.get('enlaces'):
            h.append('<div class="botones">%s</div>' % ''.join(
                '<a class="boton" href="%s">%s %s</a>' % (e(x['url']), ico('externo', 17), e(x['titulo']))
                for x in herm['enlaces']))
        h.append('</div>')
    h.append('</div></div></section>')

    h.append('</main>')
    h.append(pie(meta))
    return ''.join(h)


# ====================================================================
# Páginas de equipo
# ====================================================================

def portada_equipo(datos, equipo, hh, tt, compacta=False):
    linea = datos['lineas'][equipo['linea']]
    p = ['<header class="portada%s"><div class="envoltura">' % (' compacta' if compacta else '')]
    p.append('<div class="identidad"><span class="placa-equipo">'
             '<small>equipo</small><b>%s</b></span>'
             '<span class="insignia-linea">%s %s</span></div>'
             % (e(equipo['numero']), ico(ICONO_LINEA.get(equipo['linea'], 'diana'), 17),
                e(linea['nombre'])))
    p.append('<h1>%s</h1>' % e(equipo['nombre']))
    p.append('<p class="bajada">%s</p>' % e(equipo['integrantes']))
    if not compacta:
        p.append('<div class="portada-anillo">%s</div>' % anillo(hh, tt))
    p.append('</div></header>')
    return ''.join(p)


def pagina_equipo(datos, equipo):
    """Resumen: dónde va, qué sigue, y las puertas a las tres vistas."""
    meta = datos['meta']
    _hh_lat, _tt_lat, _nv_lat = totales(datos, equipo)
    _mods_lat = cargar_modulos()
    hh, tt, nv = totales(datos, equipo)
    act = nivel_actual(nv)
    desarrollo, dh, dt = resumen_desarrollo(datos, equipo)
    _, ah, at = resumen_articulo(datos, equipo)
    s = equipo['slug']

    pendientes = [t for t in act['tareas'] if not t[2]]

    h = [cabeza('%s · Semillero Maker' % equipo['nombre'],
                'Ruta por niveles, desarrollo tecnológico y estado del artículo del equipo %s.'
                % equipo['numero'], '../', linea=equipo['linea'], datos=datos)]
    h.append(mapa_fijo(datos, equipo, nv, act, ''))
    h.append(portada_equipo(datos, equipo, hh, tt))
    h.append('<div class="con-lateral">')
    h.append(menu_izquierdo(datos, equipo, _nv_lat, nivel_actual(_nv_lat), '', _mods_lat))
    h.append('<main class="principal">')

    # --- nivel actual ---
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="nivel-actual">')
    h.append('<div class="encima">%s<span class="dato">Nivel %d de 7</span></div>'
             % (chip(act['color'], ESTADO_NIVEL[act['color']], 'diana'), act['n']))
    h.append('<h2>Vas en %s</h2>' % e(act['fase']['nombre']))
    h.append('<p class="siguiente">%s</p>' % e(act['fase']['que']))
    h.append(progreso('Avance de este nivel', act['hechas'], act['total'], alta=True))
    if pendientes:
        h.append('<div class="nota-caja cian"><span class="titulo">%s<b>Lo que sigue</b></span>'
                 '<ul class="tareas" style="margin-top:6px">%s</ul></div>'
                 % (ico('flecha', 17),
                    ''.join('<li class="pendiente"><span class="casilla">%s</span>'
                            '<span class="texto"><b>%s</b><span class="fuente dato">%s</span></span></li>'
                            % (ico('check', 13), e(t[1]), e(t[3])) for t in pendientes[:3])))
    else:
        h.append('<div class="nota-caja verde"><span class="titulo">%s<b>Nivel completo</b></span>'
                 'Todas las tareas de este nivel tienen evidencia. Sigue con el siguiente.</div>'
                 % ico('check', 17))
    h.append('</div></div></section>')

    # --- publicación ---
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Tu proyecto</span>'
             '<h2>Dónde está lo que construyeron</h2></div>')
    h.append(bloque_publicacion(equipo))
    h.append('</div></section>')

    # --- las tres vistas ---
    h.append('<section class="bloque sobre-superficie"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">Las cuatro vistas</span>'
             '<h2>Tu proceso, por dentro</h2>'
             '<p>El mismo proyecto mirado de cuatro maneras. Entra a la que necesites.</p></div>')
    h.append('<div class="rejilla c3">')
    for icono, titulo, desc, url, (a, b) in [
            ('libro', 'Módulos del semestre',
             'Semana por semana: lo que se pidió, las diapositivas de la sesión y recursos para repasar.',
             '%s-modulos.html' % s, (hh, tt)),
            ('mapa', 'La ruta por niveles',
             'Los siete niveles del semestre, con las tareas de cada uno y de dónde salió su estado.',
             '%s-ruta.html' % s, (hh, tt)),
            ('cohete', 'Desarrollo tecnológico',
             'Los hitos técnicos del proyecto, con orientación y tutoriales para cada uno.',
             '%s-desarrollo.html' % s, (dh, dt)),
            ('documento', 'El artículo',
             'Las quince secciones y, en cada una, qué dato concreto falta para poder escribirla.',
             '%s-articulo.html' % s, (ah, at))]:
        h.append('<a class="vista" href="%s">' % e(url))
        h.append('<div class="encima"><span class="icono">%s</span>%s</div>'
                 % (ico(icono, 22), ico('flecha', 19)))
        h.append('<h3>%s</h3><p>%s</p>%s</a>' % (e(titulo), e(desc), progreso('Avance', a, b)))
    h.append('</div></div></section>')

    # --- el mapa de niveles, compacto ---
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">%s El camino</span>'
             '<h2>Las siete paradas del semestre</h2>'
             '<p>Cada parada se gana cumpliendo sus tareas. Las que ya pasaron quedan '
             'en verde; la que tiene el globo es donde va el equipo ahora.</p></div>'
             % ico('mapa', 15))
    h.append(camino(nv, act, '%s-ruta.html' % s, s))
    h.append('</div></section>')

    # --- esta semana ---
    h.append(seccion_semana(datos, equipo, nv))
    h.append('</main>')
    h.append(panel_derecho(datos, equipo, _nv_lat, nivel_actual(_nv_lat), _hh_lat, _tt_lat))
    h.append('</div>')
    h.append(pie(meta))
    return ''.join(h)


def mapa_niveles(nv, act, enlace=None):
    li = []
    for n in nv:
        clases = '%s%s' % (n['color'], ' es-actual' if n is act else '')
        marca = ico('check', 20) if n['color'] == 'verde' else str(n['n'])
        cuerpo = ('<div class="cuerpo"><div class="titulo"><h3>%s</h3>'
                  '<span class="paso">%s</span></div>'
                  '<span class="estado-txt">%s · %d de %d tareas</span>%s</div>'
                  % (e(n['fase']['nombre']), e(n['fase']['paso']),
                     ESTADO_NIVEL[n['color']], n['hechas'], n['total'],
                     barra(n['hechas'], n['total'])))
        der = ('<div class="derecha"><span class="dato">%d%%</span>%s</div>'
               % (n['pct'], '<span class="flecha">%s</span>' % ico('chevron', 18) if enlace else ''))
        cuerpo_total = '<span class="marca">%s</span>%s%s' % (marca, cuerpo, der)
        if enlace:
            li.append('<li><a class="nivel %s" href="%s#nivel-%d">%s</a></li>'
                      % (clases, e(enlace), n['n'], cuerpo_total))
        else:
            li.append('<li><div class="nivel %s">%s</div></li>' % (clases, cuerpo_total))
    return '<ol class="niveles">%s</ol>' % ''.join(li)


def seccion_semana(datos, equipo, nv):
    meta = datos['meta']
    ya, falta, sigue = [], [], []
    for n in nv:
        for _id, texto, hecha, fuente, _h in n['tareas']:
            (ya if hecha else falta).append((texto, fuente, n['fase']['nombre']))
    sigue = falta[:4]

    h = ['<section class="bloque sobre-superficie"><div class="envoltura">']
    h.append('<div class="cab-seccion"><span class="rotulo">%s Esta semana</span>'
             '<h2>%s</h2><p>Revisado el %s. Quedan %d sesiones antes del cierre.</p></div>'
             % (ico('reloj', 15),
                e(meta['sesionesRestantes'][0][0].upper() + meta['sesionesRestantes'][0][1:]),
                e(fecha_larga(meta['revisado'])), len(meta['sesionesRestantes'])))
    h.append('<div class="columnas">')
    h.append('<div><h3 class="ya">%s Lo que ya tienes</h3><ul>' % ico('check', 14))
    if ya:
        for texto, fuente, _f in ya[-5:][::-1]:
            h.append('<li><span><b>%s.</b> <span class="dato">%s</span></span></li>' % (e(texto), e(fuente)))
    else:
        h.append('<li><span>Todavía no hay ninguna tarea con evidencia. Empieza por la propuesta: '
                 'es la que abre todo lo demás.</span></li>')
    h.append('</ul></div>')
    h.append('<div><h3 class="falta">%s Lo que te falta</h3><ul>' % ico('lupa', 14))
    for texto, fuente, _f in (falta[:5] or []):
        h.append('<li><span><b>%s.</b> <span class="dato">%s</span></span></li>' % (e(texto), e(fuente)))
    if not falta:
        h.append('<li><span>Nada pendiente. Revisa el artículo y guarda la versión final.</span></li>')
    h.append('</ul></div>')
    h.append('<div><h3 class="sigue">%s Por dónde empezar</h3><ul>' % ico('flecha', 14))
    for texto, _fu, fase in sigue:
        h.append('<li><span>%s <span class="dato">· nivel %s</span></span></li>' % (e(texto), e(fase)))
    if not sigue:
        h.append('<li><span>Cierra el artículo y guarda la versión final.</span></li>')
    h.append('</ul></div>')
    h.append('</div></div></section>')
    return ''.join(h)


def seccion_origen(meta):
    return ('<section class="bloque"><div class="envoltura"><div class="origen">'
            '<h2>%s De dónde sale este estado</h2>'
            '<p>Ninguna casilla se marca a mano. Cada revisión recorre estas fuentes y vuelve a contar.</p>'
            '<ol>%s</ol>'
            '<div class="nota-caja ambar" style="margin-top:16px">'
            '<span class="titulo">%s<b>Lo que esta revisión no alcanza a ver</b></span>'
            'El trabajo que quedó en los computadores de la sala y no se subió. Si construyeron algo '
            'y aquí sale sin marcar, súbanlo a su carpeta o a GitHub y en la próxima revisión aparece.'
            '</div></div></div></section>'
            % (ico('lupa', 19), ''.join('<li>%s</li>' % e(f) for f in meta['fuentes']),
               ico('bombilla', 17)))



def cargar_videos():
    ruta = os.path.join(RAIZ, 'datos', 'videos.json')
    if not os.path.exists(ruta):
        return {'videos': [], 'pendientes': []}
    with open(ruta, encoding='utf-8') as fh:
        return json.load(fh)


def puntos_de(hechas):
    """Los puntos del equipo. Suben solo al cumplir tareas."""
    return hechas * PUNTOS_TAREA


def video_miniatura(v, bloqueado=False, motivo=''):
    """
    Miniatura de YouTube que se abre dentro de la página.

    El reproductor NO se carga hasta que alguien hace clic: hasta entonces
    solo hay una imagen. Así una página con siete videos sigue cargando
    rápido y YouTube no rastrea a quien no los vio.
    """
    if bloqueado:
        return ('<div class="video bloqueado"><div class="lienzo-video">'
                '<span class="candado">%s</span></div>'
                '<div class="video-pie"><h4>%s</h4>'
                '<p class="dato">%s</p></div></div>'
                % (ico('llave', 22), e(v['titulo']), e(motivo)))
    if not v.get('id'):
        return ('<div class="video sin-grabar"><div class="lienzo-video">'
                '<span class="candado">%s</span><span class="rotulo">por grabar</span></div>'
                '<div class="video-pie"><h4>%s</h4><p class="dato">%s</p></div></div>'
                % (ico('video', 22), e(v['titulo']), e(v.get('que', ''))))
    return ('<div class="video"><button type="button" class="lienzo-video" '
            'data-video="%s" aria-label="Reproducir %s">'
            '<img src="https://i.ytimg.com/vi/%s/hqdefault.jpg" alt="" loading="lazy" '
            'width="480" height="360">'
            '<span class="play">%s</span></button>'
            '<div class="video-pie"><h4>%s</h4>%s<p class="dato">%s</p></div></div>'
            % (e(v['id']), e(v['titulo']), e(v['id']), ico('play', 24), e(v['titulo']),
               ('<span class="chip cian">%s</span>' % e(v['nota'])) if v.get('nota') else '',
               e(v.get('porque') or v.get('que', ''))))


def camino(nv, act, enlace, slug):
    """
    El camino del semestre, al estilo de una ruta de aprendizaje: las paradas
    no van en columna recta sino en zigzag, y el nodo donde va el equipo se
    marca. Es la misma información que una lista, pero se lee como un
    recorrido y no como un inventario.
    """
    # El vaivén. Con siete paradas dibuja una ese completa.
    desvios = [0, 1, 2, 1, 0, -1, -2]
    p = ['<ol class="camino">']
    for i, n in enumerate(nv):
        d = desvios[i % len(desvios)]
        if i:
            medio = (desvios[(i - 1) % len(desvios)] + d) / 2.0
            p.append('<li class="enlace-camino" aria-hidden="true" style="--desvio:%.1f">'
                     '<span></span><span></span><span></span></li>' % medio)
        clases = '%s%s' % (n['color'], ' aqui' if n is act else '')
        marca = ico('check', 26) if n['color'] == 'verde' else str(n['n'])
        p.append('<li class="parada %s" style="--desvio:%d">' % (clases, d))
        if n is act:
            p.append('<span class="globo">vas aquí</span>')
        p.append('<a class="nodo" href="%s#nivel-%d" title="%s: %d de %d tareas">%s</a>'
                 % (e(enlace), n['n'], e(n['fase']['nombre']), n['hechas'], n['total'], marca))
        p.append('<div class="parada-txt"><b>%s</b><span class="dato">%d de %d</span></div>'
                 % (e(n['fase']['nombre']), n['hechas'], n['total']))
        p.append('</li>')
    p.append('</ol>')
    return ''.join(p)


def menu_izquierdo(datos, equipo, nv, act, vista, modulos=None):
    """
    Indice del proyecto, a la izquierda y desplegable.

    Es la ruta sencilla que pidio el docente: de un vistazo se ve el proyecto
    completo, sus cinco vistas, sus siete paradas y sus modulos, y cual se
    esta mirando. Cada grupo es un <details>, asi que se pliega y funciona
    con teclado aunque el JavaScript no cargue. Los que corresponden a donde
    estas vienen abiertos.
    """
    s_ = equipo['slug']
    p = ['<nav class="lateral-izq" aria-label="Indice del proyecto">']
    p.append('<div class="izq-cab"><span class="rotulo">Indice</span>'
             '<b>%s</b></div>' % e(equipo['nombre']))

    p.append('<ul class="izq-vistas">')
    for titulo, sufijo, icono in VISTAS:
        actual = ' class="aqui" aria-current="page"' if sufijo == vista else ''
        p.append('<li><a href="%s%s.html"%s>%s<span>%s</span></a></li>'
                 % (e(s_), sufijo, actual, ico(icono, 16), e(titulo)))
    p.append('</ul>')

    # El camino, plegable
    p.append('<details class="izq-grupo"%s><summary>%s El camino '
             '<span class="cuenta">%d/%d</span></summary><ul>'
             % (' open' if vista in ('', '-ruta') else '', ico('mapa', 15),
                sum(1 for n in nv if n['color'] == 'verde'), len(nv)))
    for n in nv:
        aqui = ' class="aqui"' if n is act else ''
        p.append('<li><a href="%s-ruta.html#nivel-%d"%s>'
                 '<i class="pt %s"></i><span>%s</span>'
                 '<em class="dato">%d/%d</em></a></li>'
                 % (e(s_), n['n'], aqui, n['color'], e(n['fase']['nombre']),
                    n['hechas'], n['total']))
    p.append('</ul></details>')

    # Los modulos, plegables
    if modulos:
        p.append('<details class="izq-grupo"%s><summary>%s Modulos '
                 '<span class="cuenta">%d</span></summary><ul>'
                 % (' open' if vista == '-modulos' else '', ico('libro', 15), len(modulos)))
        for m in modulos:
            p.append('<li><a href="%s-modulos.html#mod-%s"><i class="letra">%s</i>'
                     '<span>%s</span></a></li>'
                     % (e(s_), e(m['letra']), e(m['letra']), e(m['sesion'])))
        p.append('</ul></details>')

    # Los otros proyectos
    p.append('<details class="izq-grupo"><summary>%s Otros proyectos '
             '<span class="cuenta">%d</span></summary><ul>'
             % (ico('tablero', 15), len(datos['equipos']) - 1))
    for eq in datos['equipos']:
        if eq['slug'] == s_:
            continue
        hh2, tt2, nv2 = totales(datos, eq)
        p.append('<li data-linea="%s"><a href="%s.html"><i class="num">%s</i>'
                 '<span>%s</span><em class="dato">%d%%</em></a></li>'
                 % (e(eq['linea']), e(eq['slug']), e(eq['numero']),
                    e(eq['nombre']), pct(hh2, tt2)))
    p.append('</ul></details>')

    p.append('<a class="izq-volver" href="../index.html">%s Portal del semillero</a>'
             % ico('inicio', 15))
    p.append('</nav>')
    return ''.join(p)


def panel_derecho(datos, equipo, nv, act, hh, tt):
    """
    Bloques de informacion a la derecha, como los de un aula virtual: el
    puntaje, el avance, lo que sigue y el acceso al proyecto publicado.
    No navegan, informan. Por eso van separados del indice.
    """
    _d, dh, dt = resumen_desarrollo(datos, equipo)
    _a, ah, at = resumen_articulo(datos, equipo)
    pend = [t for t in act['tareas'] if not t[2]]

    p = ['<aside class="lateral" aria-label="Estado del proyecto">']

    p.append('<div class="caja-lat destacada"><span class="rotulo">Puntos del equipo</span>')
    p.append('<div class="marcador"><b>%d</b><small>de %d posibles</small></div>'
             % (puntos_de(hh), puntos_de(tt)))
    p.append(barra(hh, tt, alta=True))
    p.append('<p class="dato">Cada tarea cumplida suma %d puntos. No hay otra forma '
             'de subir.</p></div>' % PUNTOS_TAREA)

    p.append('<div class="caja-lat"><span class="rotulo">Tu avance</span><ul class="medidas-lat">')
    for et, a, b in [('Ruta del semestre', hh, tt), ('Desarrollo tecnico', dh, dt),
                     ('Articulo', ah, at)]:
        p.append('<li>%s</li>' % progreso(et, a, b))
    p.append('</ul></div>')

    p.append('<div class="caja-lat"><span class="rotulo">Donde vas</span>'
             '<div class="donde-vas">%s<div><b>%s</b>'
             '<span class="dato">parada %d de %d</span></div></div>%s</div>'
             % (chip(act['color'], ESTADO_NIVEL[act['color']], 'diana'),
                e(act['fase']['nombre']), act['n'], len(nv),
                progreso('Esta parada', act['hechas'], act['total'])))

    if pend:
        p.append('<div class="caja-lat"><span class="rotulo">Lo que sigue</span>'
                 '<ul class="tareas compacta">')
        for _id, texto, _h, _f, _e in pend[:3]:
            p.append('<li class="pendiente"><span class="casilla">%s</span>'
                     '<span class="texto"><b>%s</b></span></li>' % (ico('check', 12), e(texto)))
        p.append('</ul><p class="dato">Hay %d puntos en juego en esta parada.</p></div>'
                 % puntos_de(len(pend)))

    pub = equipo.get('publicacion') or {}
    if pub.get('url') or pub.get('repo'):
        p.append('<div class="caja-lat"><span class="rotulo">Tu proyecto</span><div class="botones">')
        if pub.get('url'):
            p.append('<a class="boton principal" href="%s">%s Abrir</a>'
                     % (e(pub['url']), ico('externo', 16)))
        if pub.get('repo'):
            p.append('<a class="boton" href="%s">%s GitHub</a>'
                     % (e(pub['repo']), ico('github', 16)))
        p.append('</div></div>')

    p.append('</aside>')
    return ''.join(p)


def carrusel(m, diapos, pre='../'):
    """
    Carrusel de las diapositivas de una sesion, con Swiper.

    Se usa una libreria aqui y no en el resto del sitio porque un carrusel
    accesible de verdad es mucho trabajo: teclado, gestos tactiles, foco,
    miniaturas sincronizadas y carga diferida. Swiper lo resuelve y esta
    probado en millones de sitios.

    Las imagenes salen de las presentaciones reales, exportadas con
    PowerPoint y convertidas a WebP. Debajo queda el texto de cada
    diapositiva, para buscar con Ctrl+F y para lector de pantalla.
    """
    if not m.get('imagenes'):
        return ''
    cid = 'car-%s' % m['letra']
    p = ['<div class="carrusel" data-carrusel>']
    p.append('<div class="swiper principal-swiper" id="%s">' % cid)
    p.append('<div class="swiper-wrapper">')
    for d in diapos:
        ruta = '%sassets/diapositivas/%s/%d.webp' % (pre, m['letra'], d['n'])
        alt = d['titulo'] or ('Diapositiva %d' % d['n'])
        p.append('<div class="swiper-slide">'
                 '<img src="%s" alt="%s" loading="lazy" width="1600" height="900">'
                 '</div>' % (e(ruta), e(alt)))
    p.append('</div>')
    p.append('<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>')
    p.append('<div class="swiper-pagination"></div>')
    p.append('</div>')
    # Tira de miniaturas
    p.append('<div class="swiper miniaturas-swiper" data-para="%s"><div class="swiper-wrapper">' % cid)
    for d in diapos:
        ruta = '%sassets/diapositivas/%s/%d.webp' % (pre, m['letra'], d['n'])
        p.append('<div class="swiper-slide"><img src="%s" alt="" loading="lazy">'
                 '<span>%d</span></div>' % (e(ruta), d['n']))
    p.append('</div></div>')
    p.append('</div>')
    return ''.join(p)


def pagina_modulos(datos, equipo, modulos, videos=None):
    """
    Vista de modulos: la ruta de aprendizaje, semana por semana.

    Cada modulo junta tres cosas, que es lo que lo hace servir:
      1. lo que se pidio esa semana, con el avance REAL del equipo en eso
      2. las diapositivas de la sesion, legibles aqui mismo, filtradas a la
         linea del equipo mas las que eran para todos
      3. recursos de fuera de la presentacion, o el tutorial que falta grabar
    """
    meta = datos['meta']
    _hh_lat, _tt_lat, _nv_lat = totales(datos, equipo)
    _mods_lat = cargar_modulos()
    hh, tt, nv = totales(datos, equipo)
    act = nivel_actual(nv)
    estado = equipo['estado']
    linea_eq = equipo['linea']

    tareas_texto = {}
    for grupo in datos['tareasComunes'].values():
        for t in grupo:
            tareas_texto[t['id']] = t['texto']

    listos = total_ent = 0
    for m in modulos:
        ids = ENTREGABLES.get(m['letra'], [])
        m['_ent'] = []
        for i in ids:
            hecha, fuente = estado.get(i, [False, 'Sin revisar'])
            m['_ent'].append((i, tareas_texto.get(i, i), hecha, fuente))
        m['_hechas'] = sum(1 for x in m['_ent'] if x[2])
        m['_total'] = len(m['_ent'])
        listos += m['_hechas']
        total_ent += m['_total']

    h = [cabeza('Modulos - %s' % equipo['nombre'],
                'Ruta de aprendizaje semana por semana del equipo %s, con las diapositivas de '
                'cada sesion y lo que se pidio.' % equipo['numero'],
                '../', linea=equipo['linea'], datos=datos)]
    h.append(mapa_fijo(datos, equipo, nv, act, '-modulos'))
    h.append(portada_equipo(datos, equipo, hh, tt, compacta=True))

    h.append('<div class="con-lateral">')
    h.append(menu_izquierdo(datos, equipo, _nv_lat, nivel_actual(_nv_lat), '-modulos', _mods_lat))
    h.append('<main class="principal">')
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">%s Vista 2 de 5</span>'
             '<h2>Modulos del semestre</h2>'
             '<p>Una sesion, un modulo. Cada uno trae lo que se pidio esa semana, el material '
             'de apoyo que se proyecto en clase, y recursos de fuera para repasar. '
             'Las diapositivas estan aqui: no hay que ir a buscarlas al Drive.</p></div>'
             % ico('libro', 15))
    h.append(progreso('Entregables de las sesiones ya cumplidos', listos, total_ent, alta=True))
    h.append('</div></section>')

    h.append('<section class="bloque sobre-superficie"><div class="envoltura">')
    h.append('<ol class="modulos">')
    ETIQ = {'todos': 'para todos', 'unity': 'Unity', 'software': 'Desarrollo de software',
            'electronica': 'Electronica', 'audiovisual': 'Audiovisual'}
    # Regla de desbloqueo, al estilo del camino: estan abiertos todos los
    # modulos hasta donde va el equipo, y se cierran los siguientes. El primer
    # modulo con entregables sin cumplir es "donde vas": ese tambien esta
    # abierto, porque es justo el que se esta trabajando.
    #
    # Las diapositivas NO se bloquean nunca: son el material de clase y tienen
    # que estar disponibles siempre. Lo que se gana al avanzar son los recursos
    # extra y los tutoriales.
    frontera = len(modulos) - 1
    for i_f, mm in enumerate(modulos):
        if mm['_total'] and mm['_hechas'] < mm['_total']:
            frontera = i_f
            break

    for i_m, m in enumerate(modulos):
        col = color_de(m['_hechas'], m['_total'])
        diapos = [d for d in m['diapositivas'] if d['seccion'] in ('todos', linea_eq)]
        rec = RECURSOS_MODULO.get(m['letra'], {})
        bloqueado = i_m > frontera
        anterior_letra = modulos[frontera]['letra'] if bloqueado else ''
        faltan_antes = (modulos[frontera]['_total'] - modulos[frontera]['_hechas']) if bloqueado else 0
        h.append('<li class="modulo %s%s revelar" id="mod-%s">'
                 % (col, ' cerrado' if bloqueado else '', e(m['letra'])))
        h.append('<div class="modulo-cab">')
        h.append('<span class="letra">%s</span>' % (ico('llave', 22) if bloqueado else e(m['letra'])))
        detalle = ('%d diapositivas para tu linea' % len(diapos)) if diapos else 'sin presentacion'
        h.append('<div class="titulo"><h3>%s</h3><p class="dato">%s</p></div>'
                 % (e(m['sesion']), e(detalle)))
        if m['_total']:
            h.append('<div class="medida">%s</div>'
                     % progreso('Lo que se pidio', m['_hechas'], m['_total']))
        else:
            h.append('<div class="medida">%s</div>'
                     % chip('gris', 'sin entregable medible'))
        h.append('</div>')

        h.append('<div class="modulo-cuerpo">')
        if m['_ent']:
            h.append('<div class="modulo-parte"><h4>%s Lo que se pidio esta semana</h4>'
                     '<ul class="tareas">' % ico('lista', 16))
            for _id, texto, hecha, fuente in m['_ent']:
                h.append('<li class="%s"><span class="casilla">%s</span><span class="texto">'
                         '<b>%s</b><span class="fuente dato">%s</span></span></li>'
                         % ('hecha' if hecha else 'pendiente', ico('check', 13),
                            e(texto), e(fuente)))
            h.append('</ul></div>')

        if diapos:
            h.append('<details class="mas diapos" open><summary>%s Ver las %d diapositivas de '
                     'la sesion</summary><div>' % (ico('chevron', 14), len(diapos)))
            h.append('<p class="dato">Se muestran las de tu linea y las que eran para todos. '
                     'La presentacion completa esta en <code>%s</code>.</p>'
                     % e(m.get('archivo') or 'la carpeta de la sesion'))
            h.append(carrusel(m, diapos))
            h.append('<details class="mas texto-diapos"><summary>%s Leer el texto de las '
                     'diapositivas</summary><div>' % ico('documento', 14))
            h.append('<ol class="diapositivas">')
            for d in diapos:
                h.append('<li class="diapo"><div class="diapo-cab">'
                         '<span class="n">%d</span><h5>%s</h5><span class="seccion">%s</span></div>'
                         % (d['n'], e(d['titulo'] or 'Diapositiva'), e(ETIQ.get(d['seccion'], ''))))
                if d['cuerpo']:
                    h.append('<ul class="vinetas">%s</ul>'
                             % ''.join('<li>%s</li>' % e(x) for x in d['cuerpo']))
                for tabla in d['tablas']:
                    h.append('<div class="tabla-env"><table class="articulo"><tbody>')
                    for fi, fila in enumerate(tabla):
                        et = 'th' if fi == 0 else 'td'
                        h.append('<tr>%s</tr>'
                                 % ''.join('<%s>%s</%s>' % (et, e(c), et) for c in fila))
                    h.append('</tbody></table></div>')
                h.append('</li>')
            h.append('</ol></div></details>')
            h.append('</div></details>')

        vids = [v for v in (videos or {}).get('videos', []) if linea_eq in v.get('para', [])]
        pend_v = [v for v in (videos or {}).get('pendientes', [])
                  if v.get('modulo') == m['letra'] and linea_eq in v.get('para', [])]
        if rec.get('recursos') or rec.get('porGrabar') or pend_v or (vids and m['letra'] == 'A'):
            h.append('<div class="modulo-parte"><h4>%s Para repasar por fuera de la presentacion</h4>'
                     % ico('birrete', 16))
            if bloqueado:
                h.append('<div class="nota-caja ambar candado-aviso">'
                         '<span class="titulo">%s Recursos bloqueados</span>'
                         'Se abren al cumplir lo que se pidio en el modulo %s. '
                         'Faltan %d tareas.</div>'
                         % (ico('llave', 16), e(anterior_letra), faltan_antes))
                for r in rec.get('recursos', []):
                    h.append('<p class="recurso-bloqueado">%s %s</p>'
                             % (ico('llave', 14), e(r['titulo'])))
                for v in pend_v:
                    h.append('<p class="recurso-bloqueado">%s %s</p>'
                             % (ico('llave', 14), e(v['titulo'])))
            else:
                if rec.get('recursos'):
                    h.append('<ul class="recursos">%s</ul>' % ''.join(
                        '<li>%s<a href="%s">%s</a></li>'
                        % (ico('externo', 15), e(r['url']), e(r['titulo'])) for r in rec['recursos']))
                if pend_v:
                    h.append('<div class="rejilla-videos">%s</div>'
                             % ''.join(video_miniatura(v) for v in pend_v))
                if m['letra'] == 'A' and vids:
                    h.append('<p class="dato">Referentes del canal del colegio, para ver hasta '
                             'donde se puede llegar. Se ven aqui mismo, sin salir de la pagina.</p>')
                    h.append('<div class="rejilla-videos">%s</div>'
                             % ''.join(video_miniatura(v) for v in vids[:4]))
                if rec.get('porGrabar'):
                    h.append('<div class="nota-caja ambar"><span class="titulo">%s'
                             'Tutorial pendiente de grabar por el profe</span>%s</div>'
                             % (ico('video', 16), e(rec['porGrabar'])))
            h.append('</div>')
        h.append('</div></li>')
    h.append('</ol></div></section>')

    h.append(seccion_origen(meta))
    h.append('</main>')
    h.append(panel_derecho(datos, equipo, _nv_lat, nivel_actual(_nv_lat), _hh_lat, _tt_lat))
    h.append('</div>')
    h.append(pie(meta))
    return ''.join(h)


def pagina_ruta(datos, equipo):
    meta = datos['meta']
    _hh_lat, _tt_lat, _nv_lat = totales(datos, equipo)
    _mods_lat = cargar_modulos()
    hh, tt, nv = totales(datos, equipo)
    act = nivel_actual(nv)

    h = [cabeza('Ruta · %s' % equipo['nombre'],
                'Los siete niveles del semestre para el equipo %s, con las tareas de cada uno.'
                % equipo['numero'], '../', linea=equipo['linea'], datos=datos)]
    _hh, _tt, _nv = totales(datos, equipo)
    h.append(mapa_fijo(datos, equipo, _nv, nivel_actual(_nv), '-ruta'))
    h.append(portada_equipo(datos, equipo, hh, tt, compacta=True))

    h.append('<div class="con-lateral">')
    h.append(menu_izquierdo(datos, equipo, _nv_lat, nivel_actual(_nv_lat), '-ruta', _mods_lat))
    h.append('<main class="principal">')
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">%s Vista 1 de 3</span>'
             '<h2>La ruta por niveles</h2>'
             '<p>Las fases del Design Thinking anidadas con el método científico. Un nivel se supera '
             'cuando todas sus tareas tienen evidencia. Debajo de cada tarea dice de dónde salió.</p></div>'
             % ico('mapa', 15))
    h.append(progreso('Avance de toda la ruta', hh, tt, alta=True))
    h.append('<div class="tras-intro">%s</div>' % LEYENDA)
    h.append('</div></section>')

    h.append('<section class="bloque sobre-superficie"><div class="envoltura">')
    h.append('<div class="rejilla" style="gap:16px">')
    for n in nv:
        h.append('<article class="nivel-abierto %s" id="nivel-%d">' % (n['color'], n['n']))
        marca = ico('check', 22) if n['color'] == 'verde' else str(n['n'])
        h.append('<header><span class="marca">%s</span><div><h3>%s</h3>'
                 '<p class="que">%s · %s</p></div></header>'
                 % (marca, e(n['fase']['nombre']), e(n['fase']['paso']), e(n['fase']['que'])))
        h.append('<div class="contenido">')
        h.append(progreso(ESTADO_NIVEL[n['color']], n['hechas'], n['total']))
        h.append('<ul class="tareas">')
        for _id, texto, hecha, fuente, es_hito in n['tareas']:
            h.append('<li class="%s"><span class="casilla">%s</span><span class="texto">'
                     '<b>%s</b>%s<span class="fuente dato">%s</span></span></li>'
                     % ('hecha' if hecha else 'pendiente', ico('check', 13), e(texto),
                        ' <span class="pin-fase">hito técnico</span>' if es_hito else '',
                        e(fuente)))
        h.append('</ul></div></article>')
    h.append('</div></div></section>')

    h.append(seccion_origen(meta))
    h.append('</main>')
    h.append(panel_derecho(datos, equipo, _nv_lat, nivel_actual(_nv_lat), _hh_lat, _tt_lat))
    h.append('</div>')
    h.append(pie(meta))
    return ''.join(h)


def pagina_desarrollo(datos, equipo):
    meta = datos['meta']
    _hh_lat, _tt_lat, _nv_lat = totales(datos, equipo)
    _mods_lat = cargar_modulos()
    hh, tt, _ = totales(datos, equipo)
    desarrollo, dh, dt = resumen_desarrollo(datos, equipo)
    linea = datos['lineas'][equipo['linea']]

    h = [cabeza('Desarrollo · %s' % equipo['nombre'],
                'Hitos técnicos del equipo %s, con orientación y tutoriales.' % equipo['numero'],
                '../', linea=equipo['linea'], datos=datos)]
    _hh, _tt, _nv = totales(datos, equipo)
    h.append(mapa_fijo(datos, equipo, _nv, nivel_actual(_nv), '-desarrollo'))
    h.append(portada_equipo(datos, equipo, hh, tt, compacta=True))

    h.append('<div class="con-lateral">')
    h.append(menu_izquierdo(datos, equipo, _nv_lat, nivel_actual(_nv_lat), '-desarrollo', _mods_lat))
    h.append('<main class="principal">')
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">%s Vista 2 de 3</span>'
             '<h2>Desarrollo tecnológico</h2>'
             '<p>Los hitos técnicos del proyecto. Cada uno dice a qué nivel de la ruta pertenece: '
             'eso es lo que entrelaza lo que construyen con las fases del Design Thinking. '
             'Abre <em>Cómo se hace</em> para ver la orientación y los recursos.</p></div>'
             % ico('cohete', 15))
    h.append(progreso('Hitos cumplidos en la línea de %s' % linea['nombre'], dh, dt, alta=True))
    h.append('<p class="dato" style="margin-top:12px">%s</p>' % e(linea['nota']))
    h.append('</div></section>')

    if equipo.get('dinamica'):
        h.append('<section class="bloque"><div class="envoltura"><div class="destacado">')
        h.append('<h3>%s La dinámica que hay que resolver</h3><p>%s</p>'
                 % (ico('diana', 21), e(equipo['dinamica'])))
        h.append('</div></div></section>')

    h.append('<section class="bloque sobre-superficie"><div class="envoltura">')
    h.append('<div class="rejilla" style="gap:14px">')
    for fila in desarrollo:
        hito = fila['hito']
        h.append('<article class="hito %s">' % ('hecho' if fila['hecha'] else ''))
        h.append('<header><span class="casilla %s">%s</span><h3>%s</h3>'
                 '<span class="pin-fase">nivel %s</span></header>'
                 % ('' if fila['hecha'] else 'pendiente', ico('check', 13), e(hito['nombre']),
                    e(hito['fase'])))
        h.append('<div class="cuerpo">')
        h.append('<p class="dato">%s</p>' % e(fila['fuente']))
        h.append('<details class="mas"><summary>%s Cómo se hace y con qué apoyarse</summary><div>'
                 % ico('chevron', 14, 'chevron'))
        h.append('<p>%s</p>' % e(hito['orientacion']))
        if hito.get('yaEntregado'):
            h.append('<div class="nota-caja verde"><span class="titulo">%s<b>Ya entregado</b></span>%s</div>'
                     % (ico('check', 16), e(hito['yaEntregado'])))
        if hito.get('recursos'):
            h.append('<ul class="recursos">%s</ul>' % ''.join(
                '<li>%s<a href="%s">%s</a></li>' % (ico('externo', 15), e(r['url']), e(r['titulo']))
                for r in hito['recursos']))
        if hito.get('porGrabar'):
            h.append('<div class="nota-caja ambar"><span class="titulo">%s'
                     '<b>Tutorial pendiente de grabar por el profe</b></span>%s</div>'
                     % (ico('llave', 16), e(hito['porGrabar'])))
        if not (hito.get('recursos') or hito.get('porGrabar') or hito.get('yaEntregado')):
            h.append('<p class="dato">Sin recurso externo: este hito se resuelve con lo visto en '
                     'sesión. Si necesitan un tutorial, pídanlo en la hoja de barreras.</p>')
        h.append('</div></details></div></article>')
    h.append('</div></div></section>')

    h.append(seccion_origen(meta))
    h.append('</main>')
    h.append(panel_derecho(datos, equipo, _nv_lat, nivel_actual(_nv_lat), _hh_lat, _tt_lat))
    h.append('</div>')
    h.append(pie(meta))
    return ''.join(h)


def pagina_articulo(datos, equipo):
    meta = datos['meta']
    _hh_lat, _tt_lat, _nv_lat = totales(datos, equipo)
    _mods_lat = cargar_modulos()
    hh, tt, _ = totales(datos, equipo)
    arts, ah, at = resumen_articulo(datos, equipo)

    h = [cabeza('Artículo · %s' % equipo['nombre'],
                'Estado del artículo de desarrollo tecnológico del equipo %s, sección por sección.'
                % equipo['numero'], '../', linea=equipo['linea'], datos=datos)]
    _hh, _tt, _nv = totales(datos, equipo)
    h.append(mapa_fijo(datos, equipo, _nv, nivel_actual(_nv), '-articulo'))
    h.append(portada_equipo(datos, equipo, hh, tt, compacta=True))

    h.append('<div class="con-lateral">')
    h.append(menu_izquierdo(datos, equipo, _nv_lat, nivel_actual(_nv_lat), '-articulo', _mods_lat))
    h.append('<main class="principal">')
    h.append('<section class="bloque"><div class="envoltura">')
    h.append('<div class="cab-seccion"><span class="rotulo">%s Vista 3 de 3</span>'
             '<h2>Documentación del artículo</h2>'
             '<p>El artículo de desarrollo tecnológico, sección por sección. No basta saber qué '
             'falta: la última columna dice <strong>qué dato concreto hay que conseguir</strong> '
             'para poder escribirla.</p></div>' % ico('documento', 15))
    h.append(progreso('Secciones diligenciadas del formato Articulo_base.docx', ah, at, alta=True))
    h.append('</div></section>')

    h.append('<section class="bloque sobre-superficie"><div class="envoltura">')
    h.append('<div class="tabla-env"><table class="articulo">')
    h.append('<thead><tr><th>Sección</th><th>¿Ya está?</th><th>¿Cuándo se llena?</th>'
             '<th>Qué datos hacen falta</th></tr></thead><tbody>')
    for sec, ok in arts:
        h.append('<tr%s>' % (' class="ok"' if ok else ''))
        h.append('<td class="sec">%s<div class="de-donde">De dónde sale: %s</div></td>'
                 % (e(sec['titulo']), e(sec['deDonde'])))
        h.append('<td>%s</td>' % chip('verde' if ok else 'gris', 'sí' if ok else 'no',
                                      'check' if ok else None))
        h.append('<td class="cuando"><span class="dato">%s<br>%s</span></td>'
                 % (e(sec['cuando']), e(sec['palabras'])))
        if ok:
            h.append('<td><span class="dato">Ya está escrita. Revísala al cerrar el artículo.</span></td>')
        else:
            h.append('<td><ul class="faltan">%s</ul></td>'
                     % ''.join('<li>%s</li>' % e(x) for x in sec['faltan']))
        h.append('</tr>')
    h.append('</tbody></table></div>')
    h.append('<div class="nota-caja cian" style="margin-top:16px">'
             '<span class="titulo">%s<b>Las versiones también se evalúan</b></span>'
             'Cada vez que agreguen algo importante, guarden una versión nueva: '
             'Articulo_base_v2.docx, v3 y así. Esa serie muestra cómo creció el proyecto.</div>'
             % ico('capas', 17))
    h.append('</div></section>')

    h.append(seccion_origen(meta))
    h.append('</main>')
    h.append(panel_derecho(datos, equipo, _nv_lat, nivel_actual(_nv_lat), _hh_lat, _tt_lat))
    h.append('</div>')
    h.append(pie(meta))
    return ''.join(h)


# ====================================================================

def main():
    global VERSION_ASSETS
    VERSION_ASSETS = huella('assets/css/marca.css', 'assets/css/sitio.css',
                            'assets/js/sitio.js')
    with open(DATOS, encoding='utf-8') as f:
        datos = json.load(f)

    modulos = cargar_modulos()
    videos = cargar_videos()
    os.makedirs(os.path.join(SALIDA, 'equipos'), exist_ok=True)
    escritas = []

    def escribir(ruta, contenido):
        destino = os.path.join(SALIDA, ruta)
        with open(destino, 'w', encoding='utf-8') as fh:
            fh.write(contenido)
        escritas.append(ruta)

    escribir('index.html', pagina_portal(datos))
    for eq in datos['equipos']:
        s = eq['slug']
        escribir('equipos/%s.html' % s, pagina_equipo(datos, eq))
        escribir('equipos/%s-modulos.html' % s, pagina_modulos(datos, eq, modulos, videos))
        escribir('equipos/%s-ruta.html' % s, pagina_ruta(datos, eq))
        escribir('equipos/%s-desarrollo.html' % s, pagina_desarrollo(datos, eq))
        escribir('equipos/%s-articulo.html' % s, pagina_articulo(datos, eq))

    with open(os.path.join(SALIDA, '.nojekyll'), 'w', encoding='utf-8') as fh:
        fh.write('')

    print('%d paginas escritas' % len(escritas))
    for r in escritas[:3]:
        print('  ', r)
    print('   ... y %d mas' % (len(escritas) - 3))


if __name__ == '__main__':
    main()
