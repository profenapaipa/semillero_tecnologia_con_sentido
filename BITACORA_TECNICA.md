# Bitácora técnica

Documento interno del proyecto. **No se publica en el sitio ni se enlaza desde él.**
Aquí quedan las decisiones de arquitectura, las limitaciones encontradas y lo que
queda pendiente, para poder retomar el trabajo sin releer toda la conversación.

Autor: Néstor Andrés Paipa · Semillero Maker de Tecnología con Sentido
Inicio: 13 de octubre de 2026

---

## 1. Decisión de arquitectura vigente

### Opción A: lectura directa de la carpeta de Drive montada en local (VIGENTE)

**Decisión de Néstor, 13 de octubre de 2026.** Así arrancamos.

La carpeta de Drive está montada con Google Drive para escritorio. No hace falta
cuenta de servicio ni credenciales de API para esta fase.

| Dato | Valor |
|---|---|
| Unidad montada | `K:` (cuenta institucional del docente) |
| Ruta raíz del semestre | `K:\Mi unidad\Napaipa Injuv 2026\Proyectos semillero 2026` |
| ID de Drive de esa carpeta | `13d80SyQWpuN0EFsU1_wZ4PrqBBxRCmS1` |
| Segunda unidad montada | `H:` (cuenta personal del docente), no contiene el semillero |

Cómo funciona: la revisión la dispara Néstor cuando quiere. No hay cron ni
GitHub Actions. Al pedirla, se recorre la carpeta montada, se calcula el estado de
cada equipo, se escribe un archivo de datos en el repositorio y el sitio estático
lo lee.

**Limitación aceptada:** la actualización depende de que Néstor abra VS Code y la
pida. No corre sola.

### Opción B: cuenta de servicio + GitHub Actions (PENDIENTE, NO IMPLEMENTADA)

Queda planeada a futuro, por decisión de Néstor. **No implementar hasta que él lo
pida.**

Qué haría falta para activarla, cuando se decida:

1. Proyecto en Google Cloud y una cuenta de servicio con su archivo de llave JSON.
2. Habilitar la API de Google Drive en ese proyecto.
3. Compartir la carpeta "Proyectos semillero 2026" con el correo de la cuenta de
   servicio, en modo **solo lectura**.
4. Guardar la llave JSON como secreto del repositorio en GitHub, por ejemplo
   `GOOGLE_SERVICE_ACCOUNT_KEY`. Nunca comiteada en el repositorio.
5. Un workflow con `schedule` semanal más `workflow_dispatch` para poder dispararlo
   a mano, que lea la carpeta por API, genere el archivo de datos y lo comitee.
6. Decidir qué hace el workflow cuando un equipo no tenga nada nuevo: hoy la idea
   es que el archivo de datos conserve la fecha de la última evidencia encontrada.

Ventaja: corre sin que nadie abra nada. Costo: credenciales que hay que
administrar y rotar.

---

## 2. Limitaciones técnicas encontradas el 13 de octubre de 2026

Estas no son decisiones, son hechos verificados que condicionan el diseño.

### 2.1 Los archivos `.gdoc` no se pueden leer desde el montaje local

Un `.gdoc` en la unidad montada no es el documento: es un puntero de 190 bytes.
Al intentar leerlo, el sistema de archivos de Google Drive responde
`read error: Invalid request code`. El contenido vive solo en los servidores de
Google.

Esto importa porque **las propuestas de la mayoría de los equipos son `.gdoc`**,
igual que varias guías de sesión. Con Opción A pura, de esos archivos solo se puede
saber que existen y cuándo se modificaron, no qué dicen.

Consecuencia para el diseño del semáforo: para un `.gdoc`, la señal disponible es
"existe / no existe" y su fecha de modificación. Es una señal binaria válida para
el nivel de tarea individual, pero no permite medir qué tan completo está por
dentro.

### 2.2 Los archivos `.docx` sí se leen completos, y se pueden medir por dentro

Un `.docx` en la unidad montada es un archivo real. Se abre como ZIP, se lee
`word/document.xml` y de ahí se saca el texto. Esto permite:

- Contar casillas de verificación: en `Barreras.docx` las casillas son el carácter
  Unicode `☐` (U+2610) escrito en la tabla, no controles de formulario de Word. Una
  casilla marcada aparecería como `☑` (U+2611) o `☒` (U+2612). Contar esos tres
  caracteres da el avance exacto de la hoja.
- Comparar contra la plantilla original: la plantilla sin tocar de
  `Articulo_base.docx` mide 13.803 bytes, 102 párrafos con texto y 5.239 caracteres.
  La de `Barreras.docx` mide 10.808 bytes, 49 párrafos y 1.543 caracteres. Todo lo
  que pase de ahí es texto que escribió el equipo. Es el método más confiable que
  encontré para distinguir "plantilla repartida" de "plantilla trabajada".

### 2.2.bis Umbrales medidos, para el escaneo automático

Valores de referencia verificados el 13 de octubre. Sirven para que la revisión
distinga sola la plantilla repartida del trabajo hecho.

| Documento | Plantilla intacta | Cómo se detecta el avance |
|---|---|---|
| `Articulo_base.docx` | 13.803 bytes · 102 párrafos · 5.239 caracteres | caracteres por encima de 5.239 |
| `Barreras.docx` | 10.808 bytes · 49 párrafos · 1.543 caracteres | casillas `☑`/`☒` y caracteres sobre 1.543 |
| `FFicha_tecnica_19_agosto.docx` | 20.153 bytes · 80 párrafos · 5.316 caracteres | caracteres por encima de 5.316 |
| Propuesta en Google Docs | `fileSize` 1.024 bytes | tamaño por encima de 1.100 bytes |

El umbral de la propuesta se validó leyendo el contenido: los documentos de 1.024
bytes solo traen las cinco preguntas de la plantilla, sin una sola respuesta, y en
varios casos sin nombres. Los de 2.300 bytes o más traen el problema, la pregunta
de investigación y las respuestas. Entre 1.100 y 1.400 bytes hay apenas nombres,
correos o un enlace suelto, que no cuenta como propuesta escrita.

### 2.3 Existe una tercera vía intermedia que no estaba en el planteamiento inicial

En esta sesión de trabajo hay un conector de Google Drive ya autorizado con la
cuenta institucional del docente. Con él sí se puede leer el contenido de los
`.gdoc`, buscando el archivo y pidiendo su texto.

No es la Opción B: no hay cuenta de servicio, no hay llaves, no hay workflow, y
sigue dependiendo de que Néstor abra la sesión. Es la Opción A con una fuente más.

Queda **anotada como pendiente de decisión de Néstor**, sin implementar.

---

## 3. Estado del repositorio al 13 de octubre de 2026

### 3.0 Resuelto el 13 de octubre: dónde quedó el portal

El portal se publicó en el repositorio `semilleroaulamaker`, que estaba reservado
y vacío, porque desde la sesión de trabajo no se puede crear un repositorio nuevo:
no hay `gh` instalado ni token de GitHub, y la API de creación necesita uno.

Néstor pidió renombrarlo a **`semillero_tecnologia_con_sentido`**. El renombre se
hace en Settings y GitHub deja una redirección desde el nombre viejo, así que ni
el remoto local ni los enlaces se rompen de inmediato. Después del renombre, el
remoto local se actualiza con:

```
git remote set-url origin https://github.com/profenapaipa/semillero_tecnologia_con_sentido.git
```

Dirección del sitio después del renombre:
<https://profenapaipa.github.io/semillero_tecnologia_con_sentido/>

### 3.1 Estado del repositorio del portal antes de esta sesión

La carpeta de trabajo `D:\Escritorio old\GIT Tecnología con Sentido` está vacía y
no es un repositorio git.

No existe en GitHub ningún repositorio llamado "Tecnología Con Sentido - Semillero
Maker de Investigación". Lo más cercano es `profenapaipa/semilleroaulamaker`, que
existe pero **está vacío**: nombre reservado, sin contenido.

### 3.2 La página publicada vive en el repositorio de un estudiante

La página de "Un café con la iguana" está publicada y en línea en
<https://profenapaipa.github.io/lawebdelaiguana/>, servida desde
`profenapaipa/lawebdelaiguana`, rama `main`, carpeta `/docs`.

Ese repositorio **es el proyecto del Equipo 1** (E04 y E03),
no el portal del semillero. Clon local en
`D:\Escritorio old\La web de la iguana`. Último commit: 1 de octubre de 2026.

Su estructura separa `docs/` (lo único publicado) de `investigacion/` (artículo,
antecedentes, evidencias, que no se publican porque contienen datos de los
estudiantes). Esa separación es una buena convención y conviene repetirla en el
portal.

**Pendiente de decisión de Néstor:** si el portal del semillero va en un
repositorio nuevo, en `semilleroaulamaker` que ya está reservado y vacío, o en otro
lugar. Mientras no lo decida, no se migra ni se enlaza nada.

### 3.3 Repositorios de los equipos que ya existen

| Equipo | Repositorio | Visibilidad | Local |
|---|---|---|---|
| 1 · La web de la iguana | `profenapaipa/lawebdelaiguana` | público, con Pages | `D:\Escritorio old\La web de la iguana` |
| 3 · Kinesis | `profenapaipa/planeacion-inclusiva-piar` | privado | `D:\Escritorio old\App para planeación de inclusión - (nombres omitidos)` |
| 5 · English Roulette | `profenapaipa/englishroulette` | público | `D:\Escritorio old\ROULETTE_EnglishDay2026` |
| 6 · Lector de lengua de señas | `profenapaipa/diversena` | privado | `D:\Escritorio old\Diverseña` |

El Equipo 7 (Wisfox) tiene código real en Drive pero todavía no tiene repositorio.

Todos cuelgan de la cuenta personal de Néstor, como estaba previsto. Las cuentas
individuales de los estudiantes siguen pendientes.

---

## 4. Decisiones tomadas el 13 de octubre de 2026

Las tres las decidió Néstor después de ver el inventario y la maqueta del Equipo 1.

### 4.1 El portal va en un repositorio nuevo, propio

No se cuelga de `lawebdelaiguana`, que es el proyecto del Equipo 1. El portal
tendrá su propio repositorio en la cuenta de Néstor, con nombre del semillero, y
desde ahí se enlaza la página del Equipo 1 que ya está publicada, sin tocarla ni
migrarla.

Razón: el historial, los permisos y la autoría quedan separados. El portal es de
Néstor y del semillero; el sitio del Equipo 1 es de dos estudiantes.

`semilleroaulamaker` queda libre y sin uso.

### 4.2 El semáforo usa evidencia amplia, no solo los dos formatos

Una tarea se puede dar por cumplida con tres clases de evidencia:

1. El formato llenado: `Barreras.docx` con casillas marcadas, secciones escritas
   en `Articulo_base.docx`, `FFicha_tecnica_19_agosto.docx` con texto propio.
2. Los archivos que el equipo subió a su carpeta de Drive: bocetos, guiones,
   antecedentes, avances, builds.
3. Los commits del repositorio del equipo, cuando existe, y el sitio publicado.

Razón: medido solo con los dos formatos, el semáforo del 13 de octubre daría casi
catorce equipos en gris, incluso los que tienen software funcionando y publicado.
Trece de los catorce no han marcado una sola casilla en `Barreras.docx`, y solo
uno escribió de verdad en el artículo. El desfase no es de avance, es de registro,
y el sitio debe mostrar el avance real.

Consecuencia pendiente de diseño: hay que definir, por línea técnica, qué archivo
cuenta como evidencia de cada fase. No es igual para Unity, desarrollo web,
electrónica y audiovisual.

### 4.3 Se usa el conector de Drive para leer los `.gdoc`

Autorizado por Néstor. Resuelve la limitación de la sección 2.1 sin salir de
Opción A: no hay cuenta de servicio, ni llaves, ni workflow, y sigue dependiendo
de que él abra la sesión.

Verificado el mismo día: el conector lee el contenido completo de un documento de
Google a partir de su ID de Drive. El ID se obtiene buscando por título, no desde
el archivo `.gdoc` local, que no se puede abrir.

Queda anotado que esta fuente **no sirve para la Opción B** tal como está: un
workflow de GitHub Actions no tiene acceso a este conector y necesitaría la cuenta
de servicio de todos modos.

---

## 5. Pendientes de decisión

1. Aprobación de la maqueta de ruta de aprendizaje del Equipo 1, antes de
   generalizarla a los catorce subequipos. Archivo: `mockups/ruta-equipo1.html`.
2. Qué archivo cuenta como evidencia de cada fase, por línea técnica, según lo
   decidido en 4.2.
3. Nombre exacto del repositorio nuevo del portal y si arranca público o privado.
   GitHub Pages con cuenta gratuita solo publica repositorios públicos.

---

## 6. Hallazgo: un ReferenceError tenía apagadas cinco funciones

Fecha: 14 de octubre de 2026.

### 6.1 El síntoma y la causa

El síntoma reportado fue que el selector de tema no hacía nada. Medido en el
navegador, el botón estaba puesto en la página pero nunca recibía su atributo
`data-tema`, señal de que su código no llegaba a correr.

La causa estaba lejos del botón. En `docs/assets/js/sitio.js` se usaba la
variable `cabecera` sin haberla declarado nunca. Todo el archivo vive dentro de
una sola función anónima en modo estricto, y en modo estricto leer una variable
inexistente lanza `ReferenceError`. La ejecución moría ahí y se llevaba por
delante todo lo que venía después:

| Sección | Qué dejó de funcionar |
|---|---|
| 9 | La barra de avance de lectura |
| 10 | Las cifras que cuentan hasta su valor |
| 11 | Las lecciones en ventana emergente |
| 12 | El plegado de los paneles laterales |
| 13 | El selector de tema |

Esto explica también la queja anterior de que las diapositivas y los vídeos de
los módulos no abrían: era la sección 11, muerta por la misma línea.

### 6.2 Por qué costó encontrarlo

Tres auditorías pasaban limpias, porque el HTML y el CSS estaban bien: el fallo
era de ejecución. Y abriendo la página como archivo local, Chrome enmascara el
error como `Script error.` sin archivo ni línea, por política de origen cruzado.
Hubo que instrumentar `sitio.js` sección por sección, dejando una marca antes de
cada una, para ver hasta dónde llegaba.

Lección: `node --check` no sirve para esto. La sintaxis era válida; el fallo solo
existe en tiempo de ejecución.

### 6.3 Qué se hizo

1. Se declaró `cabecera` apuntando a `.cabecera-fija`, que es el envoltorio
   pegado arriba y además está en `position: sticky`, o sea que sirve de
   referencia para la barra de avance, que va en `position: absolute`.
2. Se agregó `herramientas/auditar_js.py`, que abre páginas reales sin ventana y
   exige dos cosas: que exista `window.__sitioCompleto`, la señal que `sitio.js`
   deja en su última línea, y que no se haya registrado ningún error. Probada al
   revés: reintroduciendo el error, canta 16 fallas en 4 páginas.
3. Por eso `sitio.js` termina con `window.__sitioCompleto = true`. No se borra.

### 6.4 El tema oscuro quedó por defecto

`data-theme="dark"` va escrito en la etiqueta `<html>` de cada página, no solo
puesto desde el script, para que el tema oscuro valga también si el navegador
tiene JavaScript desactivado. El script del `<head>` solo corrige cuando hay una
elección guardada, y corre antes de pintar para que no haya parpadeo. La rueda
del botón es: oscuro, claro, sistema. Una regla nueva de `auditar.py` verifica
que el atributo esté en las 76 páginas.

---

## 7. Cinco correcciones de maquetación e interacción

Fecha: 14 de octubre de 2026.

### 7.1 La cabecera fija ahora se mide, ya no se adivina

Era la causa de fondo de dos de los cinco reportes. `--alto-fijo` estaba escrito a
mano en 128 px, y contra ese número se colocan el buscador pegado, los dos
paneles laterales y el salto de ancla. Pero la cabecera no mide lo mismo en todas
las páginas:

| Página | Cabecera real | Lo que se asumía |
|---|---|---|
| Portal | 57 px | 128 px |
| Equipo | 183 px | 128 px |

De ahí salían los 71 px de hueco entre la cabecera y el buscador, medidos con el
buscador ya pegado. Ahora `sitio.js` mide `.cabecera-fija` al cargar, al cambiar
el tamaño de la ventana, cuando un `ResizeObserver` detecta que cambió de alto y
cuando terminan de cargar las fuentes, y reescribe el token. El 128 px del CSS
queda solo como valor de respaldo si no corre JavaScript. Medido después: hueco
de 0 px.

### 7.2 El panel derecho se desplaza solo

Medido en `equipo-1.html` a 1582 × 904: el izquierdo tenía `max-height: 740px` y
`overflow-y: auto`; el derecho, ninguno de los dos, y medía 901 px contra un
hueco de 758 px bajo la cabecera, así que su parte de abajo no se alcanzaba
nunca. Se le puso la misma regla. En pantallas de menos de 1240 px el panel deja
de estar pegado y se lee en fila, así que ahí se le quita el límite de alto.

### 7.3 Enter en el buscador

El filtro ya corría al escribir, medido: de 15 tarjetas a 2 escribiendo "unity".
Lo que no hacía nada era la tecla Enter, porque no estaba atendida y el campo no
vive dentro de un formulario. Ahora Enter aplica el filtro, baja la vista a los
resultados y deja el foco en la primera tarjeta encontrada, para poder seguir con
el teclado. Sin resultados, lleva al aviso.

### 7.4 Un solo ancho para el armazón

Medido en el portal a 1582 px: la barra y la portada vivían en 1180 px y el
cuerpo en 1567 px, así que de arriba abajo no coincidía ningún borde. La portada
sí estaba centrada, con 194 px iguales a cada lado; lo que fallaba era eso.

Se unificó en el token `--ancho-total` (1760 px), que ahora usan la barra, la
portada, el cuerpo del portal y las páginas de equipo. `--ancho` sobrevive, pero
ya solo como ancho de lectura. Verificado: el logo de la barra y el panel
izquierdo arrancan en la misma línea, a 1600 px y a 1920 px.

### 7.5 La portada del portal va centrada

Decidido con Néstor. Solo la del portal, marcada con la clase `portada-inicio`
desde el generador. Las 15 páginas de equipo usan la misma clase `portada` pero
llevan insignia de equipo, insignia de línea técnica y anillo de avance:
centrarlas dejaba el título en el medio y las insignias contra el borde, peor que
no centrar nada. La textura del fondo también se volvió simétrica, porque estaba
apoyada contra la esquina superior derecha.

### 7.6 El tema claro vuelve a ser el de por defecto

`data-theme="light"` escrito en la etiqueta `<html>`. El atributo tiene que estar:
sin él, un equipo configurado en oscuro entraría en oscuro por la regla
`@media (prefers-color-scheme: dark)`. La rueda del botón es: claro, oscuro,
sistema.

### 7.7 Pendiente encontrado de paso, no corregido

A 390 px de ancho, la página se desplaza de lado: el portal llega a 510 px de
contenido contra 489 px de ventana, y la de equipo a 542 px. Culpables medidos:
las tarjetas de proyecto hermano en el portal, y en la página de equipo la vista
previa incrustada. Comprobado contra la versión anterior: **ya existía**, no lo
introdujeron estos cambios. Queda por decidir si se corrige.

---

## 8. Carga de avances del 16 de octubre de 2026

### 8.1 Un commit a mano sobre HTML generado

El commit `501c8d3`, "Publica ZocaLab en el portal del semillero", editó
directamente `docs/index.html` y `docs/equipos/equipo-12.html`. Esos archivos
los escribe `generar.py` a partir de `datos/semillero.json`, así que el cambio
se perdía en la siguiente regeneración. Comprobado antes de tocar nada: al
regenerar, las menciones a ZocaLab bajaban de 3 a 1 y desaparecían los sellos
de publicado. El trabajo se restauró desde git y se trasladó a la fuente de
datos, que es donde sobrevive.

**Regla, por si vuelve a pasar:** lo que se edite en `docs/` dura hasta la
próxima regeneración. Todo cambio de contenido va en `datos/semillero.json`.

### 8.2 El repositorio del Equipo 3 se renombró

`planeacion-inclusiva-piar` ahora se llama `Kinesis`. GitHub redirige la API
del nombre viejo, por eso seguía respondiendo, pero **no** redirige GitHub
Pages: por eso la URL vieja daba 404 y el sitio seguía mostrándolo como no
publicado. La URL buena es `https://profenapaipa.github.io/Kinesis/`.

### 8.3 Estado de publicación, medido

Consultado en la API pública de GitHub y comprobado pidiendo cada URL.

| Equipo | Repositorio | Público | Pages | Responde |
|---|---|---|---|---|
| 1 | lawebdelaiguana | sí | sí | 200 |
| 3 | Kinesis | sí | sí | 200 |
| 5 | englishroulette | sí | sí | 404 |
| 6 | diversena | sí | sí | 200 |
| 7 | wisfox | sí | sí | 200 |
| 12 | zocalab | sí | sí | 200 |

Los seis son públicos y los seis tienen Pages activado. El 404 de
`englishroulette` no es un error de configuración: es una aplicación de
escritorio en Python, no tiene `index.html` que servir, y su entregable no es
una página web. Pasó de un publicado a cinco.

### 8.4 Avances leídos en Drive

La plantilla en limpio pesa 13.803 bytes en `Articulo_base.docx` y 10.808 en
`Barreras.docx`. Un archivo más grande no basta como prueba, así que cada
documento se leyó completo.

- **Equipo 7, Wisfox.** `Barreras.docx` con dos barreras reales escritas: no
  lograr hacer la IA, y no saber sacar el ID de los archivos para la base de
  datos, con una pregunta concreta para grabar, escritas el 14 de octubre.
  Es el tercer equipo con barreras escritas: el 6 y el 10.1 ya las tenían.
  Las 20 casillas de la sección 1 siguen sin marcar, así que `casi` sigue en
  falso, y sigue sin haber un solo equipo que las haya marcado.
- **Equipo 9.** Llenó el Formato 1 y el Formato 2 el 16 de octubre. De ahí
  salen el nombre real del proyecto, *Animación de abandono*, que en el sitio
  figuraba como "Proyecto de E18, E19 y E17", y los nombres completos
  de quienes lo hacen.
- **Equipo 11.1.** Formato 1 lleno el 15 de octubre.

### 8.5 Lo que parecía avance y no lo era

El `Articulo_base.docx` del Equipo 9 creció de 13.803 a 16.287 bytes y se marcó
como versión 0.0.5 del 16 de octubre. Leído entero, **las secciones siguen
vacías**: lo que llenaron fue la tabla de seguimiento, marcando "sí" en 1.1,
1.2, 1.3 y 3.1 a 3.3. El texto del artículo no está en el documento. Por la
regla del semillero eso no cuenta como hecho, así que `preg` sigue en falso.

Es el caso que justifica leer y no solo pesar los archivos.


### 8.6 Corrección y comprobación de las fechas

En el commit `c048926` se afirmó que las barreras de Wisfox eran las primeras
de todo el semillero. **Es falso:** los equipos 6 y 10.1 ya tenían barreras
escritas. Wisfox es el tercero. Queda corregido arriba; el mensaje de ese
commit conserva el error porque ya estaba publicado.

Sobre las fechas: se comprobó que leer un documento con el conector de Drive
**no** altera su `modifiedTime`. Un archivo leído el 16 de octubre siguió
marcando su modificación real del 14. Las fechas de esta sección son, por
tanto, ediciones reales de personas y no rastros de la lectura.

### 8.7 Segunda tanda: los documentos del 14 de octubre

En la primera pasada quedaron sin atribuir unos diez documentos editados el 14
de octubre. Se leyeron todos y se subió por el árbol de Drive para confirmar de
qué equipo era cada carpeta cuando el documento no lo decía con claridad.

- **Equipo 2.1.** Formato 2 firmado por E02 y E01, que además nombra a una tercera integrante que el sitio no
  tenía: E05. Acuerdos hechos.
- **Equipo 4.** Formato 2 completo, con los dos nombres y el frente del que
  responde cada uno. Acuerdos hechos.
- **Equipo 11.2.** Formato 1 y Formato 2 llenos el 14 de octubre, los dos muy
  completos. De ahí salen los nombres: E25 y E26.

Dos documentos se leyeron y **no** cambiaron nada, porque su tarea ya estaba
marcada: los bocetos del 2.1 y la ficha técnica del 6.

### 8.8 Una tarea que no se marcó, aunque tiene contenido

La ficha técnica del Equipo 2.1 figuraba como "idéntica a la plantilla", y eso
era falso: tiene el paso 1 escrito y el paso 3 bien hecho, con Ibis Paint X
14.1.2 y Alight Motion 4.2.5 con sus versiones exactas, que es justo lo que el
formato pide. Pero el paso 2 tiene una de tres acciones y el paso 4, el esquema
de las tres cajas que explica cómo funciona el proyecto por dentro, está vacío.

No se marcó como hecha. Lo que se corrigió fue la evidencia, para que diga qué
hay y qué falta. Una evidencia que miente en contra del estudiante es tan
inútil como una que miente a favor.

El avance del semillero queda en 31%.

---

## 9. Tercera carga: repositorios y Drive al 17 de octubre

### 9.1 Una contradicción que dejó la carga anterior

Al actualizar la publicación de cuatro equipos no se actualizaron sus tareas de
desarrollo técnico, así que el sitio se contradecía a sí mismo: la tarjeta del
equipo decía "publicado y en línea" y, más abajo, su tarea `s6` seguía diciendo
"sin publicar", y la `s5` de Wisfox y ZocaLab decía "no hay repositorio en
GitHub" cuando los dos ya lo tenían.

Queda arreglado, y se agregó una comprobación al cerrar: el estado de
publicación y la tarea `s6` de cada equipo tienen que decir lo mismo. Hoy hay
cero contradicciones.

### 9.2 Commits contados, no supuestos

| Repositorio | Commits | Autores | Rango |
|---|---|---|---|
| Kinesis | 13 | Napaipa | 18 ago → 17 oct |
| diversena | 21 | Carla, Napaipa | 26 ago → 16 oct |
| zocalab | 2 | Napaipa | 15 oct |
| wisfox | 2 | Napaipa | 14 oct |
| lawebdelaiguana | 6 | Equipo 1, Napaipa | 17 sep → 1 oct |

El sitio decía "cinco commits" para Kinesis y para DiverSeña. Eran trece y
veintiuno.

### 9.3 Los proyectos tienen nombre propio

Los nombres salieron de los sitios publicados, no de lo que suponíamos:

- **Equipo 3.** El proyecto se llama **Kinesis**. Antes se llamó Andamio: hay
  un commit del 16 de octubre que lo renombra. Su página se titula "Kinesis ·
  Demostración" y se describe como plataforma de planeación inclusiva PIAR, con
  datos ficticios declarados en la propia página.
- **Equipo 6.** La marca propia se escribe **DiverSeña**, con la eñe en
  mayúscula interior. El sitio lo escribía "Diverseña".

### 9.4 Avances de Drive

- **Equipo 9.** E19 subió el 16 de octubre una carpeta
  *Antecedentes* con dos fuentes en PDF sobre protección animal, que es
  justamente el tema de *Animación de abandono*. Una de las dos está subida dos
  veces. La tarea `ante` pasa a hecha.

El avance del semillero queda en 33%.

### 9.5 El Equipo 13 entra al portal

El 16 de octubre se creó en Drive la carpeta **Equipo 13**,
al mismo nivel que las de los demás equipos. Dentro solo hay un acceso directo,
"AI códigos:", sin documentos ni tareas.

Al principio no se agregó al sitio: crear un subequipo número dieciséis cambia
la cifra de la portada a partir de una carpeta casi vacía, y eso lo decide
Néstor. El 17 de octubre Néstor decidió agregarlo.

El acceso directo lleva a un documento de Google de E02, "AI códigos:", con
tres bloques de código. Se pasaron a la carpeta local del Equipo 13 tal como
estaban: `agente/AGENTS.md` y `agente/SOUL.md`, que son configuración de
OpenClaw, y `voz/asistente_de_voz.py`, que convierte texto en voz con
ElevenLabs. El script no corre: dos líneas llegaron como `***` desde el propio
documento original.

Como el equipo no tiene propuesta, formatos, repositorio ni sitio, entra con
todas las tareas en falso y cada una con su razón. Es de la línea software y su
publicación figura "sin publicar".

Cambios que trajo agregarlo:

- La portada pasa de 15 a 16 subequipos y el avance del semillero baja de 33% a
  31%, porque entra un equipo en 0%.
- Las páginas pasan a 81. Todas cambian un poco, porque el menú de proyectos
  aparece en cada una y ahora lista el Equipo 13.
- El generador decía "quince" escrito a mano en dos textos del menú. Ahora
  calcula el número desde `datos/semillero.json`, para que no se vuelva a
  desactualizar.

Las cinco auditorías pasan: estructura, color, JavaScript, proporciones y
contraste.

### 9.6 Los estudiantes salen del sitio público

El sitio es público y no hay autorización para publicar nombres de estudiantes,
que son menores de edad. El 17 de octubre se reemplazaron todos por un código
fijo: E01 a E26 (el 21 de octubre se sumó E27 al Equipo 1). El código es el mismo en todos los equipos donde la persona
participa, de modo que el trabajo de una misma persona sigue siendo rastreable.

- Cambió el campo `integrantes` de los quince equipos con estudiantes, las
  notas y las tareas que nombraban a alguien, un nombre de proyecto que llevaba
  un nombre propio y los nombres de carpeta de Drive que se copian en los datos.
- La equivalencia entre código y persona está en
  `datos/seudonimos.json`, dentro de la carpeta del Equipo 13. Esa carpeta no se sube a ningún
  repositorio. Al cargar datos nuevos de Drive hay que traducir primero los
  nombres a su código, y los estudiantes nuevos reciben el siguiente número.
- La mención al docente no cambia.
- Dos ajustes del mismo día: el Equipo 13 pasó de llamarse con un nombre de
  pila a *Asistente IA del semillero*, y las dos Marianas, la del Equipo 5 y la
  del 10.1, resultaron ser personas distintas por sus apellidos, así que llevan
  códigos distintos: E11 y E21.

Otras comprobaciones del mismo día:

- Las 75 diapositivas de las sesiones se revisaron una por una: solo traen
  números de equipo, ningún nombre ni captura de un documento de estudiantes. Los
  seis PDF de las sesiones también salieron limpios.
- Dos formularios de Office llenados por estudiantes estaban versionados dentro de
  `SEMILLERO AULA MAKER`. Se sacaron del repositorio y se agregaron al
  `.gitignore`; siguen en el disco y en Drive.

Importante: los nombres siguen en el historial de commits del repositorio, que
es público. Una auditoría del historial completo (2.187 versiones de archivo)
los encontró en las páginas generadas, en los datos, en esos dos formularios, en
archivos de Wisfox que se colaron en algún commit y en mensajes de commit.
Quitarlos exige reescribir el historial y forzar el push, y eso no se hizo. Hay
un plan paso a paso, con una copia de seguridad y cuatro verificaciones antes de
publicar, en la carpeta del Equipo 13 (`docs/plan-limpiar-historial.md`).

---

## 10. Revisión semanal del 21 de octubre de 2026

Se revisó todo lo modificado en Drive desde el 17 de octubre, documento por
documento, y los commits de los seis repositorios. En los repositorios no hubo
nada nuevo desde el 17.

### 10.1 El Equipo 11.2 escribió el artículo en un fin de semana

Pasaron de tener el `Articulo_base.docx` idéntico a la plantilla a escribir
**catorce de las quince secciones**, en la versión v1.0 fechada el 21 de
octubre. No es relleno: lo que cuentan coincide con su guion técnico hasta en
el detalle de los fotogramas por segundo y el color de la luz por escena.

En el mismo fin de semana subieron, además:

- **Guion técnico**, cuarenta planos con encuadre, ángulo, diálogo, color de la
  luz LED, duración, fotos a doce por segundo y una columna de explicación
  simbólica. Cuadra exactamente los 195 segundos acordados.
- **Locaciones y plan de rodaje**, cuatro locaciones y cinco jornadas con
  fecha, qué planos se graban en cada una, quién anima y qué hay que llevar.
- **Plano de prueba grabado**, un video del 20 de octubre. En el guion técnico
  las cuarenta tomas siguen marcadas como no grabadas, así que esto es la
  prueba de luz y sonido, no el rodaje.
- **Ficha técnica** con los cuatro pasos llenos, incluido el esquema de las
  tres cajas, que es el paso que casi nadie completa.
- **Barreras** con tres problemas escritos y dos preguntas concretas para
  grabar.
- **Registro de bocetos**, donde declaran con honestidad que no dibujaron
  bocetos en papel y pasaron directo al prototipado en plastilina.

Su ruta pasó a 18 de 25, su ruta de video a 5 de 7 y su artículo a 13 de 15.

### 10.2 Las referencias del artículo no existen

Las cinco referencias en APA de la sección 5.2 se verificaron una por una. Los
cuatro DOI citados se consultaron en Crossref y **los cuatro devuelven 404**. Al
buscar los títulos tampoco aparece ningún registro que coincida: lo más cercano
que devuelve Crossref son artículos de temas distintos.

Son referencias inventadas, casi con seguridad generadas y pegadas sin
verificar. Por eso quedan como **no hechas** las dos secciones que dependen por
completo de esa bibliografía, la 1.2 y la 5.2, y también la tarea de
antecedentes. Todo lo demás queda como hecho, porque es trabajo propio sobre su
propio proyecto.

La regla del semillero es que una tarea sin evidencia no está hecha. Una
referencia que no existe no es evidencia. El equipo lo ve escrito en su propia
página, con el motivo.

### 10.3 Equipo 10.1

Subieron el 21 de octubre el documento de diseño de los dos modos de juego:
motricidad fina coloreando el personaje y esquivando obstáculos al ritmo de la
música, y motricidad gruesa con el ratón en baja sensibilidad sobre un espacio
que se reduce. Los siete hitos de Unity siguen todos sin evidencia: es el
equipo más trabado del semillero.

### 10.4 Una guarda nueva contra la fuga de nombres

La auditoría ahora falla si el nombre de un estudiante aparece en cualquier
página generada o en cualquier documento `.md` del repositorio. Compara contra
el archivo de seudónimos, que vive fuera del repositorio; si no lo encuentra,
avisa que no pudo comprobar en vez de fingir que revisó. Probada al revés,
insertando un nombre a propósito en el portal.

El semillero queda en 34% y con dos sesiones por delante.

---

## 11. Material propio del semillero, 21 de octubre de 2026

### 11.1 Por qué hacía falta

La línea audiovisual tenía **cero recursos en sus siete hitos**. Los equipos
escribían barreras y la respuesta del sitio era siempre la misma: "tutorial
pendiente de grabar por el profe". Eso deja a un equipo esperando en vez de
avanzando.

### 11.2 Once guías, escritas desde las barreras reales

Cada guía responde a una barrera que un equipo escribió de verdad, y lo dice en
su campo `porQue`. No salen de un temario.

| Guía | Responde a |
|---|---|
| Quitar el parpadeo de la luz | La barrera literal del 11.2 sobre la exposición automática |
| Que la voz calce con la animación | Su segunda barrera, el audio más rápido que las fotos |
| Revisar el audio con audífonos | Hito v5, que ningún equipo tenía |
| Exportar el video final | Hito v7, el entregable del 29 |
| Del guion literario al técnico | Hito v2, que estaba pendiente de grabar |
| Un plan de rodaje que cabe en una página | Hito v3 |
| El plano de prueba | Hito v4 |
| Buscar fuentes que existan y citarlas en APA | Las referencias inventadas del 11.2 |
| La tabla de seguimiento no es el artículo | La confusión del Equipo 9 |
| Sacar el identificador de un documento | La barrera del Equipo 7 sobre la base de datos |
| Dibujar el circuito y mapear los pines | Hitos e1 y e2, sin recursos hasta hoy |

Unity quedó fuera a propósito: ese material se está haciendo en paralelo.

### 11.3 Los enlaces se comprobaron antes de publicarlos

Veintidós enlaces externos, uno por uno. El manual de Stop Motion Studio se
descartó porque su página de ayuda devuelve 404. SciELO Colombia tampoco
respondió, así que se usó el portal general de SciELO.

Al revisar después los 47 enlaces del sitio completo aparecieron **dos enlaces
rotos que ya existían**, los dos de Unity: la ruta de interfaz de usuario de
*junior programmer* y el tutorial de *drag and drop*. No se tocaron, porque
Unity se está trabajando en paralelo, pero quedan anotados aquí.

### 11.4 El candado se soltó a la mitad

Antes se abrían los módulos hasta donde iba el equipo y se cerraba el resto.
Ahora se abre además **la mitad de lo que quedaba cerrado**, redondeando hacia
arriba. El objetivo dejó de ser dosificar el material: ningún equipo puede
quedarse sin con qué seguir porque le falte una tarea anterior.

Las guías del semillero no se bloquean nunca, igual que las diapositivas.

### 11.5 Dos correcciones de maquetación

- Las guías se centraron. Medido antes: los pasos ocupaban 1427 px de ancho con
  el texto limitado a 78 caracteres, o sea media página vacía a la derecha. Una
  página de guía no tiene paneles laterales, así que su contenido va centrado.
- Las tarjetas del índice eran un `<a>` con la clase `.hermano`, pensada para un
  `div`: heredaban el subrayado y el color de enlace, y el título y el resumen
  salían en azul subrayado. Ahora tienen clase propia.

El sitio pasa de 81 a 93 páginas.

---

## 12. Lo de hoy, y CapCut como editor aconsejado

### 12.1 Por qué la sesión de hoy es una página nueva y no un módulo

Los módulos llegan hasta el 16 y 17 de septiembre: no hay presentación para las
sesiones de octubre. Así que la sección que explica lo de hoy había que
escribirla, y tenía que calcularse sola, porque lo que a cada equipo le toca hoy
depende de en qué nivel va y de qué le falta.

Cada equipo tiene ahora su página `<slug>-hoy.html` con cuatro cosas, todas
sacadas de los mismos datos que alimentan el resto del sitio:

- Cuántos días faltan para la muestra, cuántas sesiones quedan y cuántas tareas
  siguen sin evidencia.
- Lo que tiene pendiente en su nivel actual, con la instrucción de cada tarea.
- Lo que le falta en los demás niveles, por si hoy sobra tiempo.
- Las guías que le sirven según su línea técnica.

### 12.2 El botón

Va dentro del mapa pegado arriba, al lado de las cuatro vistas, así que se ve
desde las seis páginas de cada proyecto. Es el único elemento del mapa con
relleno sólido, y toma el color de la línea técnica del equipo: eso basta para
que se vea primero sin recurrir a un color de alarma.

El contraste ya estaba cubierto por la auditoría, que verifica "texto sobre
relleno" para las cuatro líneas. Medido: entre 6,62 y 8,95 a uno, muy por
encima del mínimo de 4,5.

### 12.3 CapCut pasa a ser el editor aconsejado

Las guías de edición se habían escrito alrededor de DaVinci Resolve. CapCut es
el que los equipos ya tienen: la ficha técnica del 11.2 nombra "App Stop Motion
Studio (o CapCut v11.0)". Un editor instalado vale más que uno mejor que nadie
abre.

Cinco guías quedaron reescritas sobre CapCut, y se agregó la que faltaba:
**montar el stop motion en CapCut**, que es el primer paso y no estaba en
ninguna parte. Sin dejar las fotos a la misma duración, nada de lo que venga
después cuadra.

### 12.4 Lo que la guía dice que CapCut no hace

CapCut no tiene un efecto que quite el parpadeo de forma automática. La guía lo
dice con todas las letras, explica qué sí se puede hacer con Ajustar y
fotogramas clave, cuánto cuesta hacerlo a mano, y cuándo conviene regrabar en
vez de pelear con la edición. Deja DaVinci Resolve como alternativa solo para
el caso en que de verdad haga falta corrección automática.

Prometer en el material algo que el programa no hace es la forma más rápida de
que un equipo pierda una tarde.

El sitio pasa de 93 a 110 páginas.

---

## 13. Centro de desarrollo Unity del Equipo 10, 21 de octubre de 2026

### 13.1 Dónde vive cada cosa

El kit se construye fuera del portal, en
`Proyectos repositorios Github/Kit Unity Equipo 10/`, que git ya ignora:

| Carpeta | Qué hay |
|---|---|
| `Referencia/` | Proyecto Unity 2019.4.38f1 donde se compilan y prueban las piezas |
| `Referencia/Assets/KitEquipo10/` | Lo que viaja en los paquetes: scripts, escenas y recursos |
| `Referencia/Assets/Editor/ConstructorDelKit.cs` | Arma la escena de prueba y exporta los `.unitypackage`; no viaja |
| `guias/` | Generadores de las presentaciones (`guia0.py`, `estilo.py`) y del texto web (`contenido_web.py`) |
| `paquetes/` | `KitEquipo10_Motricidad.unitypackage` y `KitEquipo10_Ritmo.unitypackage` |

`guias/publicar_guias.py` escribe las guías Unity en `datos/guias.json` y copia
al sitio las diapositivas (`docs/assets/guias/<id>/`) y las descargas
(`docs/descargas/unity/`). Reemplaza por id, así que se puede correr varias veces.

### 13.2 Lo que se comprobó, no solo se escribió

- Los 14 scripts compilan en Unity 2019.4.38f1 con cero errores y cero advertencias.
- La escena `00_PruebaDelKit` corre en un ejecutable real de Windows y escribe
  "Kit listo · versión correcta" en el registro del jugador.
- El mensaje de error que cita la guía se obtuvo compilando el código de la foto
  de 10.2: `(23,26): error CS1525: Invalid expression term '}'`.
- Al correr el ejecutable, Windows abrió un aviso del Firewall y el arranque
  esperó unos 20 segundos. Quedó en la guía: se pulsa Cancelar.
- Las 9 diapositivas se revisaron renderizadas con PowerPoint, y el extractor
  del sitio las clasifica todas como línea Unity.

### 13.3 Tres campos nuevos y opcionales en las guías

`pagina_guia` acepta ahora `estado` (un chip, por ejemplo "Vista previa"),
`diapositivas` (carrusel con el mismo marcado de los módulos, así `sitio.js` lo
arranca sin código nuevo) y `descargas` (con el peso medido del archivo real;
si el archivo no existe, el enlace no se publica). Un paso puede traer
`codigo`. Las guías anteriores no usan ninguno y se ven igual.

Medido en Chrome sin ventana: Swiper inicializado, 9 de 9 imágenes cargadas,
3 descargas, el bloque de código y ningún error de JavaScript.

### 13.4 Pendiente

- `extraer_modulos.py` toma como título de cada diapositiva la primera línea de
  más de tres letras, que es la etiqueta de sección ("Unity"). No afecta a las
  guías, que llevan sus títulos escritos, pero sí a los módulos.
- ~~Los dos enlaces rotos del hito u4 (11.3)~~: resuelto en 13.5.
- El Unity de este computador no tiene el módulo WebGL para 2019.4.38f1. Sin él
  no hay build para publicar en la Fase 3.

### 13.5 Fase 1: los cuatro minijuegos y el juego rítmico, armados y jugados

Las piezas nuevas son 9 scripts, 7 prefabs, 3 personajes para colorear, 6 fondos,
3 canciones y 3 partituras. Todo es original y lo genera código del kit
(`recursos/generar_arte.py`, `recursos/generar_musica.py`). Los personajes que
propuso el equipo (Kirby, Eevee, Totoro, Hollow Knight) y las canciones de bandas
reales no se usaron, porque tienen derechos y el juego se va a publicar.

`ConstructorDelKit` arma además las escenas de referencia en `Assets/Solucion`.
Esas no viajan en los paquetes de los estudiantes: ellos ensamblan las suyas.

**El banco de pruebas** (`Referencia/Assets/Pruebas/BancoDePruebas.cs`) es un
jugador simulado. Juega cada minijuego en un ejecutable real, comprueba lo que
promete cada pieza y toma las capturas que usan las guías. Corrida final:
12 de 12 comprobaciones en motricidad y 7 de 7 en ritmo, estable en dos corridas
seguidas (112 de 112 notas, 7 de 7 sostenidas, 6 ms de error promedio).

Encontró tres cosas que leer el código no mostraba:

1. **El juego grueso era casi imposible de ganar.** El viaje hasta cada zona
   nueva contaba como "estar afuera", y el mapa se desvanecía en el escalón 5
   sin que el jugador se hubiera salido nunca. Ahora solo castiga salirse
   después de entrar, y el viaje se mide aparte como tiempo de llegada.
   La prueba al revés confirma que todavía se puede perder.
2. **Las notas acertadas se montaban sobre los íconos de las teclas.** Ahora
   desaparecen al acertarlas; las falladas siguen cayendo en rojo.
3. **El juez escuchaba también el teclado real durante la prueba**, y dos
   sostenidas salieron como soltadas. Se le agregó la casilla
   `leerTecladoYMouse`, que el banco apaga.

El CSV pasó de un solo archivo con celdas `clave=valor` a un archivo por juego
con encabezados, que Excel abre directo en columnas.

Los dos paquetes se importaron en proyectos 2D nuevos y vacíos de 2019.4.38f1 y
compilaron sin errores. En esa prueba apareció un error de Unity por **una ruta
de más de 260 caracteres**, y no era del kit. Es otra razón para el `C:\Unity`
corto que pide la Guía 0.

**Hito u4:** los dos enlaces de learn.unity.com daban 404 (comprobado el 21 de
octubre). Se reemplazaron por la referencia oficial de 2019.4 de
`Input.GetMouseButtonDown` y `Object.Instantiate`, que responden 200.

En Drive, cada equipo tiene:
- en "H) 21 y 22 de octubre", el kit, los scripts sueltos para leer y un LEEME
  con el origen de los recursos;
- en "I) 28 y 29 de octubre", su Guía 1.

La solución armada (`paquetes/Solucion_Equipo10_SoloDocente.unitypackage`)
queda solo en este computador.

**Peso:** `docs/descargas/unity/` suma 19 MB, casi todo música dentro de los dos
paquetes. Si el repositorio crece demasiado con cada versión del kit, la salida
es dejar los paquetes solo en Drive y enlazar desde el sitio.

### 13.6 WebGL: lo que se comprobó y lo que no

El módulo WebGL de 2019.4.38f1 no estaba instalado; se agregó con el Hub por
línea de comandos (`Unity Hub.exe -- --headless install-modules --version
2019.4.38f1 --module webgl`). En esta sesión hubo que quitar la variable
`ELECTRON_RUN_AS_NODE`, que VS Code deja puesta y hace que el Hub se lea a sí
mismo como un script de Node.

**Comprobado**, exportando las dos soluciones y abriéndolas en Chrome por HTTP
con un controlador propio del protocolo DevTools (Node 24 trae WebSocket):

- Las dos exportaciones salen sin errores y pesan unos 21 MB cada una.
- Unity arranca, los menús y las escenas se ven, las notas caen y las que nadie
  toca salen en rojo, y el contexto de audio queda en `running`.
- Sin excepciones propias del juego en la consola.

**Hallazgos que cambiaron cosas:**

1. **Una ruta con tilde rompe la exportación.** Desde
   `...\Tecnología con Sentido\...` falla `il2cpp.exe` con "No hay ninguna
   asignación en la página de códigos de múltiples bytes"; copiado a una ruta
   sin tildes, sale bien. Es otra razón para el `C:\Unity` de la Guía 0, y está
   en la Guía 2.
2. **Compresión en Disabled.** GitHub Pages no puede enviar el encabezado
   `Content-Encoding` que piden los archivos Gzip o Brotli. No se probó el
   síntoma exacto de dejarla activada; la guía solo dice que no carga.
3. **`CursorVirtual` solo funcionaba con el mouse capturado.** Sin captura, cada
   clic solo reintentaba capturar y el juego quedaba muerto; bastaba con que el
   navegador la rechazara o con pulsar Escape. Ahora distingue "liberado a
   propósito" de "no capturado" y, sin captura, sigue el movimiento normal.

**No comprobado, y la Guía 2 lo dice así:**

- **La captura del mouse en el navegador.** Una página de 12 líneas, sin Unity,
  falla igual con `pointerlockerror` en Chrome sin ventana, con la ventana
  nueva y con el foco simulado. Ningún navegador automático la concede, así que
  hace falta una persona. La Guía 2 trae la lista de comprobación de dos minutos.
- **Si la sensibilidad se siente igual en la web que en Windows.** Se sospecha
  que Unity entrega el movimiento del mouse con otra escala en WebGL, pero no se
  midió. Si no se siente bien, se cambian `SensibilidadFina` y
  `SensibilidadGruesa` en `ConfiguracionJuego.cs`.
- La captura de mouse tampoco la ejercita el banco de pruebas de escritorio, que
  apaga el `CursorVirtual` y escribe sus valores a mano.

Las exportaciones quedan en `Proyectos repositorios Github/Kit Unity Equipo 10/webgl_referencia/`
(ignorada por git), con `probar.py` para abrirlas. No se publicaron en el sitio:
son 41 MB y falta la aprobación del docente.

**Sobre el aviso de tiempo agotado:** `auditar_js.py` agotó los 180 s una vez en
la página de inicio y pasó a la segunda, con el equipo menos cargado. Si vuelve
a pasar, repetirlo antes de investigar.

### 13.7 El paso de importar el kit, reforzado

Importar el kit era una sola diapositiva de la Guía 0 y no nombraba la carpeta de
Drive donde está el archivo. Ahora son tres (diapositivas 7 a 9): conseguirlo
(carpeta `H) 21 y 22 de octubre`, guardarlo en `C:\Unity\Kit`, no
descomprimirlo), importarlo (con un esquema de la ventana de importación) y
probar que quedó, con el letrero verde. La versión web tiene los mismos tres
pasos, y la portada de la Guía 1 de cada equipo remite a esas diapositivas.

El esquema de la ventana de importación **no es una captura real**: se intentó
abrir el Editor con el diálogo para fotografiarlo, pero la ventana quedó detrás de
otra aplicación y la captura por coordenadas sacó lo que había encima (la pantalla
del docente). Se borró y no se repitió. Si se quiere una captura real, la tiene
que tomar una persona con la ventana de Unity al frente.

El importado en sí sí está comprobado: ambos paquetes se importaron en proyectos
nuevos de 2019.4.38f1 y compilaron sin errores (13.5).

### 13.8 El proyecto de Unity del docente, montado

Las carpetas cambiaron de lugar el 21 de octubre. Todo vive ahora en
`Proyectos repositorios Github/Videojuego - Motricidad y coordinación/`:

| Carpeta | Qué es |
|---|---|
| `Kit Unity Equipo 10/` | Lo mismo de antes: referencia, generadores, guías, paquetes. Sigue ignorada por git del portal |
| `Videojuego motricidad y coordinación/` | El proyecto de Unity del docente. **Es un repositorio propio**, enlazado a `profenapaipa/Videojuego-motricidad-y-coordinacin`, sin commits todavía |

**Lo que pasó al crearlo con Unity Hub:** el Hub lanzó Unity 2019.4.38f1 con la
plantilla 3D y falló la extracción de la plantilla: `Can not open output file: El
sistema no puede encontrar la ruta especificada`. La ruta tenía `Tecnología` y
`coordinación`. Quedó la carpeta con solo los archivos de git y un Editor con la
ventana "Error". Se cerró ese proceso y se creó el proyecto por línea de comandos
(`-createProject`, sin plantilla), que sí funciona en esa ruta: ya había
funcionado para la carpeta de referencia. Es el mismo origen del fallo de
WebGL (13.6): las rutas con tilde. La Guía 0 ahora lo advierte en el paso 2.

**Cómo quedó:** se importó `Solucion_Equipo10_SoloDocente.unitypackage` (kit y
escenas de los dos juegos), se activó el modo 2D, y se agregó
`Assets/Editor/MenuEquipo10.cs`. Los dos juegos tienen una escena llamada
`01_Menu`, así que no caben a la vez en Build Settings; el menú **Equipo 10**
prepara la lista para uno u otro. Trae además una verificación de scripts
perdidos en las escenas.

**Comprobado:** compila sin errores; los 152 archivos de `KitEquipo10` y `Solucion`
son idénticos (hash) a los de la referencia que pasó los bancos de pruebas
jugando; las 7 escenas se abren sin scripts perdidos. **No comprobado:** pulsar
Play en el Editor con ventana; lo hará el docente.

`publicar_guias.py` buscaba el portal contando dos niveles hacia arriba y dejó de
funcionar con la carpeta movida; ahora sube hasta encontrar `datos/guias.json`.

**El aviso de `auditar.py`** sobre el color `#C59BFF` en `sitio.css` línea 2062
es la auditoría leyendo un comentario del commit `779660e`, no un color en uso.
Las fallas son cero.

### 13.9 Versión 2 de los juegos: estabilidad, sincronización, pausa y menús

Petición del docente (21 de octubre): mejorar estabilidad, fluidez, sincronización
con la música, botón de pausa, menús y categorización fina, gruesa y coordinación.
Decisión de alcance: las mejoras internas y la pausa llegan a los kits de los
estudiantes; el menú de categorías vive solo en el proyecto del docente.

**Antes de tocar nada se midió** (jugador simulado en un ejecutable real, i5-12450H):

| Qué | Antes | Después |
|---|---|---|
| Irregularidad del avance de la canción por cuadro | 10,0 ms | 0,7 a 0,9 ms |
| Cuadros en que la canción no avanza | 67 % | 0 % |
| Cuadro más lento (60 s de ritmo) | 87 a 143 ms | 17,6 ms |
| Recolecciones de basura (60 s de ritmo) | 9 | 1 |

Salvedad sobre la última fila: el 9 mezclaba basura del propio jugador simulado,
que creaba listas y arreglos en cada cuadro. Se volvió libre de asignaciones y
entonces dio 1, pero no se midió el juego viejo con el jugador limpio, así que no
se puede atribuir esa mejora a la reserva de objetos. Lo cierto es el estado actual.

**Sincronización.** `AudioSettings.dspTime` avanza a saltos de un buffer de audio
(unos 20 ms) y se repetía en 2 de cada 3 cuadros; las notas se dibujaban con ese valor
y se veían a tirones. `Conductor` lleva ahora un reloj propio que avanza suave y se
corrige hacia `dspTime`. Se agregó compensación de latencia, que el jugador ajusta o
calibra con un metrónomo: con +80 ms la posición se atrasa 79,5 ms.

**Pausa.** `AudioListener.pause` detiene el reloj de audio (0,000 s en 1 s de pausa);
`Time.timeScale = 0` solo NO (1,003 s, la música sigue). Por eso la pausa usa las dos.
Pausar a mitad de la canción y reanudar no desfasa nada: 112 de 112 notas perfectas
al final. El botón es un sprite del mundo, porque con el mouse capturado los `Button`
del Canvas no responden. Se encontró y corrigió que se encimaba con el puntaje del
ritmo, y que la categoría quedaba guardada de la partida anterior.

**Menús.** Tres categorías con color propio (fina violeta, gruesa verde, coordinación
cian), récords por mano y por dificultad, ajustes que se guardan, dificultad Fácil,
Normal y Difícil, calibración, efectos de sonido originales y una pantalla final que
compara con la otra mano. Las maquetas están en `maquetas/`.

**Pruebas del jugador simulado:** 23 en el menú unificado, 17 en motricidad y 15 en
ritmo, todas en verde. La calibración con toques a 70 ms de retraso midió 74 ms.

**WebGL.** Las tres exportaciones (unificado, motricidad y ritmo) salieron sin errores,
con lo que también compila la parte del código de la pausa que solo existe en el
navegador. En Chrome, con clics y la tecla Escape REAL, el menú unificado recorrió:
menú principal, página de motricidad fina, Jugar Camino, Escape abre la pausa, Escape
otra vez da la cuenta atrás de 3 s, y el juego sigue con el botón de pausa de vuelta.
Sin excepciones propias del juego.

**No comprobado:** la pausa por pérdida de foco de la ventana y Escape en el ejecutable
de Windows (el banco las invoca por código); la captura del mouse en el navegador (ver
13.6); cómo suenan los efectos y las canciones. El esquema de las páginas de motricidad
y coordinación se juzgó en capturas, no con un jugador humano.

**El proyecto del docente** tenía el Editor abierto, así que no se importó el
paquete nuevo en él: se dejó el paquete listo y el docente lo importa. Sí se
actualizó `Assets/Editor/MenuEquipo10.cs`, que Unity recompila solo.

### 13.10 Proyecto listo para Play, repositorios y juego en la web

**Proyecto del docente.** Con el Editor ya cerrado se importó la versión 2 (217 archivos
idénticos al paquete, 11 escenas sin scripts perdidos) y se dejó listo para abrir y
pulsar Play. Un proyecto recién abierto muestra una escena vacía; `MenuEquipo10.cs` ahora
abre `00_Principal` sola, solo si no hay escena guardada y fuera de modo batch. Se comprobó
abriendo el Editor de verdad sin escena guardada: el registro dice "se abrió el menú
principal" y la barra de título muestra `00_Principal`. En 2019.4 la última escena se guarda en
`Library/LastSceneManagerSetup.txt` (no `.json`), y el Editor la restauró aunque se borrara el
archivo equivocado: conviene saberlo si se vuelve a probar. El Game view puede necesitar
"Free Aspect" si la ventana es pequeña.

**Tres repositorios, todos subidos.**
- Proyecto de Unity: `Videojuego-motricidad-y-coordinacin` (41 archivos de arte y música
  por Git LFS).
- Copia de seguridad del kit: `game_motricidad_coordinacion`, sin `Library`, builds ni logs.
  GitHub lo creó **público**; el contenido es original y no lleva nombres de estudiantes.
- Portal: este repositorio.

**Juego en la web.** El build unificado (21 MB, los tres juegos) está en
`docs/juegos/equipo-10/` y responde en la dirección de GitHub Pages. No se enlazó desde las
páginas de los equipos, porque eso pasa por `herramientas/generar.py`.

**Drive.** Las cuatro guías y los dos paquetes de las carpetas 10.1 y 10.2 son idénticos,
por suma de verificación, a los del kit y a los del portal.

## 14. El botón "Lo de hoy" era casi invisible, con dos causas distintas

Fecha: 21 de octubre de 2026. Pedido: "el botón de 'Lo de hoy' sigue estando
con fallas en el contraste, mejora eso como experto UX/UI para definir su
lugar, colores, tamaño, contraste, etc".

La auditoría estática de contraste (`contraste.py`) daba limpio porque compara
tokens de marca entre sí, en el papel. El problema real solo aparecía midiendo
el botón ya renderizado en el navegador, con la cascada completa de CSS
resuelta, y resultó tener dos causas independientes, encontradas una después
de la otra.

### 14.1 Primera causa: un choque de especificidad

El botón vivía dentro de `<nav class="mapa-vistas">`, la fila de las cinco
pestañas (Resumen, Módulos, La ruta, Desarrollo, El artículo). Esa fila tiene
la regla `.mapa-vistas a { color: var(--sobre-panel-suave) }`, con
especificidad 0-1-1 (clase más elemento). La regla propia del botón,
`.boton-hoy { color: var(--sobre-relleno) }`, tiene especificidad 0-1-0 (una
sola clase) y pierde el empate.

Medido antes de tocar nada: el texto no se pintaba blanco sobre el color de
la línea, se pintaba gris apagado (`#94A4C6`), el mismo de las pestañas sin
seleccionar.

**Arreglo:** el botón se movió de sitio. Ya no vive en la fila de pestañas,
que además se desplaza horizontalmente en pantallas angostas y podía dejarlo
fuera de vista; pasa a la fila de la migaja de pan, en un contenedor nuevo
`.mapa-cabecera` con `justify-content: space-between`, donde no compite con
esa regla y nunca depende de scroll para verse.

### 14.2 Segunda causa, más de fondo: el token equivocado

Con el botón ya movido, el fondo seguía midiendo el mismo azul pálido en
tema claro y en tema oscuro, lo cual no tiene sentido si el fondo sigue al
tema. La causa está en la sección 20 de `sitio.css`, "Acentos dentro del
panel oscuro": el mapa vive sobre un panel que es oscuro en los dos temas
del sitio, así que ahí dentro `--linea` se redefine para apuntar a la
variante `-panel` de cada color de línea, pensada para leerse como **texto**
sobre ese panel. Esa variante no cambia con el tema, a propósito: el panel
es oscuro siempre.

El botón usaba `background: var(--linea, ...)`, y por vivir dentro de
`.mapa` heredaba esa variante de texto, no el color vivo de relleno. Medido:

| Tema | Fondo real | Contraste con sobre-relleno |
|---|---|---|
| Claro | `#8FA8FF` (variante de texto, invariable) | 2.28 a 1, falla |
| Oscuro | `#8FA8FF` (el mismo valor) | 8.67 a 1, pasa por accidente |

En oscuro se leía bien de pura casualidad, porque `--sobre-relleno` sí se
oscurece con el tema y quedaba texto oscuro sobre ese mismo azul pálido. En
claro, blanco sobre un azul casi tan claro como el blanco: invisible.

**Arreglo:** el fondo deja de pasar por `--linea`. Usa el color de línea real
por separado, el mismo que `.tablero .celda` ya usa de forma directa en sus
bordes (`var(--linea-software)` y las demás), que sí invierte con el tema y
está pensado para ser fondo, no texto.

### 14.3 Contraste verificado en el navegador, no en la hoja de tokens

Con las dos causas resueltas, medido con `getComputedStyle()` sobre el
elemento real, las ocho combinaciones de línea técnica y tema:

| Línea | Claro | Oscuro |
|---|---|---|
| Software | 6.94 a 1 | 8.67 a 1 |
| Unity | 7.79 a 1 | 8.95 a 1 |
| Audiovisual | 6.62 a 1 | 8.25 a 1 |
| Electrónica | 6.68 a 1 | 8.56 a 1 |

Las ocho pasan AA (4.5 a 1) con margen; seis de ocho pasan AAA (7 a 1). El
estado activo, cuando ya se está viendo la página de hoy (`--sobre-panel`
sobre `--panel`), mide 16.9 a 1 en claro y 17.4 a 1 en oscuro.

### 14.4 Lugar, tamaño y color, decididos como UX/UI

- **Lugar:** fila de la migaja de pan, extremo derecho, siempre visible, sin
  depender de scroll horizontal.
- **Tamaño:** subió de 13.5px/padding 7×15 a 14.5px/padding 10×20, con un
  alto mínimo de 42px, el tamaño recomendado para tocar con el dedo.
- **Color:** se mantiene el color de la línea técnica del equipo como fondo,
  coherente con el resto del sitio, con `--sobre-relleno` como texto.
- **Estado activo:** se invierte (fondo claro, texto oscuro) cuando ya se
  está en la página de hoy, igual de sólido en el sentido contrario.
- **Foco de teclado:** contorno de 2px en `--sobre-relleno`, con
  `outline-offset`.

### 14.5 Una comprobación nueva, permanente, en `auditar_js.py`

`contraste.py` no podía ver este bug: compara tokens entre sí, nunca llegó a
medir el par que de verdad terminaba junto en pantalla. Se agregó a
`auditar_js.py` una función `__contrasteWCAG()` en JavaScript que calcula el
contraste real entre `getComputedStyle(boton).color` y
`.backgroundColor`, en una página por línea técnica (software, unity,
audiovisual, electrónica), y falla si alguna baja de 4.5 a 1.

Probada al revés: se reintrodujo a propósito el fondo viejo
(`var(--linea-en-panel, var(--cian-panel))`) en la línea de software, y la
auditoría lo marcó con el número exacto medido antes del arreglo (2.28 a 1),
sin tocar las otras tres líneas, que seguían midiendo bien. Restaurado el
arreglo, vuelve a pasar limpio.

Las cuatro auditorías del repositorio pasan limpias tras el cambio.

## 15. Revisión del 26 de octubre: lo que la búsqueda anterior no veía

Pedido de Néstor: revisar el historial de versiones de los documentos de la
semana, porque había cambios hechos dentro de los archivos que no se
detectaron, y agregar un panel de revisión con realimentación por equipo.

### 15.1 Por qué se escaparon cosas

Dos causas, las dos comprobadas:

1. **La fecha de modificación engaña en los archivos subidos.** Un archivo que
   se sube a Drive puede conservar como fecha de modificación la del original.
   Los bocetos de DiverSeña se subieron el 14 de octubre pero figuran como
   modificados semanas antes, así que una búsqueda por modificación los dejaba
   por fuera. La que los delata es la fecha de **creación**.
2. **El conector de Drive no lista el historial de versiones.** Los metadatos
   no traen la revisión actual ni quién modificó por última vez. La descarga sí
   acepta un identificador de revisión, pero sin la lista no hay cómo pedirlo.
   El sustituto: leer completo cada documento y compararlo con lo que el sitio
   registró en la revisión anterior.

Método de esta vez: archivos **creados** desde el 12 de octubre (105) más
documentos viejos **modificados** desde el 21 (8). Se descartaron las copias
del docente y los kits de Unity; quedaron 23 documentos de estudiantes, leídos
completos. Los repositorios no tuvieron commits desde el 21.

### 15.2 Lo que cambió

- **Equipo 6:** los bocetos (`subcarpetas/04_Desarrollo/2026-10-14_bocetos.jpg.png`).
  Se descargó la imagen y se revisó: tres viñetas, con la pantalla de inicio,
  cómo la cámara reconoce la mano y el caso de error.
- **Equipo 2.1:** artículo nuevo, con título, autores, problema, antecedentes y
  pregunta. La propuesta se editó, pero sigue sin las cinco preguntas.
- **Equipo 10.1:** propuesta y acuerdos, los dos completos y editados el 26.
  Cierran el nivel 1.
- **Equipo 11.2:** propuesta completa (cierra el nivel 1), las cinco casillas
  de su sección marcadas (primer equipo en hacerlo) y versiones v2 y v3 del
  artículo.

### 15.3 Las referencias, comprobadas una por una

El 11.2 hizo un esfuerzo real por corregir sus referencias, pero quedaron tres
listas distintas en tres documentos:

| Documento | Resultado |
|---|---|
| Artículo v3 | Inventada: tres DOI no existen y el cuarto lleva a otro artículo (Lee y Park, 2021) |
| Sección 5 aparte y matriz de antecedentes | Gonzalez, Minchala y Langer (2025) **confirmada** en Crossref |
| La misma, fuente de Popayán | El PDF existe, pero es otro trabajo: Muelas Aranda (2023), sobre modelado en arcilla |
| La misma, fuente de Manizales | No se pudo comprobar: el servidor bloquea robots |
| La misma, MEN 2020 y Unesco 2021 | Sin enlace, no verificables |

Por eso `ante` y las secciones 1.2 y 5.2 siguen sin marcarse.

### 15.4 Criterio de chequeo

Una tarea o sección cuenta cuando tiene contenido propio del equipo que
responde lo pedido. Lo que le falte de calidad va a la realimentación, no al
chequeo. La excepción es lo inventado.

### 15.5 Panel "Revisión del docente"

En la página "Lo de hoy" de cada equipo, arriba: lo que se revisó, el
veredicto (quedó bien, hay que ajustar o pendiente, con color, símbolo y
palabra a la vez) y una línea de lo que sigue. El texto sale del campo
`revision` de cada equipo en `semillero.json`: es una lectura humana, no un
cálculo, y si falta no se rellena con frases genéricas. Las 16 escritas.

De paso: cuando aparecía "Lo primero de hoy", la lista de tareas del nivel
salía dos veces en la misma página. Ahora sale una vez. Comprobado contra la
versión anterior, donde la medición sí encuentra la fila repetida.

### 15.6 Pendiente que no es de esta sesión

`auditar.py` marca seis fallas en `docs/juegos/equipo-10/index.html`, el
borrador en WebGL que publicó la sesión de Unity (commit `71cf3ae`). Es una
plantilla de Unity que no usa las hojas del sitio. Conviene excluir
`docs/juegos/` de las reglas de página o completar su cabecera. No se tocó.


## 16. Segunda etapa: una tarea por pestaña

Néstor pidió bajar la saturación del sitio: que la información no se repita
entre pestañas y que el material, la ruta, lo pendiente y lo publicado se
encuentren fácil. Antes de tocar nada se midió (equipos 11.2 y 1, las seis
vistas de cada uno) y él escogió entre opciones concretas.

### 16.1 Lo que se midió antes

- 137 frases idénticas en las seis vistas, unas 350 palabras que se leían
  seis veces: casi todas del panel derecho y del índice izquierdo.
- El nivel actual aparecía en 14 lugares; "lo que sigue", en 9; una misma
  tarea pendiente, en 9; los puntos del equipo, en 6.
- En Resumen, Desarrollo y Artículo la columna central era apenas el 53 a
  60 % de las palabras de la página.
- Las cinco vistas previas en vivo del portal lo dejaban más de 120 s
  cargando.

### 16.2 Lo que se decidió y cómo quedó

| Decisión | Implementación |
|---|---|
| Quitar el panel derecho | Fuera `panel_derecho()`. La rejilla `.con-lateral` pasa a dos columnas. Puntos y avance por frente viven una sola vez, en Resumen. |
| Panel izquierdo = índice de la página | `con_indice()` arma el índice después de generar la página, leyendo sus `<h2>` y los módulos marcados con `data-indice`; así nunca se desincroniza. `sitio.js` marca la sección a la vista. |
| Resumen responde "cómo vamos" | Puntos, avance por frente (cada barra enlaza a su vista), revisión del docente con botón "Ver qué hacer hoy", y publicación. Fuera: nivel actual, "lo que sigue", las tarjetas de las vistas, el camino en zigzag (ocupaba ~900 px para decir lo que ya dicen los siete puntos de la barra fija) y "Esta semana". |
| Lo de hoy responde "qué hacer" | Solo tareas. Cada pendiente trae su cómo y, debajo, la guía que la resuelve (`guias_de_tarea()`: hitos de `guias.json` más `GUIAS_TAREA` para antecedentes y artículo). Fuera la rejilla de guías y la revisión, que pasó a Resumen con un enlace. Si "Lo primero de hoy" ya lista las tareas del nivel, no se pinta la caja del nivel. |
| Módulos por equipo, plegados | Cada sesión es un `<details>`: la cabecera es el `<summary>` con letra, título, objetivo en una línea y avance. Solo la sesión donde va el equipo viene abierta, con la marca "vas aquí". Un enlace a `#mod-X` abre el módulo, y el carrusel se recalcula al abrir cualquiera de los `<details>` que lo contienen. |
| Captura fija y botón | `docs/assets/capturas/<equipo>.webp`, 960×600, de 7 a 32 KB. Tomadas con Chrome sin ventana el 26 de octubre. |

Además: "De dónde sale este estado" queda solo en La ruta (estaba en cuatro
vistas), y los rótulos "Vista 2 de 5", "Vista 1 de 3"... se cambiaron por
lo que es cada vista, porque ya no cuadraban con las seis pestañas.

### 16.3 Un error viejo que apareció de paso

El resaltado del índice del portal buscaba `id="indice-portal"`, pero ese id
lo tenía un `<span>` vacío y no el `<nav>`: nunca encontró un enlace que
marcar. Ahora el índice se marca con `data-indice`, en el portal y en las
páginas de equipo.

### 16.4 Lo que se midió después

Mismos equipos, misma herramienta:

| | Antes | Después |
|---|---|---|
| Frases idénticas en las seis vistas | 137 (~350 palabras) | 87 (213 palabras: barra fija y pie) |
| "Lo que sigue" | 9 lugares | 2 |
| Una misma tarea pendiente | 9 lugares | 2 (La ruta y Lo de hoy) |
| Puntos del equipo | 6 lugares | 1 |
| Columna central en Resumen | 53 % | 41 a 51 %, sobre la mitad de palabras |

Las cuatro auditorías pasan igual que antes; las únicas fallas siguen siendo
las seis de `docs/juegos/equipo-10/index.html` (15.6).

### 16.5 Pendiente

La web de la iguana (equipo 1) no terminó de cargar en Chrome sin ventana
en tres intentos, así que no tiene captura: su tarjeta muestra el botón
"Abrir" sin imagen. Para agregarla basta guardar
`docs/assets/capturas/equipo-1.webp` (960×600) y regenerar.
