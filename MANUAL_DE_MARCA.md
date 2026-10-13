# Manual de marca

**Semillero Maker de Tecnología con Sentido** · versión 2.0 · 2026-10-13

> Este documento y `datos/marca.json` son lo mismo dicho de dos maneras.
> Para cambiar la identidad se edita el **JSON** y se corre
> `python herramientas/generar_marca.py`: se regeneran la hoja de estilo y este
> manual. Así no se pueden contradecir.

---

## 1. De qué va esta identidad

**Concepto: Bitácora de taller.**

El semillero no es una marca de colegio ni una app de productividad: es un taller donde unos muchachos construyen algo y lo anotan todo. La página se ve como el cuaderno de ese taller: papel con retícula, anotaciones en monoespaciada, cifras grandes escritas a mano alzada y una franja de color por cada oficio. Lo que está hecho se ve hecho; lo que falta no se disfraza.

### Por qué no se parece a la de la iguana

La web de la iguana se rige por el manual de marca del INJUV. Este semillero es un proyecto personal de Néstor Andrés Paipa, no del colegio, así que no hereda ni su tipografía ni sus colores institucionales. Las dos publicaciones conviven sin parecerse.

---

## 2. Tipografía

### Títulos: Bricolage Grotesque

- **Pesos:** 600, 700, 800
- **Respaldo:** `Archivo, Segoe UI, system-ui, sans-serif`
- **Por qué:** Grotesca contemporánea de ancho variable, con rasgos inesperados en la g y la a. Moderna y curiosa sin perder seriedad. No la usa el colegio ni la iguana.
- **Dónde se usa:** Títulos, cifras grandes, números de nivel. Siempre con interletraje negativo.

### Texto corrido: Chivo

- **Pesos:** 400, 500, 600, 700
- **Respaldo:** `Segoe UI, system-ui, -apple-system, sans-serif`
- **Por qué:** Robusta y muy legible en pantalla, con carácter propio. Sostiene párrafos largos sin cansar, que es lo que pide una página que se lee en mitad de una sesión.
- **Dónde se usa:** Todo el texto corrido, botones y etiquetas de interfaz.

### Datos: JetBrains Mono

- **Pesos:** 400, 500, 600
- **Respaldo:** `ui-monospace, Cascadia Mono, monospace`
- **Por qué:** La monoespaciada de un entorno de programación. Este semillero habla de archivos, rutas, versiones y commits: esas cosas se escriben en mono o no se leen bien.
- **Dónde se usa:** Rutas de archivo, nombres de commit, conteos, rótulos en versalita, porcentajes.

### Escala

| Nombre | Tamaño | Token |
|---|---|---|
| gigante | `clamp(44px, 9vw, 96px)` | `--t-gigante` |
| titulo1 | `clamp(32px, 6.4vw, 58px)` | `--t-titulo1` |
| titulo2 | `clamp(23px, 3.8vw, 32px)` | `--t-titulo2` |
| titulo3 | `19px` | `--t-titulo3` |
| titulo4 | `16.5px` | `--t-titulo4` |
| cuerpo | `15.5px` | `--t-cuerpo` |
| chico | `13.5px` | `--t-chico` |
| dato | `11.5px` | `--t-dato` |
| rotulo | `10.5px` | `--t-rotulo` |

---

## 3. Color

El verde, el ámbar y el gris son EXCLUSIVAMENTE el semáforo de estado. No se usan de adorno. El cian es lo que se puede tocar. Cada línea técnica tiene su propio color, que se usa en campo, no en filete.

| Token | Claro | Oscuro | Para qué |
|---|---|---|---|
| `--papel` | `#EBEFF0` | `#071115` | Fondo de la página |
| `--superficie` | `#FFFFFF` | `#0F1D23` | Tarjetas y paneles |
| `--superficie2` | `#F3F7F8` | `#14242B` | Fondos hundidos, cabeceras de tabla |
| `--tinta` | `#0A181D` | `#E4EEF1` | Texto principal |
| `--tinta-suave` | `#4A6168` | `#8BA3AB` | Texto secundario y rótulos |
| `--filete` | `#CFDADD` | `#21363F` | Bordes |
| `--filete-sutil` | `#E2E9EB` | `#182931` | Separadores internos |
| `--panel` | `#0A1920` | `#050F14` | Franjas oscuras: barra, portada, pie |
| `--panel-2` | `#102C38` | `#0D2531` | Segundo tono del panel oscuro |
| `--sobre-panel` | `#E8F2F5` | `#E6F1F4` | Texto sobre el panel oscuro |
| `--sobre-panel-suave` | `#8EAEBB` | `#89A9B7` | Texto secundario sobre el panel |
| `--cian` | `#0E8E9E` | `#45C6D8` | Lo que se puede tocar: enlaces y botones |
| `--cian-vivo` | `#12A8BA` | `#67DAEA` | El mismo, al pasar el cursor |
| `--verde-fill` | `#1F9D5B` | `#34B872` | SEMÁFORO: nivel superado |
| `--verde-texto` | `#15713F` | `#5FD39B` | SEMÁFORO: el mismo, legible como texto |
| `--ambar-fill` | `#E8A317` | `#E8A317` | SEMÁFORO: nivel en curso |
| `--ambar-texto` | `#7F5604` | `#F2C055` | SEMÁFORO: el mismo, legible como texto |
| `--gris-fill` | `#8A9BA2` | `#5F747C` | SEMÁFORO: nivel sin empezar |
| `--gris-texto` | `#4F636A` | `#8BA3AB` | SEMÁFORO: el mismo, legible como texto |
| `--linea` | `#0E8E9E` | `#45C6D8` |  |
| `--linea-software` | `#0E8E9E` | `#45C6D8` | Línea técnica: desarrollo de software |
| `--linea-unity` | `#6A4FD8` | `#9B8CFF` | Línea técnica: Unity |
| `--linea-electronica` | `#D9533E` | `#F3826C` | Línea técnica: electrónica y robótica |
| `--linea-audiovisual` | `#B8348C` | `#F06BC0` | Línea técnica: producción audiovisual |

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
| `--retic` | `28px` |

Retícula de 28px: es la que dibuja el fondo de papel cuadriculado y la que marca el ritmo del espaciado.

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

- Iconografía: Lucide 1.56.0, licencia ISC, https://lucide.dev
- Tipografías: Bricolage Grotesque, Chivo y JetBrains Mono, SIL Open Font License, desde Google Fonts

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
