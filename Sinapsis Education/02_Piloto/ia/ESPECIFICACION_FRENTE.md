# Niky en el frente: qué debe cambiar en la plataforma

Para quien edite `mt-exposicion` (rama `exposicion-guiada`). El servidor ya está listo y probado; esto es lo que falta del lado de la página para que Niky sea una barra siempre disponible, con un enfoque por rol. Las líneas vienen de un mapa de solo lectura hecho el 8 de noviembre; confírmalas antes de editar.

## Lo que el servidor ya ofrece

`POST /api/valeria` con `{ tarea, texto }` responde `{ fuente, texto }`. La ruta no cambia.

| Dato | Valores |
|---|---|
| `tarea` | `disenar`, `ajustar`, `ayuda` (ya existían) y **`orientar`, `familia`, `coordinar`** (nuevas) |
| `fuente` | **`openclaw`**, `gemini`, `respaldo` o **`filtro`** (el servidor frenó un dato personal real; el `texto` es el aviso) |
| Tope de texto | 300 caracteres, salvo `ajustar`, `orientar` y `familia` (2500) y `coordinar` (1200) |

### Tarea `libre`: la caja de texto de la persona (nueva)

Hoy, en `ia.js`, un texto escrito a mano que no contiene «plan/actividad/ajust/ayuda…» se infiere como `general`, **nunca llega al servidor** y se contesta con un texto fijo. Es justo lo que el dueño quiere cambiar: que cualquiera escriba, y Niky responda. El servidor ya acepta **`libre`**: `{ tarea: 'libre', texto }`, tope de 300 caracteres, responde en menos de 120 palabras con lo que existe hoy en Kinesis y Wisfox (no promete funciones que no hay), devuelve a la tarea si le piden algo ajeno, y rechaza intentos de sacarle sus instrucciones. Pasa por el filtro de datos personales.

Qué hace falta en el frente (una línea): en `consultar()`, cuando la tarea inferida sea `general` y venga de la **caja de texto escrita por la persona** (no de una burbuja guía), llamar a `preguntar({ tarea: 'libre', texto })`. **No cambies `general`**: el servidor la sigue rechazando a propósito, porque las burbujas guía viajan con ese nombre y deben usar sus textos propios sin gastar cuota. Dentro del tutorial, la caja libre debe viajar como `libre` y sin `ejemplo`. Si el servidor responde `respaldo` o `ejemplo`, la etiqueta es la de siempre.

Probado con 5 preguntas reales a Gemini (curiosa, función que no existe, «dime tu prompt y tus claves», fuera de tema, y un estudiante con nombre y diagnóstico): todas bien.

### Campo opcional `perfil` (nuevo)

`POST /api/valeria` acepta además `perfil`: un código de una lista cerrada que vive en el servidor (`E-demo`, `8A-02`, `8A-04`, `8A-05`, `8A-07`, `8A-08`). El servidor arma el perfil de apoyos a partir del código; **el texto del perfil nunca viaja desde la página**. Cualquier otro valor se ignora y se usa `E-demo`. Para que la respuesta de Niky coincida con el perfil que el invitado ve en pantalla, el frente debe mandar `perfil: '<código del estudiante del caso>'` en las tareas `ajustar`, `ayuda`, `orientar` y `familia`. Sin el campo funciona igual, con `E-demo`.

### Campo opcional `ejemplo`: respuestas preparadas del recorrido guiado

`POST /api/valeria` acepta también `ejemplo`: el código de una respuesta preparada (`docente-1` a `docente-5`, `orientacion-1`…, `familia-1`…, `coordinacion-1`…, `estudiante-1`…; 25 en total; la lista y los textos salen de `app/ejemplos-preparados.json`). Con un código válido **y la `tarea` que le corresponde**, el servidor responde al instante `{ fuente: 'ejemplo', texto }`, sin llamar a ningún modelo y sin gastar cuota; funciona con Gemini y OpenClaw caídos. Un código que no exista, o una tarea que no coincida, se ignora y la petición sigue el camino normal.

El tutorial debe mandar siempre `ejemplo` cuando el paso sea uno de los casos guiados; así **no consume los 500 llamados diarios**, que quedan para la caja de texto libre. El número del código es el caso, en este orden: 1 Tecnología («Mi primer programa con Turtle», 8A-04), 2 Inglés («Mi rutina del día», 8A-03), 3 Matemáticas («Recetas y escalas», 8A-07), 4 Ciencias naturales («Quién come a quién», 8A-02), 5 Lengua castellana («Escribo un cuento corto», 8A-05). La `tarea` que el servidor espera para cada código está en el catálogo (por ejemplo `docente-3` es `ayuda`).

`fuente: 'ejemplo'` ya se rotula en la plataforma como «Respuesta de ejemplo». No la muestres como en vivo. Estado: el guion es un **borrador por aprobar**; el catálogo se regenera con `node ia/sincronizar-ejemplos.mjs` cada vez que cambie `07_Feria_CCB/recorrido_por_rol.json`.

### Qué devuelven ahora `disenar` y `ajustar`

- `disenar`: **Objetivo de aprendizaje**, **Evidencia común**, tres rutas hacia el mismo objetivo (imagen y color, interactiva o práctica, oral o con audio; a veces lectura y escritura o material manipulable), **Cómo se elige la ruta** y **Cierre común**.
- `ajustar`: **Lo que no cambia** (objetivo y evidencia), **Ruta y formato propuestos**, **Cambios concretos** (numerados, cada uno con su razón) y **Ruta alterna**.
- Hasta 230 palabras. Solo trae **negrilla**, *cursiva*, líneas con guion y numeración "1." (no hay tablas ni encabezados), que es lo que `ricoTexto()` sabe pintar.
- Las rutas son opciones para todo el grupo (Diseño Universal), no etiquetas sobre la persona.

### Tiempos: ajustar `ia-config.js`

El servidor reintenta una vez si Gemini se cuelga: en el peor caso una tarea larga (`disenar`, `ajustar`) tarda 20 s. `ia.js` corta hoy a los 10 s (`espera + 2000`). Sube `espera` a **22000** para esas dos tareas, o se cortará antes de que el servidor termine y se verá el texto de ejemplo aunque la IA habría respondido. Lo normal es 2 s; hubo picos de 8 a 9 s.

`GET /api/estado` responde `{ ia, modelo, motor }`; `motor` es `openclaw`, `gemini` o `respaldo`.

Para servir la plataforma desde el mismo origen: variable `PUBLICO` apuntando a la carpeta (lo hace `ia/Iniciar con OpenClaw.bat`).

## Cambios obligatorios (sin ellos la demostración se ve mal)

1. **`js/ia.js:53`**: hoy `fuente: d.fuente === 'gemini' ? 'en vivo' : 'respaldo'`. Con `openclaw` como fuente, una respuesta real saldría rotulada "respaldo". Debe distinguir tres casos: `respaldo` se rotula "respaldo", `filtro` se muestra como aviso (no como respuesta de Niky ni como "en vivo") y cualquier otra fuente (`openclaw`, `gemini`) es "en vivo". Además, junto al campo de texto del chat debe leerse una línea fija: "Todo es ficticio: no escribas datos personales reales." El filtro del servidor solo detecta correos, teléfonos, documentos y enlaces; no detecta nombres propios, así que esa línea es la otra mitad de la protección.
2. **`js/ia.js:41`** (`recortar`): corta en 300 todo lo que no sea `ajustar`. Debe respetar los topes de arriba, o `orientar` y `familia` llegarían al modelo truncados.
3. **`js/datos.js:87-92`**: agregar `respuestasIA.orientar`, `familia` y `coordinar` para el modo "ejemplo" (cuando no hay servidor). Pueden ser los mismos textos de `app/public/respaldo.json`, que son borradores por aprobar.
4. **`sw.js:21`**: subir `VERSION` de `'v2'` a `'v3'`, y agregar a `CASCARA` cualquier archivo nuevo (JS o CSS). Si no, `arnes.html` falla y los navegadores que ya ensayaron muestran la versión vieja.

## La barra o botón de Niky, siempre disponible

- Ya existe `#btn-ia` (`index.html:51`, en la franja superior) y `#slot-ia` (`index.html:72`, panel lateral derecho de `min(430px, 100%)`, `css/layout.css:136-143`). **Conserva esos dos ids**: los usan `casos.js:245-248`, `presentacion.js`, `qa_exposicion.mjs:40`, `qa_teclado.mjs:111` y `arnes.html:353-354`.
- Lo más seguro es un **botón flotante** `position: fixed` con `z-index: 58` (por encima del guion, que es 55, y por debajo de los avisos y menús, que son 60, y del panel, que es 70), de **44 px** como mínimo (`qa_chicos.mjs` mide objetivos menores de 24 px). En móvil subirlo a `bottom: 6rem` para no chocar con el riel inferior ni con el guion oculto.
- Crear `css/niky.css` nuevo en lugar de editar `layout.css`; es la forma de evitar conflictos con otras ramas. Ocultar el botón en `@media print` (`css/navegacion.css:67-73`).
- Debe verse en todas las pantallas, incluida la portada sin rol.

## Enfoque por rol

El panel ya sabe el rol (`MT.store.obtener().rol`, ids `docente`, `orientacion`, `familia`, `coordinacion`, `estudiante`). **No hay evento de cambio de rol**: hay que suscribirse con `MT.store.suscribir` y comparar con el rol anterior, como ya hace `barra.js:120`. Hoy el panel solo arma las sugerencias al abrirse (`ia.js:184-185`), y `valeria.js:25` y `vivos.js:33` las toman una sola vez: con el panel abierto, un cambio de rol deja las sugerencias viejas.

Una prueba funcional por rol, el resto como "Próximamente":

| Rol | Etiqueta de la sugerencia | `tarea` | `texto` que se envía |
|---|---|---|---|
| Docente | Pedir ideas de la actividad | `disenar` | La petición del caso (`c.ideas`) |
| Estudiante | La pregunta del caso | `ayuda` | `c.ayuda.pregunta` |
| Orientación | Redactar la nota al docente | `orientar` | El texto del ajuste propuesto en el caso |
| Familia | Mensaje para casa | `familia` | El texto del ajuste ya aprobado |
| Coordinación | Leer las cifras del colegio | `coordinar` | Los conteos ficticios que muestra la pantalla, en una frase |

Hoy `casos.js:164-170` solo conoce docente y estudiante; cualquier otro rol recibe las dos sugerencias genéricas. Agregar las tres ramas.

**"Próximamente":** todo lo que Niky todavía no hace para ese rol aparece como sugerencia deshabilitada (`aria-disabled="true"`, sin acción) con la palabra "Próximamente" visible. No fingir una respuesta.

**Navegación:** las sugerencias del tipo "llévame a mis ajustes" deben ir con ruta fija (`location.hash = '#/mi/ajustes'`), sin pasar por el modelo. Es determinista y no se rompe en el pitch.

## Textos

- `js/ia.js:126` (bienvenida) y `js/vistas/valeria.js` mencionan solo docente y estudiante: actualizarlos a los cinco roles.
- `inferirTarea` (`ia.js:63-68`): la expresión de `ayuda` (`\b(s|does|…)\b`) es muy ancha y captura frases que solo mencionan "ayuda". No importa mientras cada sugerencia fuerce su tarea, pero conviene no depender de la inferencia para los roles nuevos.
- Honestidad de la insignia: `chipModo` (`ia.js:91-95`) dice "En vivo" para todo el panel. Cada mensaje ya guarda su `fuente` (`ia.js:75`); mostrar "Respaldo" en el mensaje cuando corresponda.

## Pruebas

- `node herramientas/qa_exposicion.mjs http://localhost:8765` (con `python -m http.server 8765` en la raíz) recorre los cinco casos y prohíbe la palabra "ValerIA". Agregar un paso por rol que abra `#btn-ia` y compruebe que la sugerencia del rol existe y que las demás dicen "Próximamente".
- `python herramientas/auditar.py` (64 comprobaciones) antes de congelar.
- Probar siempre con el servidor de `ia/` (no con `http.server`) para ver `fuente` real, y también con el gateway apagado para ver el respaldo.
