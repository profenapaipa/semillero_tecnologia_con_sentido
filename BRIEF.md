# Brief de cliente · Sitio del Semillero Maker de Tecnología con Sentido

Documento de encargo. De aquí sale la construcción del sitio, y a él se vuelve
cuando haya que decidir algo de diseño. Si una decisión no está en este brief, no
está decidida.

**Cliente:** Néstor Andrés Paipa
**Proyecto:** sitio de seguimiento y divulgación del Semillero Maker de Tecnología con Sentido
**Fecha del brief:** 13 de octubre de 2026
**Fecha de publicación comprometida:** 14 de octubre de 2026

---

## 1. Quién es el cliente y de quién es esto

El Semillero Maker de Tecnología con Sentido es un espacio extracurricular
concebido, dirigido y documentado por Néstor Andrés Paipa, docente de
tecnología e informática en Bogotá.

**El semillero es suyo, no es un producto del colegio.** La institución donde trabaja presta el
espacio y los estudiantes; la propiedad intelectual del proceso, del nombre y de
la metodología es personal.

Consecuencia directa para el sitio: no lleva marca ni crédito de ninguna institución.
Ni como emisor ni como contexto: el semillero es de Néstor. El pie va a nombre de Néstor y del
semillero.

**Ningún contenido visible se atribuye a una inteligencia artificial.** Ni en
nombres de página, ni en pies, ni en descripciones, ni en un "acerca de".

## 2. A quién le habla el sitio

Dos audiencias, en este orden de prioridad:

1. **Los estudiantes de 9°, 10° y 11° que están en el semillero.** Catorce
   subequipos. Entran a ver la realimentación de su propio proceso: qué llevan,
   qué les falta y qué sigue. Entran desde la sala de cómputo y desde el celular.
   Son la audiencia que manda en las decisiones de diseño.
2. **Quien quiera conocer el semillero desde afuera:** colegas, familias, otros
   docentes. Esta audiencia crece en la fase 2 y por ahora solo necesita entender
   qué es el semillero y ver los proyectos.

El sitio no le habla a un evaluador institucional.

## 3. Qué problema resuelve

La documentación entre equipos es muy desigual, y el docente no tiene cómo ver el
estado de los catorce subequipos sin abrir carpeta por carpeta.

El diagnóstico del 13 de octubre lo confirmó con números: de catorce subequipos,
solo uno escribió de verdad en el artículo, ninguno ha marcado una sola casilla de
la hoja de barreras, y siete tienen la propuesta en blanco. Al mismo tiempo, cinco
equipos tienen software real construido, y uno lo tiene publicado en internet.

**El desfase no es de avance, es de registro.** El sitio existe para cerrar ese
desfase: le muestra a cada equipo lo que ya construyó, que a veces es más de lo
que cree, y lo que le falta documentar, que casi siempre es más de lo que cree.

## 4. Qué tiene que hacer el sitio

### 4.1 Tres vistas por proyecto, obligatorias

Cada uno de los catorce subequipos tiene su página, y esa página trae tres vistas:

1. **Vista general del Design Thinking.** Las siete fases como una ruta, con su
   paso del método científico. Es el mapa de todo el semestre, de un vistazo.
2. **Vista del desarrollo tecnológico.** Los hitos técnicos concretos del
   proyecto, **entrelazados con las fases del Design Thinking**: cada hito dice a
   qué fase pertenece. Es distinta por línea técnica, porque un hito de Unity no
   se parece a un hito de electrónica.
3. **Vista de la documentación del artículo.** Las secciones del artículo una por
   una: qué está diligenciado, qué falta y, sobre todo, **qué datos concretos hace
   falta conseguir para poder escribir cada sección**. No basta decir "falta la
   sección 3.1"; hay que decir qué dato falta para llenarla.

Las tres vistas van en la misma página, una debajo de la otra, con navegación
interna. No en tres páginas distintas: el estudiante tiene que poder recorrer su
proceso completo sin perderse.

### 4.2 Regla visual de los dos niveles

Esta regla es del cliente y no se negocia.

- **Nivel de tarea individual:** binario. Hecha o no hecha. Son tareas bien
  definidas, no tienen estado intermedio.
- **Nivel de fase o de entregable completo:** semáforo de tres colores, calculado
  solo a partir de cuántas tareas del grupo están completas.
  - **Gris:** ninguna tarea del grupo está completa.
  - **Amarillo:** algunas completas, otras no.
  - **Verde:** todas completas.

El cálculo corre solo. El docente no aprueba nodo por nodo. Lo único manual es
**cuándo** se corre la revisión: la dispara el docente, no un cron ni un workflow.

**El color nunca va solo.** Cada estado lleva además una forma o un glifo, para
que se lea sin depender de distinguir colores.

### 4.3 Más detalle a pedido

El estudiante que quiera más tiene que encontrar más: orientación de qué hacer,
recursos y tutoriales para el objetivo de ese hito.

**Cuando no exista en la web un tutorial que sirva**, el sitio no se queda callado
ni inventa un enlace: deja el campo marcado como **tutorial pendiente de grabar
por el docente**, diciendo con precisión qué tendría que explicar ese tutorial.
Así el docente sabe exactamente qué grabar, y el estudiante sabe que viene.

Esto es prioritario para Unity. El tutorial de diseño de interfaz ya se entregó;
faltan los de las dinámicas de juego, y son el bloqueo de los tres equipos más
atrasados.

### 4.4 Espacio para los proyectos hermanos

**Filosofartec** y **Un Café con la Iguana** son dos espacios con nombre propio,
distintos del semillero y distintos entre sí. Tienen su lugar en el sitio, y
desde ahí se enlaza la página que ya está publicada.

Nunca se reducen a "el semillero y sus proyectos relacionados". Se nombran los
tres: Semillero Maker de Tecnología con Sentido, Filosofartec y Un Café con la
Iguana.

## 5. Dirección de diseño

### 5.1 De dónde se parte

La página de Un café con la iguana ya está publicada y tiene manual de marca
propio. El sitio del semillero **se armoniza con ella, sin ser la misma**: se
tienen que ver como dos publicaciones de la misma casa, no como la misma página
con otro título.

Qué se hereda, para que armonicen:

- Los colores de identidad: **verde** `#2E8150`, **teal** `#257680`, **ámbar**
  `#F5B016` y **marino** `#273C66`.
- La tipografía de texto corrido: **Montserrat**.
- La idea de que el color vive en un solo archivo y las demás hojas usan variables.

Qué cambia, para que no sea idéntica:

- **El papel.** La iguana trabaja sobre crema y hueso, cálidos. El semillero
  trabaja sobre un papel frío, gris azulado, de cuaderno técnico. Es el cambio
  más visible y el que separa las dos publicaciones de un golpe.
- **La tipografía de títulos.** La iguana usa Anton, condensada y de cartel. El
  semillero usa **Archivo** en peso alto: misma familia de grotescas robustas,
  pero más ancha y más seria.
- **Un tercer registro que la iguana no tiene:** monoespaciada, **IBM Plex Mono**,
  para nombres de archivo, rutas, versiones, commits y conteos. El semillero habla
  de archivos reales, y los archivos se escriben en mono.
- **La forma.** La iguana usa esquinas de 14px y sombra dura negra de 4px, que es
  su firma de cartel. El semillero usa esquinas de 8px, sin sombra dura, y marca
  jerarquía con filetes de 1px y una barra de color a la izquierda de las
  tarjetas. Más de taller y de ficha técnica, menos de afiche.

### 5.2 Carácter

Cuaderno de taller, no afiche de evento. El sitio es un instrumento de trabajo
que se consulta en mitad de una sesión, con el proyecto abierto al lado. Se lee
rápido, dice la verdad y no celebra lo que no está.

El ámbar y el verde ya son los colores del semáforo, así que no se usan de
adorno en ningún otro lado. El teal es el color de lo que se puede tocar:
enlaces, botones, navegación activa.

### 5.3 Tono de la escritura

Español académico colombiano. Tuteo cuando se le habla al estudiante. Sin guion
largo como paréntesis: comas, punto y coma o dos puntos. Sin calcos del inglés.
Sin vocabulario que suene a texto generado.

Lo que no funciona se dice, no se esconde. Un equipo con el artículo en blanco lee
"el artículo está en blanco", no "el artículo está en proceso".

---

## 5.bis Marco del ambiente de aprendizaje

El sitio no es un tablero de anuncios con buena tipografía: es un **ambiente
virtual de aprendizaje**, y está modelado como tal. Estas son las referencias de
las que salen sus decisiones de estructura, no de adorno.

### Los cuatro componentes

Modelar un ambiente de aprendizaje, presencial o virtual, significa modelar
cuatro componentes y las relaciones entre ellos: **pedagógico, cognitivo,
comunicativo y tecnológico** (Universidad Pedagógica Nacional, *Modelamiento
pedagógico de Ambientes Virtuales de Aprendizaje*, revista Tecné, Episteme y
Didaxis n.º 44, 2018). Así se reparten aquí:

| Componente | Dónde está en el sitio |
|---|---|
| **Pedagógico** | Las siete fases del Design Thinking anidadas con el método científico. Son las paradas del camino y el orden en que se aprende. |
| **Cognitivo** | Tarea binaria, fase con semáforo, evidencia citada debajo. El estudiante sabe en todo momento qué sabe hacer y qué no. |
| **Comunicativo** | La hoja de barreras, los tutoriales que se le piden al docente y el artículo. El ambiente es una conversación, no un anuncio. |
| **Tecnológico** | Drive, GitHub y el generador. La herramienta se nombra, no se esconde: eso también se aprende. |

Esa misma línea describe el aula virtual como un **sistema interactivo de
transacciones comunicativas** donde las **e-actividades son el núcleo
estructural** del diseño. Por eso el centro de cada módulo no es el contenido
sino **lo que se pidió hacer esa semana**, y el contenido va alrededor.

### Los nueve eventos de la instrucción

Cada módulo sigue la secuencia de Gagné, y **el rótulo va impreso en la página**
junto a cada parte, para que el estudiante sepa qué está haciendo y el docente
vea que la secuencia está completa:

| Evento | Dónde |
|---|---|
| 2 · Informar el objetivo | El recuadro que abre el módulo, sacado de la primera diapositiva de la sesión |
| 4 · Presentar el contenido | El carrusel de diapositivas |
| 5 · Guiar el aprendizaje | La orientación de cada hito y los recursos externos |
| 6 · Provocar la ejecución | Lo que se pidió esa semana |
| 7 · Dar realimentación | El estado de cada tarea, con el archivo que lo demuestra |
| 8 · Evaluar el desempeño | El semáforo y los puntos |
| 9 · Retener y transferir | El artículo, donde todo se escribe |

Gagné admite que el orden se puede alterar y que no todos los eventos tienen que
estar en cada lección. Aquí se usan los que la sesión realmente ejecuta.

### Carga cognitiva y multimedia

De los principios de aprendizaje multimedia de Mayer, construidos sobre tres
supuestos (procesamiento activo, doble canal y **capacidad limitada**), el sitio
aplica tres de forma deliberada:

- **Segmentación.** Una sesión, un módulo. Nunca se muestra el semestre entero
  de golpe.
- **Señalización.** Los rótulos de evento, el semáforo y el color por línea
  marcan qué es cada cosa. Procesar la página cuesta menos y queda cabeza para
  el contenido.
- **Coherencia.** A cada equipo se le muestran solo las diapositivas de su línea
  más las que eran para todos, como indica la propia sesión. Lo que no le sirve,
  no se le pone enfrente.

### Cultura maker y tecnología con sentido

El semillero construye para aprender, no aprende para después construir. Por eso
el sitio mide **evidencia de lo construido**, no asistencia ni intención, y por
eso una tarea sin archivo que la respalde no está hecha. La herramienta se nombra
con su versión exacta, y lo que no funciona se dice: un ambiente que esconde sus
límites no enseña a pensar la técnica, solo a usarla.

## 6. Restricciones técnicas

- **GitHub Pages solo sirve archivos estáticos.** No hay backend. Las páginas se
  generan antes de publicar, no en el navegador del estudiante.
- **La revisión la dispara el docente** desde su computador, leyendo la carpeta de
  Drive montada en local. Opción A. Sin cron ni GitHub Actions por ahora.
- **Las páginas se generan, no se escriben a mano.** Catorce subequipos por tres
  vistas es demasiado para mantener a mano. Un archivo de datos con el estado, un
  generador, y las páginas salen solas. Cambiar el estado de un equipo es editar
  el archivo de datos y volver a generar.
- **`docs/` es lo único que se publica.** El artículo, los antecedentes y
  cualquier dato de los estudiantes quedan fuera de `docs/`, porque aunque el
  repositorio sea público el sitio publicado también lo es.
- **El sitio tiene que funcionar en celular** y en los computadores de la sala.
  Sin depender de JavaScript para leer el contenido: el detalle a pedido se hace
  con HTML nativo.
- **Con cuenta gratuita, GitHub Pages solo publica repositorios públicos.** El
  repositorio del portal arranca público, y por eso ningún dato personal de
  estudiante entra en `docs/`.

## 7. Qué entra en la fase 1 y qué no

**Entra ahora, para el 14 de octubre:**

- El portal con los catorce subequipos y el estado agregado del semillero.
- Las catorce páginas de proyecto con las tres vistas.
- El espacio de Filosofartec y Un Café con la Iguana, con enlace a lo publicado.
- Los recursos y tutoriales por hito, con los campos de tutorial pendiente
  marcados, empezando por las dinámicas de Unity.
- El generador y el archivo de datos, para poder repetir la revisión cada semana.

**No entra ahora:**

- Cuenta de servicio de Google y workflow de GitHub Actions. Es la Opción B y
  queda planeada en la bitácora técnica.
- Publicación en GitHub Pages de los proyectos de los estudiantes que todavía no
  tienen repositorio. Se enlazan cuando lo tengan.
- Foro, cuentas de estudiante, insignias. No son de este encargo.

## 8. Cómo se mide que el encargo quedó bien

1. El 14 de octubre, cada uno de los catorce subequipos puede entrar a una
   dirección y ver su estado real, no una maqueta.
2. Un estudiante de 9° entiende, sin que nadie le explique, qué le falta y qué
   sigue.
3. Los tres equipos de Unity encuentran dicho con precisión qué dinámica les
   falta y qué tutorial viene.
4. El docente puede repetir la revisión la semana siguiente corriendo dos
   comandos, sin volver a escribir una página a mano.
