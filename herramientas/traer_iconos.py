# -*- coding: utf-8 -*-
"""
traer_iconos.py — descarga de Lucide los iconos que usa el sitio.

    python herramientas/traer_iconos.py

Por que se descargan y no se cargan desde un CDN:
  - En la sala de computo la conexion falla. Un icono que no carga deja la
    interfaz coja justo cuando el estudiante la necesita.
  - La via de JavaScript de Lucide reemplaza etiquetas despues de cargar la
    pagina: los iconos aparecen de golpe un instante despues. Incrustados,
    estan desde el primer cuadro.
  - Incrustados heredan currentColor, asi que funcionan en los dos temas.

Lucide es ISC: se puede incrustar citando la licencia. Queda citada en
MANUAL_DE_MARCA.md y en el pie del sitio.

Solo hay que correrlo cuando se agregue un icono nuevo a la lista.
"""
import io, os, sys, urllib.request

VERSION = '1.56.0'
BASE = 'https://unpkg.com/lucide-static@%s/icons/%%s.svg' % VERSION
DESTINO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                       'docs', 'assets', 'iconos')

ICONOS = [
    # lineas tecnicas
    'code-xml', 'gamepad-2', 'cpu', 'clapperboard',
    # navegacion y estructura
    'house', 'layout-grid', 'map', 'compass', 'chevron-right', 'chevron-down',
    'arrow-right', 'arrow-left', 'external-link', 'menu',
    # 'github' no existe en Lucide: retiraron los iconos de marca.
    # El nuestro esta dibujado a mano en docs/assets/iconos/github.svg
    # estados
    'check', 'circle-check-big', 'circle-dashed', 'circle-dot', 'play',
    # contenido
    'rocket', 'file-text', 'search', 'lightbulb', 'target', 'layers',
    'clock', 'folder', 'key-round', 'flask-conical', 'wrench',
    'graduation-cap', 'book-open', 'video', 'circle-help', 'trending-up',
    'git-branch', 'globe', 'pencil-ruler', 'list-checks',
    # selector de tema claro, oscuro o el del sistema
    'sun', 'moon', 'monitor', 'panel-left-close', 'panel-right-close',
]


def main():
    os.makedirs(DESTINO, exist_ok=True)
    nuevos = fallidos = 0
    for nombre in ICONOS:
        ruta = os.path.join(DESTINO, '%s.svg' % nombre)
        if os.path.exists(ruta):
            continue
        try:
            pet = urllib.request.Request(BASE % nombre, headers={'User-Agent': 'semillero'})
            with urllib.request.urlopen(pet, timeout=30) as r:
                svg = r.read().decode('utf-8')
            io.open(ruta, 'w', encoding='utf-8').write(svg)
            nuevos += 1
        except Exception as err:
            print('  no se pudo traer %s: %s' % (nombre, err))
            fallidos += 1
    print('iconos nuevos: %d · ya estaban: %d · fallidos: %d'
          % (nuevos, len(ICONOS) - nuevos - fallidos, fallidos))
    if fallidos:
        sys.exit(1)


if __name__ == '__main__':
    main()
