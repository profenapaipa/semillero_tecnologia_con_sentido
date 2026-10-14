# Bitácora de cambios — Wisfox

Documentación técnica del proceso de reestructuración del frontend de Wisfox: origen, cronología completa de decisiones, arquitectura resultante, inventario de lo construido, y hoja de ruta. Los comentarios línea por línea de cada función viven dentro de cada archivo en `src/`; este documento es el registro histórico y la vista de arquitectura.

---

## 1. Resumen ejecutivo

| | |
|---|---|
| **Proyecto** | Wisfox — plataforma de aprendizaje gamificada (lecciones, quizzes, tutor IA, notas, logros) |
| **Origen** | `wisfo_19.backup.html` — archivo único de 320KB / 3260 líneas, HTML+CSS+JS mezclados sin build tooling |
| **Fecha de reestructuración** | 2026-08-12 (base) — 2026-08-13 (ajustes) |
| **Stack resultante** | Vite 5.4 + JavaScript vanilla (ES modules), sin framework, sin TypeScript |
| **Persistencia** | `localStorage` del navegador, sin backend propio |
| **Estado** | 9/9 pantallas implementadas y verificadas en navegador (Playwright, cero errores de consola) |

---

## 2. Cronología del proceso: de boceto a esqueleto funcional

Esta sección narra, en orden, cómo se pasó de un solo archivo HTML a un proyecto modular completo — qué se hizo en cada paso, cómo, y por qué esa decisión importaba en ese momento. Es el complemento narrativo de las secciones 3-6, que documentan el resultado final.

### 2.1 Punto de partida: la solicitud original

El punto de partida fue un único archivo, `wisfo_19.backup.html`, abierto en el editor y descrito por el usuario como "el archivo preliminar o boceto de la aplicación... bastante desordenado y sobresaturado". La solicitud original fue concreta: organizar la estructura y el esqueleto completo de la app en la carpeta del proyecto, con un comentario en cada archivo explicando qué debía contener y cómo se estructuraría, conservando esos comentarios para los desarrolladores — y decir qué más hacía falta para avanzar.

**Por qué esto importa como punto de partida:** no se pidió "arreglar" el archivo ni "mejorar el diseño" — se pidió una *reorganización estructural* con documentación integrada. Eso fija el criterio de éxito para todo lo que sigue: no basta con que el código funcione, cada archivo tiene que explicarse a sí mismo.

### 2.2 Diagnóstico antes de tocar nada

Antes de escribir una sola línea, se inspeccionó el archivo original con herramientas de línea de comandos (conteo de líneas, longitud de líneas, `grep` de patrones estructurales) en vez de intentar leerlo completo de una vez — el archivo excedía el límite de lectura de una sola pasada. Ese diagnóstico reveló:

- 3260 líneas, pero solo ~940 de CSS real: el resto del peso (320KB) venía de 5 bloques de texto base64 de ~16-22KB cada uno, cada uno en una sola línea — las tipografías Nunito incrustadas directamente en el `<style>`.
- Un único `<script>` con toda la lógica: render de 9 pantallas, un motor de i18n casero, un sistema de temas/paletas, un motor de quiz con minijuegos, persistencia manual con `localStorage` repetido en cada punto de guardado.
- Comentarios de sección ya existentes en el CSS y JS originales (`/* ============ INICIO ============ */`, etc.) — es decir, el autor original ya tenía una organización *mental* clara, solo le faltaba la separación física en archivos.
- Bloques de CSS duplicados letra por letra (residuo de copiar y pegar) y una segunda pasada de estilos al final del archivo que volvía a declarar selectores ya existentes.

**Por qué esto importa:** organizar sin diagnosticar primero habría significado adivinar la estructura. Al identificar que el autor original ya pensaba en secciones, la división en archivos pudo seguir esas fronteras naturales en vez de imponer una taxonomía arbitraria — y al detectar la duplicación/segunda pasada de CSS *antes* de dividir, se pudo preservar el comportamiento visual exacto en vez de "limpiarlo" a ciegas y romper algo sin darse cuenta.

### 2.3 Decisiones de arquitectura, resueltas antes que la estructura de carpetas

Con el diagnóstico en mano, se identificó que la organización de carpetas dependía de tres decisiones que solo el usuario podía tomar — no eran de implementación, sino de producto:

1. **¿Con qué stack técnico?** Vite + JavaScript vanilla modular vs. React vs. JavaScript vanilla sin build tooling.
2. **¿Habrá backend?** Solo frontend con `localStorage` (como el boceto) vs. backend propio vs. un servicio tipo Firebase/Supabase.
3. **¿Cómo debe quedar el tutor IA?** Preparado para conectar una API real de LLM (con las respuestas actuales como *fallback*) vs. mantenerlo simulado.

Se resolvieron con el usuario antes de crear una sola carpeta, y las tres respuestas fueron las recomendadas: Vite + vanilla, solo frontend por ahora, y preparar la integración real del tutor.

**Por qué esto importa:** cualquier estructura de carpetas creada *antes* de esta conversación habría sido, en el mejor caso, coincidencia. Por ejemplo, "solo frontend" es la razón por la que existe `services/storage.js` como una capa de abstracción sobre `localStorage` en vez de llamadas a una API — si la respuesta hubiera sido "backend propio", esa capa se habría diseñado distinto desde el día uno. Tomar estas decisiones primero evitó tener que rehacer la base del proyecto a mitad de camino.

### 2.4 Extracción mecánica de contenido: priorizar cero errores de transcripción

Con la arquitectura decidida, el primer trabajo fue extraer del archivo original todo lo que era *contenido puro* (no lógica de interfaz): las 5 tipografías, el CSS, los 229 pares de texto del sistema de idiomas, y los catálogos de datos (lecciones, preguntas de quiz, logros, materias, reglas del tutor...).

Esta extracción se hizo **mecánicamente, no a mano**:
- Las tipografías se decodificaron de base64 a archivos `.woff2` reales con un script de shell, verificando después la "firma" binaria de cada archivo (`wOF2`) para confirmar que la decodificación fue correcta.
- El CSS se dividió en 7 archivos usando los números de línea exactos del original (`sed` con rangos), preservando el orden secuencial tal cual aparecía — no reagrupado por tipo de regla.
- El diccionario de idiomas (229 claves) se extrajo con un script de Node que evaluó el objeto original y separó automáticamente los campos `es`/`en`, en vez de copiar y pegar cientos de líneas de texto a mano.
- Los catálogos de datos (materias, lecciones, banco de preguntas, logros, reglas del tutor) se extrajeron con el mismo método de rangos de línea exactos.

**Por qué esto importa:** mover manualmente miles de líneas de contenido (frases en español e inglés, preguntas de examen, texto de lecciones) es exactamente el tipo de tarea donde un error humano de transcripción es fácil y difícil de detectar después. Usar herramientas mecánicas con rangos de línea verificables reduce ese riesgo a prácticamente cero, y además preserva automáticamente el orden de cascada del CSS — algo que transcribir a mano casi seguro habría alterado.

### 2.5 Construir primero la infraestructura, no las pantallas

Antes de tocar ninguna de las 9 pantallas, se construyeron los módulos de los que todas dependen: el motor de idiomas (`i18n/index.js`), el motor de temas (`theme/theme.js`), el estado persistido (`state/store.js`, `state/profile.js`), y los servicios (`services/storage.js`, `services/speech.js`, `services/tutor-api.js`).

Una decisión de diseño concreta surgió aquí: el `applyLang()` original llamaba directamente, por nombre, a unas 15-20 funciones de render repartidas por todo el archivo cada vez que cambiaba el idioma — algo que solo es posible cuando todo vive en un mismo script. Replicar eso en módulos habría obligado a que `i18n/index.js` importara cada pantalla, y cada pantalla importara de vuelta a `i18n/index.js` — una dependencia circular real, no solo teórica. En su lugar se implementó un patrón de publicación/suscripción (`onLanguageChange`, `onThemeChange`, `onXPChange`): cada pantalla se suscribe a lo que le interesa cuando arranca, y el módulo base solo avisa "algo cambió", sin conocer quién lo escucha.

Por la misma razón se cambiaron las funciones de consulta de la malla curricular (`temasDe()`, `materiaPct()`, etc.) para que recibieran `grado`/`lang`/`state` como parámetros explícitos en vez de leerlos de variables compartidas — el original dependía de que esas variables existieran en el mismo scope, lo cual deja de ser cierto en cuanto el código se separa en archivos independientes.

**Por qué esto importa:** ninguna pantalla, ni siquiera la más simple, puede mostrar un solo texto sin `t()` funcionando, ni recordar el progreso del usuario sin el estado funcionando. Construir esta base primero significa que, en cuanto se empieza una pantalla, ya se puede *ver* funcionando en el navegador — en vez de tener que construir todo el edificio antes de encender la primera luz.

### 2.6 Un criterio explícito para decidir qué portar completo y qué dejar como mapa de construcción

Con la infraestructura lista, se estableció una regla para decidir, pantalla por pantalla, si se implementaba por completo o se dejaba documentada como un mapa detallado de construcción (función por función, con su línea de origen en el prototipo, sin escribir el cuerpo):

> Infraestructura, datos y lógica ya completamente especificada = código real. Composición de interfaz que implica decisiones de producto no tomadas todavía = mapa de construcción, no una versión apurada.

Bajo ese criterio, **Inicio, Recursos, Mudy Aslan (chat), Logros, Bienvenida y Perfil** se implementaron completas en la primera pasada — eran lo bastante simples como para que dejarlas a medias no ahorrara ningún trabajo de diseño real. **Lecciones, Quiz y Notas** se dejaron como mapas de construcción extensos (qué función va, qué hace, de qué línea del original viene, qué elementos del DOM controla) porque son las pantallas más grandes y con más decisiones de interacción por tomar.

**Por qué esto importa:** la alternativa habría sido portar todo a la fuerza en una sola pasada, incluyendo partes donde el prototipo mismo tenía comportamiento incompleto o ambiguo (ver 2.10) — o, en el otro extremo, dejar todo como stub y entregar un esqueleto sin vida. El criterio explícito evitó ambos problemas: la app quedó *usable* desde el primer entregable, y las partes más grandes quedaron con una guía precisa en vez de una implementación apresurada.

### 2.7 `index.html`: por qué se conservó el marcado estático

En vez de que JavaScript construyera todo el DOM desde cero (el patrón típico de una app moderna), se decidió conservar el marcado HTML completo de cada pantalla tal como estaba en el prototipo, extraído mecánicamente igual que el CSS, y dejar que `main.js`/`app.js` solo agreguen comportamiento encima.

**Por qué esto importa:** era el camino de menor riesgo. El marcado del prototipo ya funcionaba visualmente; reescribirlo como plantillas de JavaScript habría introducido una superficie enorme de posibles errores de transcripción, y no aportaba ningún beneficio dado que el proyecto no usa un framework de componentes. Además, le da al equipo una referencia exacta de qué HTML necesita cada pantalla si en el futuro deciden migrar a React/Vue.

### 2.8 Verificar de verdad, no solo "que el código se vea bien"

Cada bloque de trabajo se cerró levantando el servidor de desarrollo real (`npm run dev`) y controlándolo con un navegador Chromium sin interfaz (Playwright), no solo revisando que el código compilara. Esto incluyó: instalar Playwright y su navegador en una carpeta temporal (no como dependencia del proyecto, ya que es una herramienta de verificación puntual, no parte de la app), navegar a la app real, hacer clic en los mismos botones que haría una persona, y revisar la consola del navegador en busca de errores.

Este método detectó también un falso positivo: una captura de pantalla que parecía mostrar un botón de navegación "roto" resultó ser una animación CSS de transición capturada a mitad de camino, no un error real — se confirmó repitiendo la prueba con una espera adicional y leyendo el estado del DOM directamente, no solo la imagen.

**Por qué esto importa:** revisar código y "asumir que funciona" es exactamente lo que puede dejar pasar errores de integración entre módulos — importaciones que apuntan al archivo equivocado, funciones que esperan un parámetro que nadie les pasa, listeners de eventos que nunca se conectan. Verificar en un navegador real, con la consola de errores como criterio objetivo, es la única forma de afirmar con evidencia (no con confianza) que una pantalla "funciona".

### 2.9 Punto de control con el usuario antes de seguir

Al terminar la primera entrega (infraestructura + 6 pantallas completas + 3 mapas de construcción), se resumió el trabajo y se devolvieron dos decisiones al usuario en vez de tomarlas unilateralmente: **qué pantalla construir primero** entre las tres pendientes, y **qué hacer con el código huérfano** detectado durante el diagnóstico (un dataset de rutas sin usar, un sistema de visualización tipo "árbol" que nunca llegaba a mostrarse, y una función vacía).

El usuario eligió Lecciones como prioridad, y eliminar el código huérfano en vez de dejarlo documentado.

**Por qué esto importa:** cuáles funcionalidades priorizar y qué hacer con código ambiguo (¿borrar o conservar por si acaso?) son decisiones de alcance y de producto. Tomarlas sin consultar habría sido asumir de más; preguntarlas en el momento exacto en que dejaron de ser obvias mantuvo al usuario en control del rumbo del proyecto.

### 2.10 Construcción iterativa de Lecciones, Quiz y Notas

Con la prioridad definida, cada una de las tres pantallas grandes se construyó siguiendo el mismo método: leer el bloque completo de código original correspondiente, portar su lógica preservando el comportamiento exacto pero adaptada al patrón de módulos (parámetros explícitos en vez de variables compartidas, atributos `data-action` con un único listener delegado en vez de decenas de `onclick` en línea), y cerrar cada una con verificación real en navegador antes de continuar con la siguiente.

Dos hallazgos concretos durante este trabajo, tratados de forma distinta a propósito:

- **Un bug real, corregido:** en el editor de notas, el ícono de la cabecera buscaba un campo (`.ic`) que no existía en los datos (el campo real se llamaba `.icn`), y por eso mostraba literalmente el texto `"undefined"` junto al título de cada nota. Se corrigió en vez de reproducirlo, porque no había ninguna duda de que era un error de tipeo, no una decisión de diseño.
- **Comportamiento incompleto del original, documentado pero no "arreglado":** la caja de búsqueda del encabezado, en el prototipo, solo filtraba dentro de un tema ya abierto — nunca existió una vista de resultados entre materias, a pesar de que el código sugiere que se planeó. Y el minijuego "Atrapazorro" cae, a propósito, en una pantalla de "próximamente". En ambos casos se dejó documentado el porqué exacto en vez de inventar una solución de diseño que no se pidió, o de ocultar la limitación pretendiendo que no existe.

**Por qué esto importa:** la diferencia entre un bug y una limitación de diseño no siempre es obvia, pero tiene consecuencias distintas — un bug se corrige sin preguntar porque nadie lo diseñó así a propósito; una limitación de producto se señala con claridad y se deja para que alguien con contexto de negocio decida qué hacer, en vez de que una decisión de diseño no solicitada quede escondida dentro de un cambio de código.

### 2.11 Hacer el proyecto operable, no solo correcto

Una vez las 9 pantallas quedaron completas, el trabajo pasó de "que funcione" a "que cualquiera del equipo pueda usarlo": se explicó cómo ejecutar el proyecto con los comandos estándar de `npm`, se creó `Iniciar Wisfox.bat` para arrancarlo con doble clic sin pasar por una terminal, y se tradujeron al español todos los comentarios explicativos que se habían escrito en inglés durante la construcción — sin tocar el contenido que el prototipo original ya tenía en español, y verificando de nuevo con build y pruebas de navegador que un cambio "de solo texto" no hubiera roto nada.

**Por qué esto importa:** un proyecto bien estructurado que solo una persona sabe ejecutar, o cuyos comentarios de arquitectura están en un idioma que no todo el equipo domina con fluidez técnica, sigue siendo un obstáculo para el resto del equipo. Estas tareas no agregan funcionalidad, pero determinan si el trabajo de reestructuración realmente le sirve a alguien más que a quien lo escribió.

---

## 3. Arquitectura técnica

### 3.1 Stack y build

- **Vite 5.4.21** como dev server y bundler. `vite.config.js` minimalista (puerto 5173, sin plugins).
- **JavaScript vanilla**, módulos ES nativos (`import`/`export`), sin transpilación de sintaxis moderna más allá de lo que Vite hace por defecto.
- **CSS plano**, sin preprocesador (no Sass/Less), usando `@import` y variables CSS nativas (custom properties).
- `package.json`: 3 scripts (`dev`, `build`, `preview`), una única devDependency (`vite`).

### 3.2 CSS: división en 7 archivos + orden de cascada

El CSS original (un bloque `<style>` de ~940 líneas) se dividió en `src/styles/` preservando el **orden secuencial exacto** del archivo fuente:

```
fonts.css → base.css → layout.css → screens.css → overlays.css → responsive.css → refinements.css
```

`refinements.css` (la pasada de "pulido v2" del original) se mantiene como el último import porque vuelve a declarar selectores ya existentes con la misma especificidad — su cabecera documenta explícitamente por qué no se puede reordenar sin re-verificar cada regla contra su contraparte anterior.

Las 5 fuentes se decodificaron de los data-URIs base64 a archivos `.woff2` reales en `public/fonts/` (uno por peso: 400/600/700/800/900), referenciados en `fonts.css` con el mismo `unicode-range` del subsetting original.

### 3.3 Flujo de arranque (bootstrap)

```
index.html
  └─ <script type="module" src="/src/main.js">
       └─ main.js: importa styles/main.css, llama a app.js:initApp()
            └─ app.js:initApp()
                 1. hydrateState() / hydrateProfile() / hydrateTheme()   — cargan localStorage
                 2. applyTheme() / applyLang()                          — pintan el estado inicial
                 3. wireWindowBridge()                                  — ver 3.4
                 4. wireRerenderOnChange()                               — suscribe renders a onLanguageChange
                 5. init<Pantalla>() × 9                                 — delegación de eventos por pantalla
                 6. render<Pantalla>() × 9                               — primer pintado
                 7. maybeShowWelcome()                                   — abre onboarding si perfil.nombre === ''
```

### 3.4 Patrones de diseño usados

**Delegación de eventos vs. puente de `window`.** Marcado **generado por JS** usa atributos `data-action`/`data-*` + un único listener delegado por pantalla, nunca `onclick` inline. Marcado **estático preexistente en `index.html`** que el prototipo ya tenía con `onclick="fn(...)"` se conservó tal cual por fidelidad, excepto donde una pantalla completa fue reescrita con delegación propia (Lecciones, Quiz, Notas, Tutora, pestañas de Perfil, Bienvenida). Lo que queda con `onclick` inline se resuelve exponiendo un puñado de funciones en `window` desde `app.js` (`wireWindowBridge()`), documentado ahí mismo.

**Publicación/suscripción para reactividad entre módulos** (`onLanguageChange`, `onThemeChange`, `onXPChange` — ver 2.5).

**Funciones puras parametrizadas en `data/curriculum.js`** (`temasDe()`, `materiaPct()`, etc. reciben `grado`/`lang`/`state` explícitos — ver 2.5), lo que evita una dependencia circular real con `state/profile.js`.

**Un ciclo de importación deliberado y verificado.** `screens/inicio.js` importa `setFilter` de `screens/lecciones.js`; `screens/lecciones.js` importa `renderInicio` de `screens/inicio.js`. Es un ciclo real, pero seguro porque ambos usos ocurren dentro de cuerpos de función (invocación diferida), no en tiempo de evaluación del módulo. Verificado con `npm run build` y con pruebas de navegador end-to-end.

---

## 4. Inventario de módulos

### 4.1 `src/data/` — catálogos de contenido (estático, sin lógica de UI)

| Archivo | Contenido |
|---|---|
| `subjects.js` | `SUBJECTS` (5 materias con posición orbital, color, ícono, progreso base), `MINDMAPS` (contenido de mapa mental por materia) |
| `lessons.js` | `LESSONS` (12 lecciones semilla), `LESSON_CONTENT` (cuerpo HTML es/en por lección), `FORMATOS` (4 formatos de visualización) |
| `curriculum.js` | `GRADOS` (6 grados), `MALLA` (malla curricular real, solo materia `ingles`, grados 6-11 × 4 periodos), `TEMAS_BASE` (fallback para materias sin malla), + funciones puras de consulta |
| `resources.js` | `RESOURCES` (6 recursos de estudio) |
| `quizzes.js` | `QUIZ_BANK` (5 materias × 3 preguntas), `MINIJUEGOS` (4 minijuegos), `LIMITE` (30s por pregunta) |
| `achievements.js` | `ACHIEVEMENTS` (8 logros semilla) |
| `tutor-rules.js` | `TUTOR_RULES` (reglas regex es/en) + `tutorReply()` — motor de respuesta simulada, usado como *fallback* por `services/tutor-api.js` |
| `notes.js` | `NOTA_TIPO` (5 tipos de nota), `IA_OPTS` (4 formatos de generación IA) |
| `profile-options.js` | `AVATARES` (12 emojis), `DALTS` (4 modos de daltonismo), `DALT_KEY` |

### 4.2 `src/state/` — estado mutable persistido

| Archivo | Expone |
|---|---|
| `store.js` | `state` (xp, racha, lecciones hechas, notas), `hydrateState()`, `save()`, `addXP(n)` + `onXPChange()` |
| `profile.js` | `perfil`, `grado`, `dalt`, `vozURI`, `hydrateProfile()`, `saveProfile()`, setters (`setGrado`, `setDalt`, `setAvatar`, `setFoto`, `setNombre`, `setVozURI`) |

### 4.3 `src/services/` — integraciones externas

| Archivo | Función |
|---|---|
| `storage.js` | Envoltorio de `localStorage` (`getJSON`/`setJSON`/`getStr`/`setStr`) con manejo de excepciones centralizado |
| `speech.js` | Web Speech API: `cargarVoces()`, `hablar()`, `pararVoz()`, `pintarBotonVoz()`, `isHablando()` |
| `tutor-api.js` | `askTutor(question)` — intenta `fetch` contra `VITE_TUTOR_API_URL`; si no está configurada o falla, cae a `tutorReply()` de `data/tutor-rules.js` |

### 4.4 `src/components/` — piezas reutilizables entre pantallas

| Archivo | Expone |
|---|---|
| `icons.js` | `ic(nombre, clase)` — genera `<svg><use>` contra el sprite `#iconset` de `index.html` |
| `toast.js` | `toast(mensaje)` — notificación transitoria |
| `modal.js` | `closeModal()`, `closeSheet()`, `cerrarHojas()`, `initModalShortcuts()` (tecla Escape) |
| `navigation.js` | `go(pantalla)`, `initNavigation()` (delegación de `[data-page]` + atajo Ctrl+K) |
| `orbit.js` | `renderOrbit(onSubjectClick)` — mapa SVG de habilidades de Inicio, algoritmo portado del original |

### 4.5 `src/screens/` — las 9 pantallas

| Pantalla | Origen (líneas del prototipo) | Notas técnicas |
|---|---|---|
| `inicio.js` | L3182-3197 | Misiones + lecturas de XP (`onXPChange`); orquesta `renderOrbit()` |
| `lecciones.js` | L2186-2464, L2923-2929 | La más extensa: rutas → temas → 4 formatos (texto/mental/concepto/fichas) + modal de lección |
| `quiz.js` | L2532-2874 | Modo estándar cronometrado (`LIMITE`=30s) + 3 minijuegos (`vf`, `memoria`, `ordena`); `atrapa` cae en placeholder por diseño |
| `notas.js` | L3022-3179, L3232-3245 | CRUD de notas + panel de asistencia IA (`conceptosDe()`) |
| `recursos.js` | L2466-2473 | Grid simple, portado íntegro |
| `tutora.js` | L2504-2521 | Chat conectado a `services/tutor-api.js:askTutor()` |
| `logros.js` | L2877-2883 | Grid de insignias, reutilizado como hoja (`#logrosSheet`) |
| `bienvenida.js` | L3006-3012 | Onboarding; dispara `showBienvenida()` desde `app.js` cuando `perfil.nombre` está vacío |
| `perfil.js` | L2936-2994, L1730-1742, L1638-1645 | Hoja de perfil/configuración; también aloja `renderThemeList()`/`renderLangList()` |

### 4.6 `src/utils/`

| Archivo | Expone |
|---|---|
| `xp.js` | `levelFromXP()`, `xpProgress()` — nivel piso 5, +1 nivel cada 500 XP |
| `format.js` | `escapeHtml()`, `recortar()`, `envolver()` (ajuste de etiquetas para SVG) |
| `dom.js` | `leerArchivo(input, cb)` — envoltorio de `FileReader`, compartido por Perfil y Notas |

---

## 5. Bugs corregidos y limpieza de código muerto

| Tipo | Detalle | Ubicación |
|---|---|---|
| Bug funcional | `abrirNota()` leía `NOTA_TIPO[...].ic` (campo inexistente; el real es `.icn`) — renderizaba el texto literal `"undefined"` junto al título de cada nota | `screens/notas.js` |
| Gap de cableado | El listener `change` de `#fileAvatar` no estaba conectado en el port inicial | `screens/perfil.js` |
| Código muerto eliminado | `ROUTES` — dataset de tarjetas de ruta que ninguna función referenciaba | `data/lessons.js` (ya no existe) |
| Código muerto eliminado | Sistema de visualización SVG "árbol" (`.tree-svg`/`.tnode`/...) — `renderTree` era alias de `renderOrbit`, nunca se renderizaba | `styles/overlays.css` (ya no existe) |
| Código muerto eliminado | `renderLessonFilters(){}` — función vacía | `screens/lecciones.js` (ya no existe) |

---

## 6. Pendientes técnicos conocidos

1. **Integración real del tutor IA.** `services/tutor-api.js` está listo para hacer `fetch` a `VITE_TUTOR_API_URL`; falta construir ese backend/proxy (nunca llamar a un proveedor de LLM directamente desde el cliente con una API key expuesta) y confirmar el contrato de request/response.
2. **Búsqueda entre materias incompleta** (heredada del prototipo — ver 2.10). Documentado en `components/navigation.js` y `screens/lecciones.js`.
3. **Minijuego "Atrapazorro" sin implementar** — placeholder "próximamente" por diseño del prototipo, no por error.
4. **Sin backend/cuentas de usuario.** Persistencia 100% en `localStorage`.
5. **Sin despliegue.** Solo corre en `localhost`; `npm run build` ya genera `dist/` listo para servir estático.
6. **Sin pruebas automatizadas.** La verificación de las 9 pantallas se hizo con scripts Playwright ad-hoc durante el desarrollo (no forman parte del repo).
7. **Deuda de CSS documentada.** `refinements.css` sigue siendo una segunda pasada superpuesta en vez de estar fusionada en sus archivos dueños.

---

## 7. Ruta de desarrollo sugerida

**Fase 1 — Cerrar funcionalidad core**
- [ ] Diseñar y construir el backend del tutor IA; conectar `VITE_TUTOR_API_URL`.
- [ ] Diseñar la vista de búsqueda entre materias (o remover el cableado pendiente si no se prioriza).
- [ ] Decidir el destino de "Atrapazorro" (implementar o retirar la tarjeta).

**Fase 2 — Backend de datos**
- [ ] Definir si Wisfox necesita autenticación + base de datos real.
- [ ] Si aplica: elegir proveedor (backend propio vs. BaaS tipo Firebase/Supabase) y migrar `services/storage.js` a llamadas asíncronas.

**Fase 3 — Despliegue**
- [ ] Elegir hosting (estático, dado que `npm run build` ya produce `dist/`).
- [ ] Configurar CI/CD básico si el equipo lo requiere.

**Fase 4 — Calidad**
- [ ] Suite de pruebas automatizadas (unitarias para `data/curriculum.js` y `utils/`; e2e para los flujos críticos de cada pantalla).
- [ ] Auditoría de accesibilidad y rendimiento en dispositivos móviles reales.
- [ ] Fusionar `refinements.css` en sus archivos dueños (requiere re-testeo visual).

---

## 8. Ejecución local

```bash
npm install       # solo la primera vez, o si cambia package.json
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build       # build de producción → dist/
npm run preview     # sirve dist/ para revisión → http://localhost:4173
```

Alternativa sin terminal: doble clic en `Iniciar Wisfox.bat` (raíz del proyecto).

---

## Registro de cambios

### 2026-08-12 — Reestructuración completa del prototipo
- Migración de `wisfo_19.backup.html` (archivo único, 320KB) a proyecto Vite modular.
- Extracción de 5 tipografías embebidas en base64 a archivos `.woff2` reales en `public/fonts/`.
- División del CSS en 7 archivos preservando el orden de cascada original.
- Extracción programática de los 229 pares de claves i18n a `i18n/es.js`/`i18n/en.js`.
- Implementación y verificación en navegador (Playwright) de las 9 pantallas.
- Preparación del punto de integración del tutor IA real con *fallback* a respuestas simuladas.
- Corrección del bug de `NOTA_TIPO.ic`/`.icn` en el editor de notas.
- Eliminación de `ROUTES`, el sistema de visualización "árbol", y `renderLessonFilters()` vacía.
- Relleno del listener faltante de `#fileAvatar`.

### 2026-08-13 — Localización de comentarios y arranque simplificado
- Traducción al español de los comentarios de cabecera y JSDoc de los ~40 archivos del proyecto.
- Creación de `Iniciar Wisfo.bat` para arrancar el entorno de desarrollo con doble clic.
- Creación de esta bitácora técnica, incluyendo la cronología completa del proceso.

### 2026-08-13 — Corrección de marca: "Wisfo" → "Wisfox"
- Reemplazo de toda mención de marca "Wisfo" por "Wisfox" en UI (título, logo, mensajes del chat, pantalla de bienvenida), comentarios de código, `package.json`, `.env.example` y esta bitácora — sin tocar `wisfo_19.backup.html` (archivo de respaldo preservado tal cual) ni el nombre de paquete `wisfoxv2` (ya estaba correcto).
- Renombrado `Iniciar Wisfo.bat` → `Iniciar Wisfox.bat`.
- Renombradas las 8 claves de `localStorage` con prefijo `wisfo*` a `wisfox*` (`wisfoxLang`, `wisfoxState`, `wisfoxPerfil`, `wisfoxGrado`, `wisfoxDalt`, `wisfoxVoz`, `wisfoxPaleta`, `wisfoxModo`) en `i18n/index.js`, `state/store.js`, `state/profile.js` y `theme/theme.js`. Sin lógica de migración: al no haber usuarios reales todavía, cualquier estado guardado bajo las claves viejas queda huérfano.
- Verificado con `npm run build` y pruebas de navegador (Playwright): título, logo, bienvenida y chat muestran "Wisfox" correctamente, las 6 claves de perfil/tema aparecen con el nuevo prefijo en `localStorage`, cero errores de consola.
