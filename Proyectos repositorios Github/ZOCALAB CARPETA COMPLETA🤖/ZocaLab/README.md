# ZocaLab — Educación Ancestral Digital
> *El quinto elemento eres tú*

## Estructura del proyecto

```
ZocaLab/
├── index.html              → Animación de entrada (splash)
├── pages/
│   ├── login.html          → Inicio de sesión y registro
│   ├── bosque.html         → Pantalla principal: los dos bosques (día/noche) y tus árboles
│   ├── rutina-sol.html     → Mi día (intención, cuerpo, aprendizaje, gratitud, meta)
│   ├── rutina-luna.html    → Cerrar día (las plantas se duermen)
│   ├── mi-espacio.html     → Notas, tareas, metas, mes y diario
│   └── perfil.html         → Foto muisca, fondos, El Cóndor y estadísticas
├── css/
│   ├── style.css           → Variables y utilidades globales
│   ├── zocalab.css         → Componentes base de la app
│   └── muisca.css          → Ornamentación muisca, escenas animadas y componentes nuevos
├── js/
│   ├── datos.js            → Capa de datos (localStorage) y fotos de perfil
│   ├── bosque.js           → Bosques, árboles, plantado, migración de datos antiguos
│   ├── escenas.js          → Escenas animadas de fondo (sol, luna, espacio, perfil)
│   ├── animaciones.js      → Confeti, avisos, paralaje
│   ├── sonidos.js          → Efectos de sonido (generados por código)
│   └── condor.js           → El Cóndor, guardián del tiempo
└── assets/
    ├── bosque/             → Fondos ilustrados: rio-dia, rio-noche, laguna-dia, laguna-noche
    ├── arboles/            → Los 4 árboles: lluvia, viento, sol, estrella (+ la hoja original)
    └── perfil/             → Fotos de perfil muiscas (8)
```

## Cómo usar en VS Code

1. Abre la carpeta `ZocaLab` en VS Code
2. Instala la extensión **Live Server**
3. Click derecho en `index.html` → **Open with Live Server**
4. El proyecto abre en `http://localhost:5500`

## Los bosques

Hay dos bosques ilustrados. Al entrar se ve la versión de **día** (6:00–17:59) o de **noche** (18:00–5:59).
Cada bosque admite **un solo tipo de árbol**, relacionado con su temática:

| Bosque | Árboles que se pueden elegir |
|--------|------------------------------|
| Bosque del Río | Glifo de Lluvia · Templo del Viento |
| Bosque de la Laguna | Semilla del Sol · Estrella del Tiempo |

- Se planta **un árbol por día** (después de completar la rutina del sol o de la luna), en el bosque que se esté viendo.
- El tipo de árbol de un bosque se puede cambiar solo mientras ese bosque esté vacío.
- El botón **Mis árboles plantados** muestra todo lo plantado en ambos bosques.
- Los datos de la versión anterior (un solo bosque, 6 especies) se convierten solos la primera vez:
  `agua/aire → Río`, `tierra/fuego/dorado/flor → Laguna`; cada bosque queda con el tipo de su primer árbol.

## Música

La música generada por computadora se quitó. Cuando llegue el momento de subir archivos MP3,
el reproductor nuevo puede leerlos desde `assets/musica/`.

## Paleta de colores

| Color | Nombre | HEX |
|-------|--------|-----|
| 🟢 | Verde oscuro | `#1B5E3B` |
| 🟩 | Verde esmeralda | `#16B573` |
| 🟡 | Dorado muisca | `#E3A93A` |
| 🔴 | Terracota | `#C4522A` |
| 🔵 | Azul laguna | `#1D96C6` |
| ⚪ | Crema altiplano | `#F2EDE0` |

## Tipografía

- **Títulos:** Playfair Display (app) · Baloo 2 (splash)
- **Cuerpo:** Nunito (Google Fonts)
