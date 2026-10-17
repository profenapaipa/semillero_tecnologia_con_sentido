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

Ese repositorio **es el proyecto del Equipo 1** (Gabriel Giraldo y Samuel Gómez),
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
| 3 · Camila y Santiago | `profenapaipa/planeacion-inclusiva-piar` | privado | `D:\Escritorio old\App para planeación de inclusión - Camila y Santiago` |
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
  figuraba como "Proyecto de Matías, Jacobo y Danna", y los nombres completos
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

- **Equipo 2.1.** Formato 2 firmado por Sara Valeria Ordoñez Vargas y Deivyd
  Steban Vega López, que además nombra a una tercera integrante que el sitio no
  tenía: Lucía Salgado. Acuerdos hechos.
- **Equipo 4.** Formato 2 completo, con los dos nombres y el frente del que
  responde cada uno. Acuerdos hechos.
- **Equipo 11.2.** Formato 1 y Formato 2 llenos el 14 de octubre, los dos muy
  completos. De ahí salen los nombres: Karla Atalito y Pammela Marín.

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

- **Equipo 9.** Jacobo Rodríguez subió el 16 de octubre una carpeta
  *Antecedentes* con dos fuentes en PDF sobre protección animal, que es
  justamente el tema de *Animación de abandono*. Una de las dos está subida dos
  veces. La tarea `ante` pasa a hecha.

El avance del semillero queda en 33%.

### 9.5 Hallazgo sin cargar: una carpeta de Equipo 13

El 16 de octubre se creó en Drive la carpeta **Equipo 13_Desarrollo_IA_Valeria**,
al mismo nivel que las de los demás equipos. Dentro solo hay un acceso directo,
"AI códigos:", sin documentos ni tareas.

No se agregó al sitio. Crear un subequipo número dieciséis cambia la cifra de
la portada y la estructura entera a partir de una carpeta vacía, y esa es una
decisión de Néstor, no una medición.
