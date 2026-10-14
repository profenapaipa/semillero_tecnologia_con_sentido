# -*- coding: utf-8 -*-
"""
exportar_diapositivas.py — convierte las presentaciones en imagenes.

    python herramientas/exportar_diapositivas.py

Usa el PowerPoint que ya esta instalado en el computador, por automatizacion
COM, para exportar cada diapositiva como imagen. Despues las convierte a WebP
con Pillow, que pesa entre tres y cinco veces menos que un PNG sin perder
nitidez en pantalla.

Resultado:
    docs/assets/diapositivas/<letra>/<n>.webp

Por que importa
---------------
Hasta ahora el sitio mostraba el TEXTO de cada diapositiva. Servia para leer,
pero se perdian los diagramas, las tablas de color, las flechas y todo lo que
el docente dibujo. Con las imagenes, el estudiante ve exactamente lo que se
proyecto en clase, en un carrusel, sin abrir el Drive ni PowerPoint.

El texto extraido NO se bota: sigue estando debajo de cada diapositiva, para
que la pagina se pueda buscar con Ctrl+F y para quien use lector de pantalla.

Requisitos
----------
Windows con PowerPoint instalado, y pywin32:
    pip install pywin32

Si no hay PowerPoint, este paso se salta y el sitio sigue funcionando con el
texto. No es obligatorio para construir.
"""

import io
import json
import os
import shutil
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIVE = r'K:\Mi unidad\Napaipa Injuv 2026\Proyectos semillero 2026'
LOCAL = os.path.join(RAIZ, 'SEMILLERO AULA MAKER')
DESTINO = os.path.join(RAIZ, 'docs', 'assets', 'diapositivas')
MODULOS = os.path.join(RAIZ, 'datos', 'modulos.json')

ANCHO, ALTO = 1600, 900      # 16:9, suficiente para verse nitido a pantalla completa
PDF = os.path.join(RAIZ, 'docs', 'assets', 'pdf')   # la sesion completa, en PDF
CALIDAD = 80                 # WebP: a partir de 80 la diferencia no se nota


def buscar(nombre):
    for base in (DRIVE, LOCAL):
        if not os.path.isdir(base):
            continue
        for r, _d, archivos in os.walk(base):
            if nombre in archivos:
                return os.path.join(r, nombre)
    return None


def exportar_pdf(ruta_pptx, destino):
    """
    La sesion completa en un PDF.

    Va aparte del carrusel por una razon practica: el PDF se puede abrir a
    pantalla completa, ampliar, imprimir y guardar en el celular sin
    conexion. Es el formato que un estudiante ya sabe usar.
    """
    import win32com.client
    pp = win32com.client.Dispatch('PowerPoint.Application')
    pres = None
    try:
        pres = pp.Presentations.Open(ruta_pptx, WithWindow=False, ReadOnly=True)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        pres.SaveAs(destino, 32)   # 32 = ppSaveAsPDF
        pres.Close()
        pres = None
    finally:
        try:
            if pres is not None:
                pres.Close()
        except Exception:
            pass
        try:
            if pp.Presentations.Count == 0:
                pp.Quit()
        except Exception:
            pass
    return os.path.exists(destino)


def exportar(ruta_pptx, carpeta_salida):
    """Abre la presentacion en PowerPoint y saca una imagen por diapositiva."""
    import win32com.client

    temporal = tempfile.mkdtemp(prefix='diapos_')
    pp = None
    pres = None
    try:
        pp = win32com.client.Dispatch('PowerPoint.Application')
        # PowerPoint se niega a trabajar oculto en varias versiones, asi que se
        # deja visible y se cierra al final.
        pres = pp.Presentations.Open(ruta_pptx, WithWindow=False, ReadOnly=True)
        total = pres.Slides.Count
        for i in range(1, total + 1):
            destino = os.path.join(temporal, '%03d.png' % i)
            pres.Slides(i).Export(destino, 'PNG', ANCHO, ALTO)
        pres.Close()
        pres = None
    finally:
        try:
            if pres is not None:
                pres.Close()
        except Exception:
            pass
        try:
            if pp is not None and pp.Presentations.Count == 0:
                pp.Quit()
        except Exception:
            pass

    # PNG -> WebP
    from PIL import Image
    os.makedirs(carpeta_salida, exist_ok=True)
    hechas = 0
    for nombre in sorted(os.listdir(temporal)):
        if not nombre.endswith('.png'):
            continue
        n = int(nombre[:3])
        with Image.open(os.path.join(temporal, nombre)) as im:
            im = im.convert('RGB')
            im.save(os.path.join(carpeta_salida, '%d.webp' % n),
                    'WEBP', quality=CALIDAD, method=5)
        hechas += 1
    shutil.rmtree(temporal, ignore_errors=True)
    return hechas


def main():
    if not os.path.exists(MODULOS):
        raise SystemExit('Falta datos/modulos.json. Corre antes: '
                         'python herramientas/extraer_modulos.py')
    with io.open(MODULOS, encoding='utf-8') as f:
        datos = json.load(f)

    try:
        import win32com.client  # noqa: F401
    except ImportError:
        print('No hay pywin32: se salta la exportacion de imagenes.')
        print('El sitio sigue funcionando con el texto de las diapositivas.')
        return

    total_imgs = 0
    for m in datos['modulos']:
        if not m.get('encontrado'):
            continue
        ruta = buscar(m['archivo'])
        if not ruta:
            print('  no se encontro %s' % m['archivo'])
            continue
        salida = os.path.join(DESTINO, m['letra'])
        # Si ya estan todas, no se vuelve a abrir PowerPoint.
        esperadas = len(m['diapositivas'])
        if os.path.isdir(salida) and len(os.listdir(salida)) >= esperadas:
            print('  %s) ya estaba, %d imagenes' % (m['letra'], esperadas))
            total_imgs += esperadas
            continue
        print('  %s) exportando %s ...' % (m['letra'], m['archivo']))
        try:
            n = exportar(ruta, salida)
            print('     %d imagenes' % n)
            total_imgs += n
        except Exception as err:
            print('     falló: %s' % err)

    # Y la sesion completa en PDF
    print('')
    print('PDF de cada sesion:')
    for m in datos['modulos']:
        if not m.get('encontrado'):
            continue
        ruta = buscar(m['archivo'])
        destino = os.path.join(PDF, 'sesion-%s.pdf' % m['letra'])
        if os.path.exists(destino):
            print('  %s) ya estaba' % m['letra'])
            m['pdf'] = True
            continue
        if not ruta:
            m['pdf'] = False
            continue
        try:
            m['pdf'] = exportar_pdf(ruta, destino)
            print('  %s) %s' % (m['letra'], 'listo' if m['pdf'] else 'no se genero'))
        except Exception as err:
            m['pdf'] = False
            print('  %s) falló: %s' % (m['letra'], err))

    # Se deja anotado en los datos que hay imagenes, para que el generador
    # sepa que puede mostrar el carrusel.
    for m in datos['modulos']:
        carpeta = os.path.join(DESTINO, m['letra'])
        m['imagenes'] = (os.path.isdir(carpeta) and
                         len([x for x in os.listdir(carpeta) if x.endswith('.webp')]) or 0)
    with io.open(MODULOS, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=1)

    print('\ntotal: %d imagenes' % total_imgs)
    if total_imgs:
        tam = sum(os.path.getsize(os.path.join(r, x))
                  for r, _d, fs in os.walk(DESTINO) for x in fs)
        print('peso: %.1f MB' % (tam / 1048576.0))


if __name__ == '__main__':
    main()
