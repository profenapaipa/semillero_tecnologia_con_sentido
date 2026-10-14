# Manual de marca

**Semillero Maker de Tecnología con Sentido** · versión 7.0 · 2026-10-13

> Este documento y `datos/marca.json` son lo mismo dicho de dos maneras.
> Para cambiar la identidad se edita el **JSON** y se corre
> `python herramientas/generar_marca.py`: se regeneran la hoja de estilo y este
> manual. Así no se pueden contradecir.

---

## 1. De qué va esta identidad

**Concepto: Laboratorio.**

El semillero construye y mide. La pagina se ve como el tablero de ese laboratorio: papel frio y limpio, tinta azul profunda, y acentos electricos que marcan de que oficio es cada cosa. Nada de crema ni de tonos tierra: eso pertenece a otra clase de documento. El avance se camina por un sendero, y lo que falta no se disfraza.

### Por qué no se parece a la de la iguana

La web de la iguana se rige por un manual de marca institucional ajeno. Este semillero es un proyecto personal de Néstor Andrés Paipa, así que no hereda ni su tipografía ni sus colores. Las dos publicaciones conviven sin parecerse, y el sitio del semillero no lleva crédito ni marca de ninguna institución.

---

## 2. Tipografía

### Títulos: Fraunces

- **Pesos:** 600, 700
- **Respaldo:** `Georgia, "Times New Roman", serif`
- **Por qué:** Serif variable con caracter propio: tiene eje optico, asi que a tamano grande muestra personalidad y a tamano pequeno se endereza y se lee. No es una serif de catalogo ni una grotesca neutra.
- **Dónde se usa:** Titulos, cifras grandes, numeros de parada. Interletraje casi neutro.

### Texto corrido: Public Sans

- **Pesos:** 400, 500, 600, 700
- **Respaldo:** `"Segoe UI", system-ui, -apple-system, sans-serif`
- **Por qué:** Disenada con requisito explicito de legibilidad en pantalla y accesibilidad. Formas abiertas, altura de x generosa, sin rasgos que distraigan. Es la pieza sobria que deja brillar a Fraunces sin pelearse con ella.
- **Dónde se usa:** Todo el texto corrido, botones, etiquetas, menus y paneles.

### Datos: IBM Plex Mono

- **Pesos:** 400, 500, 600
- **Respaldo:** `ui-monospace, "Cascadia Mono", monospace`
- **Por qué:** La tercera del mismo sistema. Rutas, versiones y commits se escriben en mono o no se leen bien.
- **Dónde se usa:** Rutas de archivo, commits, conteos, porcentajes y rotulos en versalita.

### Escala

| Nombre | Tamaño | Token |
|---|---|---|
| gigante | `clamp(52px, 10vw, 104px)` | `--t-gigante` |
| titulo1 | `clamp(31px, 5.6vw, 52px)` | `--t-titulo1` |
| titulo2 | `clamp(23px, 3.6vw, 32px)` | `--t-titulo2` |
| titulo3 | `20px` | `--t-titulo3` |
| titulo4 | `17px` | `--t-titulo4` |
| cuerpo | `16px` | `--t-cuerpo` |
| chico | `14px` | `--t-chico` |
| dato | `12px` | `--t-dato` |
| rotulo | `11px` | `--t-rotulo` |

---

## 3. Color

IDENTIDAD. Papel frio y limpio, no crema. El fondo esta en el azul muy desaturado, fuera de la franja de 20 a 60 grados de matiz donde viven las plantillas calidas; el negro del tema oscuro es azul profundo y no pardo. Los cuatro colores de linea tecnica son electricos, todos por encima del 75% de saturacion, que es donde un color se percibe vivo, y separados entre si por mas de 45 grados de matiz para que no se confundan de un vistazo. Son lo bastante oscuros para leerse sobre blanco: vivo y legible no estan renidos, lo que se sube es la saturacion y no la claridad. Ninguno pisa el verde ni el ambar, reservados al semaforo. ESTRUCTURA. Cada acento tiene dos versiones: la oscura para leerse sobre papel, y la clara terminada en -panel para leerse sobre el panel oscuro, que existe tambien en el tema claro. Y hay un token aparte, sobre-relleno, para el texto que va encima de un color saturado; se invierte con el tema, porque lo que cambia es el relleno.

| Token | Claro | Oscuro | Para qué |
|---|---|---|---|
| `--papel` | `#EFF3FA` | `#070A14` | Fondo de la página |
| `--superficie` | `#FFFFFF` | `#0F1424` | Tarjetas y paneles |
| `--superficie2` | `#F6F9FD` | `#141A2E` | Fondos hundidos, cabeceras de tabla |
| `--tinta` | `#0A0E1A` | `#EAEEF8` | Texto principal |
| `--tinta-suave` | `#4F5C75` | `#95A2BC` | Texto secundario y rótulos |
| `--filete` | `#D2DAE9` | `#242C47` | Bordes |
| `--filete-sutil` | `#E5EBF5` | `#1A2135` | Separadores internos |
| `--panel` | `#070B18` | `#04060E` | Franjas oscuras: barra, portada, pie |
| `--panel-2` | `#141D3D` | `#141D3D` | Segundo tono del panel oscuro |
| `--sobre-panel` | `#E9EEFB` | `#E9EEFB` | Texto sobre el panel oscuro |
| `--sobre-panel-suave` | `#94A4C6` | `#94A4C6` | Texto secundario sobre el panel |
| `--sobre-relleno` | `#FFFFFF` | `#070A14` |  |
| `--velo` | `#070B18A8` | `#04060EC2` |  |
| `--cian` | `#1F43E8` | `#8FA8FF` | Lo que se puede tocar: enlaces y botones |
| `--cian-vivo` | `#1134C7` | `#AFC0FF` | El mismo, al pasar el cursor |
| `--cian-panel` | `#8FA8FF` | `#8FA8FF` |  |
| `--verde-fill` | `#0A8546` | `#1FC46B` | SEMÁFORO: nivel superado |
| `--verde-texto` | `#097A41` | `#5BE39E` | SEMÁFORO: el mismo, legible como texto |
| `--verde-panel` | `#4FE39A` | `#4FE39A` |  |
| `--ambar-fill` | `#C97F00` | `#F0A818` | SEMÁFORO: nivel en curso |
| `--ambar-texto` | `#875A00` | `#FFC94D` | SEMÁFORO: el mismo, legible como texto |
| `--ambar-panel` | `#FFC94D` | `#FFC94D` |  |
| `--gris-fill` | `#8793A8` | `#5A6681` | SEMÁFORO: nivel sin empezar |
| `--gris-texto` | `#4E596C` | `#95A2BC` | SEMÁFORO: el mismo, legible como texto |
| `--gris-panel` | `#AFBBD1` | `#AFBBD1` |  |
| `--linea` | `#1F43E8` | `#8FA8FF` |  |
| `--linea-software` | `#1F43E8` | `#8FA8FF` | Línea técnica: desarrollo de software |
| `--linea-unity` | `#7317C9` | `#C59BFF` | Línea técnica: Unity |
| `--linea-audiovisual` | `#B30D67` | `#FF7ABD` | Línea técnica: producción audiovisual |
| `--linea-electronica` | `#AD2C0B` | `#FF8A6B` | Línea técnica: electrónica y robótica |
| `--linea-software-panel` | `#8FA8FF` | `#8FA8FF` |  |
| `--linea-unity-panel` | `#C59BFF` | `#C59BFF` |  |
| `--linea-audiovisual-panel` | `#FF7ABD` | `#FF7ABD` |  |
| `--linea-electronica-panel` | `#FF8A6B` | `#FF8A6B` |  |

Los tintes (`--verde-tenue`, `--linea-unity-tenue`, etc.) **no se escriben**: los
calcula el generador al 13% y 14% de opacidad sobre el color base.

---

## 4. Forma y textura

| Token | Valor |
|---|---|
| `--radio` | `12px` |
| `--radio-chico` | `7px` |
| `--radio-grande` | `20px` |
| `--ancho` | `1180px` |
| `--margen` | `20px` |
| `--trazo-icono` | `1.75` |
| `--retic` | `38px` |

Reticula de 38px: es el paso de las curvas de nivel que dibujan el papel, y marca el ritmo del espaciado.

### Texturas

Lo que separa esta página de una plantilla: las superficies tienen grano, no son campos planos de color.

- **Cuadricula:** Retícula de papel milimetrado, muy tenue, sobre el papel claro.
- **Plano:** Retícula azul de plano técnico sobre el panel oscuro, difuminada hacia los bordes.
- **Trama:** Rayado diagonal a 45 grados para las zonas sin empezar: dice 'aquí todavía no hay nada' sin usar color.

---

## 5. Reglas que no se rompen

1. **El verde, el ámbar y el gris son del semáforo.** No se usan de adorno en
   ningún otro lugar. Si algo necesita color y no es un estado, usa el cian o el
   color de su línea técnica.
2. **El color nunca va solo.** Todo estado lleva además una forma, un icono o un
   texto. Quien no distingue verde de ámbar tiene que poder leer la página igual.
3. **Ningún color literal fuera de este manual.** En las hojas de estilo y en el
   HTML solo se usan tokens. `herramientas/auditar.py` lo verifica y falla si
   aparece un color escrito a mano.
4. **Cada token existe en los dos temas.** Un color definido solo en el bloque
   oscuro deja la página ilegible en claro. La auditoría también revisa esto.
5. **Nada de emojis en la interfaz.** Cambian de dibujo en cada sistema y no se
   pueden teñir. Para eso está la iconografía.

---

## 6. Iconografía

Set **Lucide**, incrustado en el HTML, no cargado desde un CDN: en la sala de
cómputo la conexión falla, y un icono que no carga deja la interfaz coja. Además,
incrustados heredan `currentColor` y funcionan en los dos temas desde el primer
cuadro.

Los archivos están en `docs/assets/iconos/`. Para agregar uno nuevo se añade su
nombre a la lista de `herramientas/traer_iconos.py` y se corre ese script.

El icono de GitHub está dibujado a mano, en la misma retícula, porque Lucide
retiró los iconos de marca.

---

## 7. Licencias

- Iconografia: Lucide 1.56.0, licencia ISC, https://lucide.dev
- Tipografias: Fraunces, Public Sans e IBM Plex Mono, SIL Open Font License, desde Google Fonts
- Carrusel: Swiper 11.2.6, licencia MIT
- Animacion al desplazar: GSAP 3.12.5

---

## 8. Cómo cambiar algo

```
1. Edita datos/marca.json
2. python herramientas/generar_marca.py    regenera marca.css y este manual
3. python herramientas/generar.py          regenera las páginas
4. python herramientas/auditar.py          revisa que nada se rompió
```

Por ejemplo, para que la línea de Unity deje de ser violeta y pase a naranja,
se cambian `linea-unity` en los dos temas de `datos/marca.json` y se corren los
tres comandos. Cambia en las tarjetas, en los iconos, en las cabeceras y en el
mapa, todo de una vez.
