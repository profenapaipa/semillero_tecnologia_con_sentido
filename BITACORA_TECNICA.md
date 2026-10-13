# Bitácora técnica

Documento interno del proyecto. **No se publica en el sitio ni se enlaza desde él.**
Aquí quedan las decisiones de arquitectura, las limitaciones encontradas y lo que
queda pendiente, para poder retomar el trabajo sin releer toda la conversación.

Autor: Néstor Andrés Paipa Castro · Semillero Maker de Tecnología con Sentido
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
