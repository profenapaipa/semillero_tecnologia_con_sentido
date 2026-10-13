# -*- coding: utf-8 -*-
"""
generar_marca.py — convierte el manual de marca en hoja de estilo.

    python herramientas/generar_marca.py

Lee   datos/marca.json
Escribe:
    docs/assets/css/marca.css   los tokens, en los dos temas
    MANUAL_DE_MARCA.md          el manual legible, con sus tablas

La idea es que la identidad se apruebe y se cambie en UN solo sitio.
Si Néstor cambia un color o una tipografía en datos/marca.json y corre esto,
cambia toda la apariencia del sitio y el manual queda al día solo. Nunca se
edita marca.css a mano, porque se regenera y se perdería el cambio.
"""

import io
import json
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, 'datos', 'marca.json')
CSS = os.path.join(RAIZ, 'docs', 'assets', 'css', 'marca.css')
MANUAL = os.path.join(RAIZ, 'MANUAL_DE_MARCA.md')

AVISO = ('/* ARCHIVO GENERADO. No se edita a mano.\n'
         '   Sale de datos/marca.json con  python herramientas/generar_marca.py\n'
         '   Cualquier cambio hecho aquí se pierde en la próxima generación. */\n')


def tinte(hex_color, alfa):
    """Mismo color con transparencia, para fondos de pastilla."""
    return '%s%02X' % (hex_color, int(round(alfa * 255)))


def bloque(tokens, sangria='  '):
    filas = []
    for k, v in tokens.items():
        filas.append('%s--%s: %s;' % (sangria, k, v))
    return '\n'.join(filas)


def derivados(base):
    """Los tintes y los colores de estado se calculan, no se escriben a mano."""
    d = {}
    for nombre in ('verde', 'ambar', 'gris', 'cian'):
        clave = '%s-fill' % nombre if '%s-fill' % nombre in base else nombre
        d['%s-tenue' % nombre] = tinte(base[clave], .13)
    for linea in ('software', 'unity', 'electronica', 'audiovisual'):
        d['linea-%s-tenue' % linea] = tinte(base['linea-%s' % linea], .14)
    # Valor por defecto de la linea tecnica, para lo que este fuera de un
    # bloque [data-linea]. Dentro de uno, sitio.css lo reemplaza.
    d['linea-t'] = tinte(base['linea'], .14)
    return d


def construir_css(m):
    claro = dict(m['color']['claro'])
    oscuro = dict(m['color']['oscuro'])
    claro.update(derivados(claro))
    oscuro.update(derivados(oscuro))

    t = m['tipografia']
    forma = m['forma']
    tipos = {
        'fuente-titulos': '"%s", %s' % (t['titulos']['familia'], t['titulos']['respaldo']),
        'fuente-texto':   '"%s", %s' % (t['texto']['familia'], t['texto']['respaldo']),
        'fuente-datos':   '"%s", %s' % (t['datos']['familia'], t['datos']['respaldo']),
    }
    for k, v in t['escala'].items():
        tipos['t-%s' % k] = v
    medidas = {k: v for k, v in forma.items() if not k.startswith('_')}

    sombras = {
        'alzado-1': '0 1px 2px rgba(5, 15, 20, .06)',
        'alzado-2': '0 4px 16px rgba(5, 15, 20, .08), 0 1px 3px rgba(5, 15, 20, .05)',
        'alzado-3': '0 16px 40px rgba(5, 15, 20, .13), 0 2px 8px rgba(5, 15, 20, .06)',
    }
    sombras_oscuro = {
        'alzado-1': '0 1px 2px rgba(0, 0, 0, .45)',
        'alzado-2': '0 4px 16px rgba(0, 0, 0, .5)',
        'alzado-3': '0 16px 40px rgba(0, 0, 0, .6)',
    }

    ide = m['identidad']
    cab = ['%s' % AVISO,
           '/* %s · manual de marca v%s · %s' % (ide['nombre'], ide['version'], ide['fecha']),
           '   Concepto: %s' % ide['concepto'],
           '',
           '   %s' % ide['idea'],
           '',
           '   %s' % ide['separacion'],
           '',
           '   Licencias:']
    for lic in m['licencias']:
        cab.append('     - %s' % lic)
    cab.append('*/\n')

    p = ['\n'.join(cab)]
    p.append(':root {')
    p.append('  /* --- color, tema claro --- */')
    p.append(bloque(claro))
    p.append('\n  /* --- tipografía y escala --- */')
    p.append(bloque(tipos))
    p.append('\n  /* --- forma y medidas --- */')
    p.append(bloque(medidas))
    p.append('\n  /* --- elevación --- */')
    p.append(bloque(sombras))
    p.append('\n  color-scheme: light;')
    p.append('}\n')

    cuerpo_oscuro = bloque(oscuro, '    ') + '\n\n' + bloque(sombras_oscuro, '    ') + \
                    '\n    color-scheme: dark;'
    p.append('/* El :not([data-theme="light"]) deja que una elección explícita de tema claro')
    p.append('   gane sobre la preferencia del sistema. */')
    p.append('@media (prefers-color-scheme: dark) {')
    p.append('  :root:not([data-theme="light"]) {')
    p.append(cuerpo_oscuro)
    p.append('  }\n}\n')
    p.append('/* La misma paleta oscura por elección explícita, para que el selector')
    p.append('   de tema gane en los dos sentidos. */')
    p.append(':root[data-theme="dark"] {')
    p.append(bloque(oscuro) + '\n\n' + bloque(sombras_oscuro) + '\n  color-scheme: dark;')
    p.append('}\n')
    return '\n'.join(p)


def construir_manual(m):
    ide, t, forma = m['identidad'], m['tipografia'], m['forma']
    L = []
    a = L.append
    a('# Manual de marca')
    a('')
    a('**%s** · versión %s · %s' % (ide['nombre'], ide['version'], ide['fecha']))
    a('')
    a('> Este documento y `datos/marca.json` son lo mismo dicho de dos maneras.')
    a('> Para cambiar la identidad se edita el **JSON** y se corre')
    a('> `python herramientas/generar_marca.py`: se regeneran la hoja de estilo y este')
    a('> manual. Así no se pueden contradecir.')
    a('')
    a('---')
    a('')
    a('## 1. De qué va esta identidad')
    a('')
    a('**Concepto: %s.**' % ide['concepto'])
    a('')
    a(ide['idea'])
    a('')
    a('### Por qué no se parece a la de la iguana')
    a('')
    a(ide['separacion'])
    a('')
    a('---')
    a('')
    a('## 2. Tipografía')
    a('')
    for clave, titulo in [('titulos', 'Títulos'), ('texto', 'Texto corrido'), ('datos', 'Datos')]:
        f = t[clave]
        a('### %s: %s' % (titulo, f['familia']))
        a('')
        a('- **Pesos:** %s' % f['pesos'])
        a('- **Respaldo:** `%s`' % f['respaldo'])
        a('- **Por qué:** %s' % f['porque'])
        a('- **Dónde se usa:** %s' % f['uso'])
        a('')
    a('### Escala')
    a('')
    a('| Nombre | Tamaño | Token |')
    a('|---|---|---|')
    for k, v in t['escala'].items():
        a('| %s | `%s` | `--t-%s` |' % (k, v, k))
    a('')
    a('---')
    a('')
    a('## 3. Color')
    a('')
    a(m['color']['_regla'])
    a('')
    a('| Token | Claro | Oscuro | Para qué |')
    a('|---|---|---|---|')
    para = {
        'papel': 'Fondo de la página',
        'superficie': 'Tarjetas y paneles',
        'superficie2': 'Fondos hundidos, cabeceras de tabla',
        'tinta': 'Texto principal',
        'tinta-suave': 'Texto secundario y rótulos',
        'filete': 'Bordes',
        'filete-sutil': 'Separadores internos',
        'panel': 'Franjas oscuras: barra, portada, pie',
        'panel-2': 'Segundo tono del panel oscuro',
        'sobre-panel': 'Texto sobre el panel oscuro',
        'sobre-panel-suave': 'Texto secundario sobre el panel',
        'cian': 'Lo que se puede tocar: enlaces y botones',
        'cian-vivo': 'El mismo, al pasar el cursor',
        'verde-fill': 'SEMÁFORO: nivel superado',
        'verde-texto': 'SEMÁFORO: el mismo, legible como texto',
        'ambar-fill': 'SEMÁFORO: nivel en curso',
        'ambar-texto': 'SEMÁFORO: el mismo, legible como texto',
        'gris-fill': 'SEMÁFORO: nivel sin empezar',
        'gris-texto': 'SEMÁFORO: el mismo, legible como texto',
        'linea-software': 'Línea técnica: desarrollo de software',
        'linea-unity': 'Línea técnica: Unity',
        'linea-electronica': 'Línea técnica: electrónica y robótica',
        'linea-audiovisual': 'Línea técnica: producción audiovisual',
    }
    for k in m['color']['claro']:
        a('| `--%s` | `%s` | `%s` | %s |'
          % (k, m['color']['claro'][k], m['color']['oscuro'][k], para.get(k, '')))
    a('')
    a('Los tintes (`--verde-tenue`, `--linea-unity-tenue`, etc.) **no se escriben**: los')
    a('calcula el generador al 13% y 14% de opacidad sobre el color base.')
    a('')
    a('---')
    a('')
    a('## 4. Forma y textura')
    a('')
    a('| Token | Valor |')
    a('|---|---|')
    for k, v in forma.items():
        if not k.startswith('_'):
            a('| `--%s` | `%s` |' % (k, v))
    a('')
    a(forma.get('_nota', ''))
    a('')
    a('### Texturas')
    a('')
    a(m['texturas']['_nota'])
    a('')
    for k, v in m['texturas'].items():
        if not k.startswith('_'):
            a('- **%s:** %s' % (k.capitalize(), v))
    a('')
    a('---')
    a('')
    a('## 5. Reglas que no se rompen')
    a('')
    a('1. **El verde, el ámbar y el gris son del semáforo.** No se usan de adorno en')
    a('   ningún otro lugar. Si algo necesita color y no es un estado, usa el cian o el')
    a('   color de su línea técnica.')
    a('2. **El color nunca va solo.** Todo estado lleva además una forma, un icono o un')
    a('   texto. Quien no distingue verde de ámbar tiene que poder leer la página igual.')
    a('3. **Ningún color literal fuera de este manual.** En las hojas de estilo y en el')
    a('   HTML solo se usan tokens. `herramientas/auditar.py` lo verifica y falla si')
    a('   aparece un color escrito a mano.')
    a('4. **Cada token existe en los dos temas.** Un color definido solo en el bloque')
    a('   oscuro deja la página ilegible en claro. La auditoría también revisa esto.')
    a('5. **Nada de emojis en la interfaz.** Cambian de dibujo en cada sistema y no se')
    a('   pueden teñir. Para eso está la iconografía.')
    a('')
    a('---')
    a('')
    a('## 6. Iconografía')
    a('')
    a('Set **Lucide**, incrustado en el HTML, no cargado desde un CDN: en la sala de')
    a('cómputo la conexión falla, y un icono que no carga deja la interfaz coja. Además,')
    a('incrustados heredan `currentColor` y funcionan en los dos temas desde el primer')
    a('cuadro.')
    a('')
    a('Los archivos están en `docs/assets/iconos/`. Para agregar uno nuevo se añade su')
    a('nombre a la lista de `herramientas/traer_iconos.py` y se corre ese script.')
    a('')
    a('El icono de GitHub está dibujado a mano, en la misma retícula, porque Lucide')
    a('retiró los iconos de marca.')
    a('')
    a('---')
    a('')
    a('## 7. Licencias')
    a('')
    for lic in m['licencias']:
        a('- %s' % lic)
    a('')
    a('---')
    a('')
    a('## 8. Cómo cambiar algo')
    a('')
    a('```')
    a('1. Edita datos/marca.json')
    a('2. python herramientas/generar_marca.py    regenera marca.css y este manual')
    a('3. python herramientas/generar.py          regenera las páginas')
    a('4. python herramientas/auditar.py          revisa que nada se rompió')
    a('```')
    a('')
    a('Por ejemplo, para que la línea de Unity deje de ser violeta y pase a naranja,')
    a('se cambian `linea-unity` en los dos temas de `datos/marca.json` y se corren los')
    a('tres comandos. Cambia en las tarjetas, en los iconos, en las cabeceras y en el')
    a('mapa, todo de una vez.')
    a('')
    return '\n'.join(L)


def main():
    m = json.load(io.open(ORIGEN, encoding='utf-8'))
    io.open(CSS, 'w', encoding='utf-8').write(construir_css(m))
    io.open(MANUAL, 'w', encoding='utf-8').write(construir_manual(m))
    print('escrito  docs/assets/css/marca.css')
    print('escrito  MANUAL_DE_MARCA.md')
    print('tokens de color por tema: %d (+ tintes calculados)' % len(m['color']['claro']))


if __name__ == '__main__':
    main()
