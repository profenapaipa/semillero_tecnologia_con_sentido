# -*- coding: utf-8 -*-
"""
generar.py — construye el sitio del Semillero Maker de Tecnología con Sentido.

Qué hace
--------
Lee  datos/semillero.json  y escribe en  docs/ :

    docs/index.html              el portal, con el estado agregado y los 14 equipos
    docs/equipos/<slug>.html     una página por subequipo, con las TRES vistas
    docs/hermanos.html           Filosofartec y Un Café con la Iguana

Cómo se usa
-----------
    python herramientas/generar.py

No pide argumentos. Se puede correr tantas veces como se quiera: siempre
reescribe las páginas desde el archivo de datos.

Para actualizar el estado de un equipo NO se toca este archivo ni el HTML:
se edita  datos/semillero.json  y se vuelve a correr esto.

Cómo se calcula el semáforo (regla del cliente, BRIEF.md 4.2)
-------------------------------------------------------------
Cada tarea es binaria: hecha o no hecha. El color de una fase sale de contar
las tareas de esa fase:

    gris     = 0 tareas hechas
    amarillo = algunas hechas
    verde    = todas hechas

Las tareas de una fase son dos cosas sumadas:
  1. las tareas documentales comunes a todos los equipos  (tareasComunes)
  2. los hitos técnicos de su línea que pertenecen a esa fase  (lineas[*].hitos)

Eso es lo que "entrelaza" el desarrollo tecnológico con las fases del Design
Thinking: cada hito técnico declara a qué fase pertenece, y la fase lo cuenta.
"""

import json
import html
import os
import datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATOS = os.path.join(RAIZ, 'datos', 'semillero.json')
SALIDA = os.path.join(RAIZ, 'docs')

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
         'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def e(texto):
    """Escapa texto para meterlo en HTML sin romper nada."""
    return html.escape(str(texto), quote=True)


def fecha_larga(iso):
    a, m, d = (int(x) for x in iso.split('-'))
    return '%d de %s de %d' % (d, MESES[m - 1], a)


# ---------------------------------------------------------------- cálculo

def color_de(hechas, total):
    """La regla de los tres colores. Sin total no hay color: gris."""
    if total == 0:
        return 'gris'
    if hechas == 0:
        return 'gris'
    if hechas == total:
        return 'verde'
    return 'ambar'


# Las cuatro tareas de la fase Comunicar no se declaran equipo por equipo:
# se deducen del estado del artículo, para que las dos vistas no se puedan
# contradecir. Cada tarea agrupa las secciones del formato Articulo_base.docx.
GRUPOS_ARTICULO = {
    'a2': ['2', '2.1'],
    'a3': ['3.1', '3.2', '3.3', '3.4', '3.5'],
    'a4': ['4'],
    'a5': ['5.1', '5.2'],
}


def tarea_articulo(datos, equipo, tarea_id):
    """Resuelve una tarea de Comunicar leyendo el estado del artículo."""
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
    """
    Devuelve la lista de tareas de una fase para un equipo:
    las documentales comunes más los hitos técnicos de su línea.
    Cada tarea sale como (id, texto, hecha, evidencia, es_hito).
    """
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


def resumen_fases(datos, equipo):
    """Para cada fase: sus tareas, cuántas van y de qué color queda."""
    filas = []
    for fase in datos['fases']:
        tareas = tareas_de_fase(datos, equipo, fase['id'])
        hechas = sum(1 for t in tareas if t[2])
        filas.append({
            'fase': fase,
            'tareas': tareas,
            'hechas': hechas,
            'total': len(tareas),
            'color': color_de(hechas, len(tareas)),
        })
    return filas


def resumen_articulo(datos, equipo):
    """Estado de cada sección del artículo. Lo que no está declarado, falta."""
    est = equipo.get('articuloEstado', {})
    filas = [(s, bool(est.get(s['id'], False))) for s in datos['articulo']]
    hechas = sum(1 for _, ok in filas if ok)
    return filas, hechas, len(filas)


def resumen_desarrollo(datos, equipo):
    """Los hitos técnicos de la línea del equipo, en orden."""
    hitos = datos['lineas'][equipo['linea']]['hitos']
    filas = []
    for h in hitos:
        hecha, fuente = equipo['estado'].get(h['id'], [False, 'Sin revisar'])
        filas.append({'hito': h, 'hecha': hecha, 'fuente': fuente})
    hechas = sum(1 for f in filas if f['hecha'])
    return filas, hechas, len(filas)


# ---------------------------------------------------------------- piezas HTML

def chip(color, texto):
    return '<span class="chip %s"><span class="pt"></span>%s</span>' % (color, e(texto))


def mini(color, texto):
    return '<span class="mini %s"><span class="pt"></span>%s</span>' % (color, e(texto))


# Cómo se presenta el estado de publicación de cada proyecto. El objetivo es
# que el estudiante tenga acceso directo a su versión publicada cuando exista,
# y que cuando no exista quede dicho exactamente qué falta para publicarla.
PUBLICACION = {
    'en linea':           ('verde', 'Versión publicada, en línea'),
    'sin publicar':       ('ambar', 'Tiene repositorio, falta publicarlo'),
    'sin repositorio':    ('ambar', 'Todavía sin repositorio en GitHub'),
    'pendiente de build': ('gris',  'Se podrá publicar cuando haya build'),
    'no aplica':          ('gris',  'No se publica como sitio web'),
}


def vista_previa(url, nombre):
    """
    Vista previa en vivo del proyecto publicado, dentro de un iframe.

    Se puede hacer porque GitHub Pages no manda la cabecera X-Frame-Options
    (verificado el 13 de octubre de 2026). El sandbox deja correr el
    JavaScript del sitio, que varios de estos proyectos necesitan para
    armarse, pero le quita la navegación de la ventana y los formularios.
    """
    return ('<div class="vistaprevia">'
            '<iframe src="%s" title="Vista previa de %s" loading="lazy" tabindex="-1" '
            'sandbox="allow-scripts allow-same-origin"></iframe>'
            '<div class="pie-previa"><span>vista previa en vivo</span>'
            '<span>%s</span></div></div>'
            % (e(url), e(nombre), e(url.replace('https://', ''))))


def bloque_publicacion(equipo):
    """La tarjeta de 'tu versión publicada', arriba del todo en cada página."""
    pub = equipo.get('publicacion') or {}
    estado = pub.get('estado', 'no aplica')
    color, rotulo = PUBLICACION.get(estado, PUBLICACION['no aplica'])

    partes = ['<div class="publicacion %s">' % color]
    partes.append('<div class="pub-cab">%s<span class="pub-rotulo">%s</span></div>'
                  % (chip(color, 'publicación'), e(rotulo)))
    if pub.get('url'):
        partes.append(vista_previa(pub['url'], equipo['nombre']))

    botones = []
    if pub.get('url'):
        botones.append('<a class="boton principal" href="%s">Abrir el proyecto publicado ↗</a>' % e(pub['url']))
    if pub.get('repo'):
        botones.append('<a class="boton" href="%s">Ver el código en GitHub ↗</a>' % e(pub['repo']))
    for en in equipo.get('enlaces', []):
        if en['url'] not in (pub.get('url'), pub.get('repo')):
            botones.append('<a class="boton" href="%s">%s ↗</a>' % (e(en['url']), e(en['titulo'])))
    if botones:
        partes.append('<div class="enlaces-proyecto">%s</div>' % ''.join(botones))

    if pub.get('url'):
        partes.append('<p class="pub-url dato">%s</p>' % e(pub['url']))
    if pub.get('nota'):
        partes.append('<p class="pub-nota">%s</p>' % e(pub['nota']))
    partes.append('</div>')
    return ''.join(partes)


def cabeza(titulo, descripcion, prefijo=''):
    """El <head> y la cinta superior. prefijo ajusta las rutas relativas."""
    return """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(titulo)s</title>
<meta name="description" content="%(desc)s">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<link rel="stylesheet" href="%(p)sassets/css/marca.css">
<link rel="stylesheet" href="%(p)sassets/css/sitio.css">
</head>
<body>
""" % {'titulo': e(titulo), 'desc': e(descripcion), 'p': prefijo}


def cinta(meta, prefijo=''):
    return """<div class="cinta"><div class="envoltura">
<span>Semillero Maker de Tecnología con Sentido · %(sem)s</span>
<span>Revisión del %(rev)s</span>
</div></div>
""" % {'sem': e(meta['semestre']), 'rev': e(fecha_larga(meta['revisado']))}


def pie(meta):
    return """<footer class="pie"><div class="envoltura">
<span class="nombre">Semillero Maker de Tecnología con Sentido</span>
<p>%(doc)s · %(col)s · Semestre %(sem)s.</p>
<p>Espacios hermanos, cada uno con nombre propio: Semillero Maker de Tecnología con Sentido, Filosofartec y Un Café con la Iguana.</p>
</div></footer>
</body>
</html>
""" % {'doc': e(meta['docente']), 'col': e(meta['colegio']), 'sem': e(meta['semestre'])}


# ---------------------------------------------------------------- la ruta en SVG

def svg_ruta(filas, equipo):
    """
    Dibuja la ruta de las siete fases como una línea de estaciones.

    Dos niveles en un solo dibujo (BRIEF.md 4.2):
      - el círculo grande de la estación lleva el semáforo de la fase,
        con un glifo además del color: check, media luna o anillo vacío
      - los cuadritos de abajo son las tareas, una por una, binarias
    """
    n = len(filas)
    x0, paso = 92, 168
    ancho = x0 * 2 + paso * (n - 1)
    partes = []

    # La línea: continua hasta la última fase con algún avance, punteada después.
    ultima_con_avance = -1
    for i, f in enumerate(filas):
        if f['hechas'] > 0:
            ultima_con_avance = i
    corte = x0 + paso * max(ultima_con_avance, 0)

    partes.append(
        '<line x1="%d" y1="100" x2="%d" y2="100" stroke="var(--filete)" '
        'stroke-width="5" stroke-linecap="round"/>' % (x0, corte))
    if corte < x0 + paso * (n - 1):
        partes.append(
            '<line x1="%d" y1="100" x2="%d" y2="100" stroke="var(--gris-fill)" '
            'stroke-width="3" stroke-linecap="round" stroke-dasharray="7 8"/>'
            % (corte, x0 + paso * (n - 1)))
        medio = (corte + x0 + paso * (n - 1)) / 2
        partes.append(
            '<text x="%.0f" y="82" text-anchor="middle" font-family="IBM Plex Mono, monospace" '
            'font-size="10.5" fill="var(--tinta-suave)">sin evidencia aún</text>' % medio)

    for i, f in enumerate(filas):
        x = x0 + paso * i
        col = f['color']
        relleno = {'verde': 'var(--verde-fill)', 'ambar': 'var(--ambar-fill)',
                   'gris': 'var(--gris-fill)'}[col]
        texto_col = {'verde': 'var(--verde-texto)', 'ambar': 'var(--ambar-texto)',
                     'gris': 'var(--tinta-suave)'}[col]

        partes.append(
            '<text x="%d" y="30" text-anchor="middle" font-family="IBM Plex Mono, monospace" '
            'font-size="10.5" letter-spacing=".12em" fill="var(--tinta-suave)">%02d</text>'
            % (x, i + 1))
        partes.append(
            '<text x="%d" y="54" text-anchor="middle" font-family="Archivo, sans-serif" '
            'font-size="15.5" font-weight="700" fill="%s">%s</text>'
            % (x, 'var(--tinta)' if col != 'gris' else 'var(--tinta-suave)',
               e(f['fase']['nombre'])))

        # El punto de la estación, con glifo propio por estado.
        if col == 'verde':
            partes.append('<circle cx="%d" cy="100" r="16" fill="%s" stroke="var(--superficie)" stroke-width="3"/>' % (x, relleno))
            partes.append('<polyline points="%d,100 %d,105 %d,95" fill="none" stroke="var(--superficie)" '
                          'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
                          % (x - 6, x - 2, x + 6))
        elif col == 'ambar':
            partes.append('<circle cx="%d" cy="100" r="16" fill="var(--superficie)" stroke="var(--superficie)" stroke-width="3"/>' % x)
            partes.append('<path d="M %d 89 A 11 11 0 0 0 %d 111 Z" fill="%s"/>' % (x, x, relleno))
            partes.append('<circle cx="%d" cy="100" r="14.5" fill="none" stroke="%s" stroke-width="3"/>' % (x, relleno))
        else:
            partes.append('<circle cx="%d" cy="100" r="16" fill="var(--superficie)" stroke="var(--superficie)" stroke-width="3"/>' % x)
            partes.append('<circle cx="%d" cy="100" r="14.5" fill="none" stroke="%s" stroke-width="3"/>' % (x, relleno))

        partes.append(
            '<text x="%d" y="139" text-anchor="middle" font-family="IBM Plex Mono, monospace" '
            'font-size="10" letter-spacing=".05em" fill="var(--tinta-suave)">%s</text>'
            % (x, e(f['fase']['paso'].upper())))
        partes.append(
            '<text x="%d" y="159" text-anchor="middle" font-family="IBM Plex Mono, monospace" '
            'font-size="12" font-weight="600" fill="%s">%d / %d</text>'
            % (x, texto_col, f['hechas'], f['total']))

        # Los cuadritos: una tarea cada uno, centrados bajo la estación.
        total = f['total']
        if total:
            ancho_fila = total * 9 + (total - 1) * 4
            inicio = x - ancho_fila / 2.0
            for j, t in enumerate(f['tareas']):
                cx = inicio + j * 13
                if t[2]:
                    partes.append('<rect x="%.1f" y="170" width="9" height="9" rx="1.5" fill="var(--teal)"/>' % cx)
                else:
                    partes.append('<rect x="%.1f" y="170" width="9" height="9" rx="1.5" fill="none" '
                                  'stroke="var(--gris-fill)" stroke-width="1.5"/>' % cx)

    etiqueta = 'Ruta de siete fases de %s. ' % equipo['nombre']
    etiqueta += ' '.join('%s, %d de %d tareas, %s.'
                         % (f['fase']['nombre'], f['hechas'], f['total'], f['color'])
                         for f in filas)

    return ('<div class="lienzo"><svg viewBox="0 0 %d 212" role="img" aria-label="%s">%s</svg></div>'
            % (ancho, e(etiqueta), ''.join(partes)))


# ---------------------------------------------------------------- checklist

def checklist(filas, equipo):
    """
    Arma el checklist de la semana a partir del estado, sin que nadie lo
    escriba a mano: lo hecho, lo que falta, y lo que sigue (lo pendiente
    más temprano en la ruta, que es por donde conviene empezar).
    """
    ya, falta, sigue = [], [], []
    for f in filas:
        for _id, texto, hecha, fuente, es_hito in f['tareas']:
            if hecha:
                ya.append((texto, fuente))
            else:
                falta.append((texto, fuente, f['fase']['nombre']))
    for texto, fuente, fase in falta[:4]:
        sigue.append((texto, fase))
    return ya[-5:], falta[:5], sigue


# ---------------------------------------------------------------- página de equipo

def pagina_equipo(datos, equipo):
    meta = datos['meta']
    filas = resumen_fases(datos, equipo)
    desarrollo, des_hechas, des_total = resumen_desarrollo(datos, equipo)
    arts, art_hechas, art_total = resumen_articulo(datos, equipo)
    linea = datos['lineas'][equipo['linea']]

    total_tareas = sum(f['total'] for f in filas)
    total_hechas = sum(f['hechas'] for f in filas)

    h = [cabeza('%s · Semillero Maker' % equipo['nombre'],
                'Ruta de aprendizaje, desarrollo tecnológico y estado del artículo del equipo %s.' % equipo['numero'],
                prefijo='../')]
    h.append(cinta(meta, '../'))

    # --- encabezado ---
    h.append('<header class="cabecera"><div class="envoltura">')
    h.append('<a class="volver" href="../index.html">← Todos los equipos</a>')
    h.append('<p class="etiqueta">Equipo %s · %s</p>' % (e(equipo['numero']), e(linea['nombre'])))
    h.append('<h1>%s</h1>' % e(equipo['nombre']))
    if equipo.get('nota'):
        h.append('<p class="resumen">%s</p>' % e(equipo['nota']))
    h.append('<ul class="ficha">')
    h.append('<li><span class="clave">Integrantes</span><div class="valor">%s</div></li>' % e(equipo['integrantes']))
    h.append('<li><span class="clave">Con qué se construye</span><div class="valor">%s</div></li>' % e(equipo['stack']))
    h.append('<li><span class="clave">Tareas completas</span><div class="valor">%d de %d</div></li>' % (total_hechas, total_tareas))
    h.append('<li><span class="clave">Carpeta en Drive</span><div class="valor dato">%s</div></li>' % e(equipo['carpeta']))
    h.append('</ul>')
    h.append(bloque_publicacion(equipo))
    h.append('</div></header>')

    # --- navegación de las tres vistas ---
    h.append("""<nav class="vistas" aria-label="Las tres vistas del proyecto"><div class="envoltura"><ol>
<li><a href="#ruta"><span class="num">1</span>Ruta del Design Thinking</a></li>
<li><a href="#desarrollo"><span class="num">2</span>Desarrollo tecnológico</a></li>
<li><a href="#articulo"><span class="num">3</span>Documentación del artículo</a></li>
<li><a href="#semana"><span class="num">4</span>Esta semana</a></li>
</ol></div></nav>""")

    h.append('<main class="envoltura">')

    # ===== VISTA 1: ruta del Design Thinking =====
    h.append('<section id="ruta">')
    h.append('<h2>1 · Ruta del Design Thinking</h2>')
    h.append('<p class="entradilla">Las siete fases del semestre, con su paso del método científico. '
             'Cada estación resume su grupo de tareas; los cuadritos son las tareas una por una.</p>')
    h.append('<figure class="ruta">')
    h.append(svg_ruta(filas, equipo))
    h.append('<figcaption>La ruta avanza de izquierda a derecha. El color de cada estación se calcula '
             'contando las tareas de esa fase, no lo aprueba nadie a mano.</figcaption>')
    h.append('</figure>')
    h.append("""<div class="convenciones">
<div><span class="muestra verde"></span><b>Verde:</b><small>todas las tareas de la fase</small></div>
<div><span class="muestra ambar"></span><b>Amarillo:</b><small>algunas, no todas</small></div>
<div><span class="muestra gris"></span><b>Gris:</b><small>ninguna todavía</small></div>
<div><span class="muestra-cuadro si"></span><span class="muestra-cuadro no"></span><b>Cuadritos:</b><small>una tarea, hecha o no</small></div>
</div>""")

    h.append('<div class="rejilla-fases">')
    for i, f in enumerate(filas):
        h.append('<article class="tarjeta %s">' % f['color'])
        h.append('<div class="tarjeta-cab"><span class="ord">%02d</span><hgroup><h3>%s</h3>'
                 '<p class="paso">%s</p></hgroup>%s</div>'
                 % (i + 1, e(f['fase']['nombre']), e(f['fase']['paso']),
                    chip(f['color'], '%d de %d' % (f['hechas'], f['total']))))
        h.append('<p class="que">%s</p>' % e(f['fase']['que']))
        h.append('<ul class="lista-tareas">')
        for _id, texto, hecha, fuente, es_hito in f['tareas']:
            h.append('<li class="%s"><span class="tarea-casilla"></span><span class="texto">'
                     '<b>%s</b><span class="fuente">%s</span></span></li>'
                     % ('hecha' if hecha else 'pendiente', e(texto), e(fuente)))
        h.append('</ul></article>')
    h.append('</div></section>')

    # ===== VISTA 2: desarrollo tecnológico =====
    h.append('<section id="desarrollo">')
    h.append('<h2>2 · Desarrollo tecnológico</h2>')
    h.append('<p class="entradilla">Los hitos técnicos del proyecto, cada uno con la fase del Design '
             'Thinking a la que pertenece. Son distintos por línea técnica: un hito de Unity no se '
             'parece a uno de electrónica. Abre <em>Cómo se hace</em> para ver la orientación y los recursos.</p>')
    h.append('<p class="dato" style="margin-bottom:18px">%s · %d de %d hitos cumplidos</p>'
             % (e(linea['nota']), des_hechas, des_total))

    if equipo.get('dinamica'):
        h.append('<div class="destacado-dinamica"><h3>La dinámica que hay que resolver</h3>'
                 '<p>%s</p></div>' % e(equipo['dinamica']))

    h.append('<div class="hitos">')
    for fila in desarrollo:
        hito = fila['hito']
        clase = 'hecho' if fila['hecha'] else ('bloqueo' if hito.get('porGrabar') else 'falta')
        h.append('<article class="hito %s">' % clase)
        h.append('<div class="hito-cab"><span class="marca %s"><span class="tarea-casilla"></span></span>'
                 '<h3>%s</h3><span class="fase-pin">%s</span></div>'
                 % ('hecha' if fila['hecha'] else 'pendiente', e(hito['nombre']),
                    e(hito['fase'])))
        h.append('<div class="hito-cuerpo">')
        h.append('<p class="fuente">%s</p>' % e(fila['fuente']))
        h.append('<details class="mas"><summary>Cómo se hace y con qué apoyarse</summary><div>')
        h.append('<p class="orientacion">%s</p>' % e(hito['orientacion']))
        if hito.get('yaEntregado'):
            h.append('<div class="aviso-entregado"><span class="titulo">Ya entregado</span>%s</div>'
                     % e(hito['yaEntregado']))
        if hito.get('recursos'):
            h.append('<ul class="recursos">')
            for r in hito['recursos']:
                h.append('<li><a href="%s">%s</a></li>' % (e(r['url']), e(r['titulo'])))
            h.append('</ul>')
        if hito.get('porGrabar'):
            h.append('<div class="aviso-tutorial"><span class="titulo">Tutorial pendiente de grabar '
                     'por el profe</span>%s</div>' % e(hito['porGrabar']))
        if not hito.get('recursos') and not hito.get('porGrabar') and not hito.get('yaEntregado'):
            h.append('<p class="dato">Sin recurso externo: este hito se resuelve con lo visto en sesión. '
                     'Si se necesita un tutorial, pídelo en la hoja de barreras.</p>')
        h.append('</div></details>')
        h.append('</div></article>')
    h.append('</div></section>')

    # ===== VISTA 3: documentación del artículo =====
    color_art = color_de(art_hechas, art_total)
    h.append('<section id="articulo">')
    h.append('<h2>3 · Documentación del artículo</h2>')
    h.append('<p class="entradilla">El artículo de desarrollo tecnológico, sección por sección. '
             'No basta saber qué falta: la última columna dice <strong>qué dato concreto hay que '
             'conseguir</strong> para poder escribirla.</p>')
    h.append('<p style="margin-bottom:18px">%s &nbsp; <span class="dato">de %d secciones del formato '
             '<code>Articulo_base.docx</code></span></p>'
             % (chip(color_art, '%d de %d diligenciadas' % (art_hechas, art_total)), art_total))
    h.append('<div class="tabla-envoltura"><table class="articulo">')
    h.append('<thead><tr><th>Sección</th><th>¿Ya está?</th><th>¿Cuándo se puede llenar?</th>'
             '<th>Qué datos hacen falta</th></tr></thead><tbody>')
    for sec, ok in arts:
        h.append('<tr%s>' % (' class="lista-ok"' if ok else ''))
        h.append('<td class="sec">%s<div class="de-donde">De dónde sale: %s</div></td>'
                 % (e(sec['titulo']), e(sec['deDonde'])))
        h.append('<td>%s</td>' % chip('verde' if ok else 'gris', 'sí' if ok else 'no'))
        h.append('<td class="cuando">%s<br>%s</td>' % (e(sec['cuando']), e(sec['palabras'])))
        if ok:
            h.append('<td><span class="dato">Ya está escrita. Revísala al cerrar el artículo.</span></td>')
        else:
            h.append('<td><ul class="faltan">%s</ul></td>'
                     % ''.join('<li>%s</li>' % e(x) for x in sec['faltan']))
        h.append('</tr>')
    h.append('</tbody></table></div>')
    h.append('<p class="dato" style="margin-top:14px">Cada vez que agreguen algo importante, guarden '
             'una versión nueva: Articulo_base_v2.docx, v3 y así. Esa serie de versiones también se evalúa.</p>')
    h.append('</section>')

    # ===== Checklist de la semana =====
    ya, falta, sigue = checklist(filas, equipo)
    h.append('<section id="semana" class="semana">')
    h.append('<div class="semana-cab"><h2>Esta semana: %s</h2>'
             '<p class="dato">Revisado el %s · quedan %d sesiones</p></div>'
             % (e(meta['sesionesRestantes'][0].replace('miércoles ', '').replace('jueves ', '')),
                e(fecha_larga(meta['revisado'])), len(meta['sesionesRestantes'])))
    h.append('<div class="columnas">')
    h.append('<div><h3 class="ya">Lo que ya tienes</h3><ul>')
    if ya:
        for texto, fuente in reversed(ya):
            h.append('<li><span><strong>%s.</strong> <span class="dato">%s</span></span></li>' % (e(texto), e(fuente)))
    else:
        h.append('<li><span>Todavía no hay ninguna tarea cumplida con evidencia en la carpeta. '
                 'Empieza por la propuesta: es la que abre todo lo demás.</span></li>')
    h.append('</ul></div>')
    h.append('<div><h3 class="falta">Lo que te falta</h3><ul>')
    for texto, fuente, fase in falta:
        h.append('<li><span><strong>%s.</strong> <span class="dato">%s</span></span></li>' % (e(texto), e(fuente)))
    if not falta:
        h.append('<li><span>Nada pendiente. Revisa el artículo y guarda la versión final.</span></li>')
    h.append('</ul></div>')
    h.append('<div><h3 class="sigue">Lo que sigue</h3><ul>')
    for texto, fase in sigue:
        h.append('<li><span>%s <span class="dato">· fase %s</span></span></li>' % (e(texto), e(fase)))
    if not sigue:
        h.append('<li><span>Cierra el artículo y guarda la versión final.</span></li>')
    h.append('</ul></div>')
    h.append('</div></section>')

    # ===== De dónde sale el estado =====
    h.append('<section class="origen"><h2>De dónde sale este estado</h2>')
    h.append('<p>Ninguna casilla se marca a mano. Cada revisión recorre estas fuentes y vuelve a contar.</p><ol>')
    for f in meta['fuentes']:
        h.append('<li>%s</li>' % e(f))
    h.append('</ol>')
    h.append('<p class="limite">Lo que esta revisión no alcanza a ver: el trabajo que quedó en los '
             'computadores de la sala y no se subió a la carpeta. Si construyeron algo y aquí sale en '
             'gris, súbanlo a su carpeta de Drive o a GitHub y en la próxima revisión aparece.</p>')
    h.append('</section>')

    h.append('</main>')
    h.append(pie(meta))
    return ''.join(h)


# ---------------------------------------------------------------- portal

def pagina_portal(datos):
    meta = datos['meta']
    h = [cabeza('Semillero Maker de Tecnología con Sentido',
                'Estado de los catorce subequipos del Semillero Maker de Tecnología con Sentido, semestre 2026-II.')]
    h.append(cinta(meta))

    # Agregados honestos del semillero
    agregados = {'prop': 0, 'fich': 0, 'casi': 0, 'artv': 0}
    art_total_hechas = 0
    for eq in datos['equipos']:
        for k in agregados:
            if eq['estado'].get(k, [False])[0]:
                agregados[k] += 1
        _, ah, _ = resumen_articulo(datos, eq)
        if ah:
            art_total_hechas += 1
    n = len(datos['equipos'])

    h.append('<header class="cabecera"><div class="envoltura">')
    h.append('<p class="etiqueta">Semestre %s · Grados 9°, 10° y 11°</p>' % e(meta['semestre']))
    h.append('<h1>Semillero Maker de Tecnología con Sentido</h1>')
    h.append('<p class="resumen">Catorce subequipos recorren las fases del Design Thinking anidadas con '
             'el método científico, hasta llegar a un artículo de desarrollo tecnológico. '
             'Aquí cada equipo ve el estado real de su proceso: lo que ya construyó, lo que le falta '
             'documentar y qué sigue.</p>')
    h.append('<ul class="ficha">')
    h.append('<li><span class="clave">Subequipos</span><div class="valor">%d</div></li>' % n)
    h.append('<li><span class="clave">Líneas técnicas</span><div class="valor">%d</div></li>' % len(datos['lineas']))
    h.append('<li><span class="clave">Última revisión</span><div class="valor">%s</div></li>' % e(fecha_larga(meta['revisado'])))
    h.append('<li><span class="clave">Sesiones restantes</span><div class="valor">%d</div></li>' % len(meta['sesionesRestantes']))
    h.append('</ul></div></header>')

    h.append('<main class="envoltura">')

    # Tablero agregado
    h.append('<section><h2>El semillero, de un vistazo</h2>')
    h.append('<p class="entradilla">Estos números salen de medir los documentos por dentro, no de '
             'contar si el archivo existe. Dicen lo que hay, no lo que debería haber.</p>')
    h.append('<div class="tablero">')
    h.append('<div class="celda"><span class="cifra %s">%d de %d</span><p class="leyenda">propuestas escritas de verdad</p></div>'
             % ('bien' if agregados['prop'] > n / 2 else 'alerta', agregados['prop'], n))
    h.append('<div class="celda"><span class="cifra %s">%d de %d</span><p class="leyenda">fichas técnicas diligenciadas</p></div>'
             % ('bien' if agregados['fich'] > n / 2 else 'alerta', agregados['fich'], n))
    h.append('<div class="celda"><span class="cifra %s">%d de %d</span><p class="leyenda">artículos con alguna sección escrita</p></div>'
             % ('bien' if art_total_hechas > n / 2 else 'alerta', art_total_hechas, n))
    h.append('<div class="celda"><span class="cifra alerta">%d de %d</span><p class="leyenda">hojas de barreras con casillas marcadas</p></div>'
             % (agregados['casi'], n))
    h.append('</div>')
    h.append('<p class="dato" style="margin-top:14px">Hay equipos con software funcionando y publicado '
             'cuyo artículo sigue en blanco. El desfase no es de avance, es de registro.</p>')
    h.append('</section>')

    # Equipos por línea
    h.append('<section><h2>Los catorce subequipos</h2>')
    h.append('<p class="entradilla">Cada tarjeta muestra tres semáforos: la ruta completa, el desarrollo '
             'tecnológico y el artículo. Entra a la página del equipo para ver el detalle.</p>')
    for clave, linea in datos['lineas'].items():
        equipos = [x for x in datos['equipos'] if x['linea'] == clave]
        if not equipos:
            continue
        h.append('<div class="grupo-linea"><div class="cab"><h3>%s</h3>'
                 '<p class="nota">%s</p></div><div class="rejilla-equipos">'
                 % (e(linea['nombre']), e(linea['nota'])))
        for eq in equipos:
            filas = resumen_fases(datos, eq)
            tot = sum(f['total'] for f in filas)
            hec = sum(f['hechas'] for f in filas)
            _, dh, dt = resumen_desarrollo(datos, eq)
            _, ah, at = resumen_articulo(datos, eq)
            c_ruta = color_de(hec, tot)
            h.append('<a class="equipo %s" href="equipos/%s.html">' % (c_ruta, e(eq['slug'])))
            h.append('<span class="num">EQUIPO %s</span>' % e(eq['numero']))
            h.append('<h4>%s</h4>' % e(eq['nombre']))
            h.append('<p class="quien">%s</p>' % e(eq['integrantes']))
            h.append('<div class="tres">%s%s%s</div>'
                     % (mini(c_ruta, 'ruta %d/%d' % (hec, tot)),
                        mini(color_de(dh, dt), 'desarrollo %d/%d' % (dh, dt)),
                        mini(color_de(ah, at), 'artículo %d/%d' % (ah, at))))
            if (eq.get('publicacion') or {}).get('estado') == 'en linea':
                h.append('<span class="sello-vivo">publicado y en línea</span>')
            h.append('</a>')
        h.append('</div></div>')
    h.append('</section>')

    # Acceso directo a lo que ya está publicado y al código de cada equipo.
    h.append('<section><h2>Proyectos en GitHub</h2>')
    h.append('<p class="entradilla">Los equipos que ya tienen su proyecto versionado. '
             'Cuando un proyecto está publicado, el enlace lleva directo a su versión en línea; '
             'cuando todavía no, queda dicho qué falta para publicarlo.</p>')
    h.append('<div class="hitos">')
    for eq in datos['equipos']:
        pub = eq.get('publicacion') or {}
        if not pub.get('url') and not pub.get('repo'):
            continue
        color, rotulo = PUBLICACION.get(pub.get('estado', 'no aplica'), PUBLICACION['no aplica'])
        h.append('<article class="hito %s">' % ('hecho' if pub.get('url') else 'bloqueo'))
        h.append('<div class="hito-cab"><h3>%s</h3>%s</div>'
                 % (e(eq['nombre']), chip(color, rotulo)))
        h.append('<div class="hito-cuerpo">')
        h.append('<p class="dato">Equipo %s · %s</p>' % (e(eq['numero']), e(eq['integrantes'])))
        if pub.get('url'):
            h.append(vista_previa(pub['url'], eq['nombre']))
        botones = []
        if pub.get('url'):
            botones.append('<a class="boton principal" href="%s">Abrir el proyecto publicado ↗</a>' % e(pub['url']))
        if pub.get('repo'):
            botones.append('<a class="boton" href="%s">Código en GitHub ↗</a>' % e(pub['repo']))
        botones.append('<a class="boton" href="equipos/%s.html">Ver su ruta</a>' % e(eq['slug']))
        h.append('<div class="enlaces-proyecto">%s</div>' % ''.join(botones))
        if pub.get('nota'):
            h.append('<p class="pub-nota">%s</p>' % e(pub['nota']))
        h.append('</div></article>')
    h.append('</div></section>')

    # Hermanos
    h.append('<section><h2>Espacios hermanos</h2>')
    h.append('<p class="entradilla">Tres espacios con nombre propio, distintos entre sí: el Semillero '
             'Maker de Tecnología con Sentido, Filosofartec y Un Café con la Iguana.</p>')
    h.append('<div class="rejilla-equipos">')
    for herm in datos['hermanos']:
        h.append('<div class="hermano"><h3>%s</h3><p>%s</p>'
                 '<p class="relacion">%s</p>' % (e(herm['nombre']), e(herm['que']), e(herm['relacion'])))
        if herm.get('enlaces'):
            h.append('<div class="enlaces-proyecto">')
            for en in herm['enlaces']:
                h.append('<a class="boton" href="%s">%s</a>' % (e(en['url']), e(en['titulo'])))
            h.append('</div>')
        h.append('</div>')
    h.append('</div></section>')

    h.append('</main>')
    h.append(pie(meta))
    return ''.join(h)


# ---------------------------------------------------------------- main

def main():
    with open(DATOS, encoding='utf-8') as f:
        datos = json.load(f)

    os.makedirs(os.path.join(SALIDA, 'equipos'), exist_ok=True)

    ruta_portal = os.path.join(SALIDA, 'index.html')
    with open(ruta_portal, 'w', encoding='utf-8') as f:
        f.write(pagina_portal(datos))
    print('escrito  docs/index.html')

    for eq in datos['equipos']:
        destino = os.path.join(SALIDA, 'equipos', '%s.html' % eq['slug'])
        with open(destino, 'w', encoding='utf-8') as f:
            f.write(pagina_equipo(datos, eq))
        print('escrito  docs/equipos/%s.html' % eq['slug'])

    # .nojekyll para que GitHub Pages no se coma las carpetas que empiezan por _
    with open(os.path.join(SALIDA, '.nojekyll'), 'w', encoding='utf-8') as f:
        f.write('')

    print('\nListo: %d páginas de equipo más el portal.' % len(datos['equipos']))
    print('Generado el %s' % datetime.date.today().isoformat())


if __name__ == '__main__':
    main()
