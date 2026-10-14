# Manual de marca

**Semillero Maker de Tecnología con Sentido** · versión 5.0 · 2026-10-13

> Este documento y `datos/marca.json` son lo mismo dicho de dos maneras.
> Para cambiar la identidad se edita el **JSON** y se corre
> `python herramientas/generar_marca.py`: se regeneran la hoja de estilo y este
> manual. Así no se pueden contradecir.

---

## 1. De qué va esta identidad

**Concepto: Bitacora de taller, con pigmentos de aqui.**

El semillero no es una marca de colegio ni una app de productividad: es un taller donde unos muchachos construyen algo y lo anotan todo. La página se ve como el cuaderno de ese taller, y se recorre como un camino: papel con retícula, anotaciones en monoespaciada, cifras enormes y una franja de color por cada oficio. El avance no se cuenta, se camina: cada fase es una parada del camino, y lo que falta no se disfraza.

### Por qué no se parece a la de la iguana

La web de la iguana se rige por el manual de marca del INJUV. Este semillero es un proyecto personal de Néstor Andrés Paipa, no del colegio, así que no hereda ni su tipografía ni sus colores institucionales. Las dos publicaciones conviven sin parecerse.

---

## 2. Tipografía

### Títulos: IBM Plex Serif

- **Pesos:** 600, 700
- **Respaldo:** `Georgia, "Times New Roman", serif`
- **Por qué:** Es la hermana con remates del mismo sistema. Da el contraste que un titulo necesita frente al texto, sin cambiar de familia ni de altura de x. Y a un semillero que produce articulos de investigacion le sienta mejor una serif que una display de cartel.
- **Dónde se usa:** Titulos y cifras grandes. Interletraje casi neutro: una serif no se aprieta como una grotesca.

### Texto corrido: IBM Plex Sans

- **Pesos:** 400, 500, 600, 700
- **Respaldo:** `"Segoe UI", system-ui, -apple-system, sans-serif`
- **Por qué:** Grotesca de corte humanista, con aperturas abiertas y altura de x generosa. Esta dibujada para interfaz y para leerse en pantalla a tamano pequeno: ni condensada ni extendida.
- **Dónde se usa:** Todo el texto corrido, botones, etiquetas, menus y paneles laterales.

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

IDENTIDAD. No es una paleta de catalogo tecnologico. Sale de tres cosas de aqui: el oro de la orfebreria muisca, la piedra clara de la sabana de Bogota y el anil de los textiles. Por eso el papel no es un gris azulado frio como el de cualquier panel de control, sino una piedra calida; y el panel oscuro no es negro sino anil de noche. Los cuatro colores de linea tecnica son pigmentos con nombre propio: anil, chicha, orquidea y achiote. Ninguno pisa el verde ni el ambar, reservados al semaforo. ESTRUCTURA. Cada color de acento tiene DOS versiones: la oscura, para leerse sobre papel, y la clara terminada en -panel, para leerse sobre el anil oscuro. Esa separacion es la que faltaba: el panel oscuro existe tambien en el tema claro, y ahi un color pensado para fondo blanco no contrasta.

| Token | Claro | Oscuro | Para qué |
|---|---|---|---|
| `--papel` | `#EFECE4` | `#121118` | Fondo de la página |
| `--superficie` | `#FFFFFF` | `#1B1A23` | Tarjetas y paneles |
| `--superficie2` | `#F8F6F0` | `#22212C` | Fondos hundidos, cabeceras de tabla |
| `--tinta` | `#1A1611` | `#F0EDE6` | Texto principal |
| `--tinta-suave` | `#595246` | `#A8A296` | Texto secundario y rótulos |
| `--filete` | `#D7D1C4` | `#36343F` | Bordes |
| `--filete-sutil` | `#E9E5DB` | `#2A2833` | Separadores internos |
| `--panel` | `#14192E` | `#0C0F1C` | Franjas oscuras: barra, portada, pie |
| `--panel-2` | `#242C4E` | `#1C2240` | Segundo tono del panel oscuro |
| `--sobre-panel` | `#EDEFF7` | `#EDEFF7` | Texto sobre el panel oscuro |
| `--sobre-panel-suave` | `#A8AFCA` | `#A8AFCA` | Texto secundario sobre el panel |
| `--cian` | `#234A9E` | `#93B5FF` | Lo que se puede tocar: enlaces y botones |
| `--cian-vivo` | `#1B3B80` | `#B4CCFF` | El mismo, al pasar el cursor |
| `--cian-panel` | `#93B5FF` | `#93B5FF` |  |
| `--verde-fill` | `#1F7A3D` | `#2E9C55` | SEMÁFORO: nivel superado |
| `--verde-texto` | `#166130` | `#6BD79A` | SEMÁFORO: el mismo, legible como texto |
| `--verde-panel` | `#5FD08A` | `#6BD79A` |  |
| `--ambar-fill` | `#B07908` | `#C98D10` | SEMÁFORO: nivel en curso |
| `--ambar-texto` | `#7A5305` | `#F2C45C` | SEMÁFORO: el mismo, legible como texto |
| `--ambar-panel` | `#F0BE4A` | `#F2C45C` |  |
| `--gris-fill` | `#8A857A` | `#6B6660` | SEMÁFORO: nivel sin empezar |
| `--gris-texto` | `#565146` | `#A8A296` | SEMÁFORO: el mismo, legible como texto |
| `--gris-panel` | `#B0B6CC` | `#B0B6CC` |  |
| `--linea` | `#234A9E` | `#93B5FF` |  |
| `--linea-software` | `#234A9E` | `#93B5FF` | Línea técnica: desarrollo de software |
| `--linea-unity` | `#6B2F96` | `#CBA3F2` | Línea técnica: Unity |
| `--linea-audiovisual` | `#A3176B` | `#F58FC4` | Línea técnica: producción audiovisual |
| `--linea-electronica` | `#9E3319` | `#F49C80` | Línea técnica: electrónica y robótica |
| `--linea-software-panel` | `#93B5FF` | `#93B5FF` |  |
| `--linea-unity-panel` | `#CBA3F2` | `#CBA3F2` |  |
| `--linea-audiovisual-panel` | `#F58FC4` | `#F58FC4` |  |
| `--linea-electronica-panel` | `#F49C80` | `#F49C80` |  |

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

- Iconografia: Lucide 1.56.0, licencia ISC, https://lucide.dev
- Tipografias: IBM Plex Serif, IBM Plex Sans e IBM Plex Mono, SIL Open Font License, desde Google Fonts

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
