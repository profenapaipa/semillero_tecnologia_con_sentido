# Semillero Maker de Tecnología con Sentido

Sitio de seguimiento y divulgación del **Semillero Maker de Tecnología con Sentido**,
espacio extracurricular dirigido por Néstor Andrés Paipa Castro en el Instituto
Infantil y Juvenil, Bogotá. Semestre 2026-II.

Catorce subequipos de 9°, 10° y 11° recorren las fases del Design Thinking anidadas
con el método científico, hasta llegar a un artículo de desarrollo tecnológico.
Este sitio le muestra a cada equipo el estado real de su proceso.

- **Sitio:** <https://profenapaipa.github.io/semillero_tecnologia_con_sentido/>
- **El encargo:** [BRIEF.md](BRIEF.md)
- **Decisiones de arquitectura:** [BITACORA_TECNICA.md](BITACORA_TECNICA.md)

## Los proyectos de los equipos

Cada subequipo que tiene repositorio propio queda enlazado desde su página, con
acceso directo a su versión publicada cuando existe.

| Equipo | Proyecto | Repositorio | Publicado |
|---|---|---|---|
| 1 | La web de la iguana | [lawebdelaiguana](https://github.com/profenapaipa/lawebdelaiguana) | [en línea](https://profenapaipa.github.io/lawebdelaiguana/) |
| 3 | App de planeación inclusiva | [planeacion-inclusiva-piar](https://github.com/profenapaipa/planeacion-inclusiva-piar) | no, repositorio privado y necesita base de datos |
| 5 | English Roulette | [englishroulette](https://github.com/profenapaipa/englishroulette) | no aplica, es aplicación de escritorio |
| 6 | Diverseña | [diversena](https://github.com/profenapaipa/diversena) | no, repositorio privado |
| 7 | Wisfox | todavía sin repositorio | no |

---

## Qué hay en cada carpeta

| Carpeta | Qué contiene | ¿Se publica? |
|---|---|---|
| `docs/` | **El sitio web.** Portal, catorce páginas de equipo y las hojas de estilo. | ✅ Sí |
| `datos/` | `semillero.json`, el estado de los catorce subequipos. La fuente de verdad. | ❌ No |
| `herramientas/` | `generar.py`, que convierte los datos en las páginas. | ❌ No |

`docs/` se llama así porque **GitHub lo exige** para publicar desde una subcarpeta.

Que `datos/` quede fuera de `docs/` no es un detalle: el archivo de datos trae las
rutas internas de Drive y las notas de revisión de cada equipo, y eso no tiene por
qué quedar servido en internet.

---

## Las tres vistas de cada proyecto

Cada página de equipo trae tres vistas, una debajo de la otra:

1. **Ruta del Design Thinking.** Las siete fases como una línea de estaciones, con
   su paso del método científico.
2. **Desarrollo tecnológico.** Los hitos técnicos concretos, **cada uno con la fase
   a la que pertenece**. Son distintos por línea: Unity, desarrollo de software,
   electrónica y producción audiovisual.
3. **Documentación del artículo.** Las quince secciones del formato
   `Articulo_base.docx`, con **qué dato concreto hace falta** para escribir cada una.

Debajo va el checklist de la semana, que se arma solo a partir del estado.

---

## La regla de los dos niveles

Esto es lo que hace que el sitio no mienta.

- **Tarea individual:** binaria. Hecha o no hecha.
- **Fase o entregable completo:** semáforo de tres colores, calculado contando las
  tareas del grupo.

| Color | Significa |
|---|---|
| 🟢 Verde | Todas las tareas del grupo están completas |
| 🟡 Amarillo | Algunas completas, otras no |
| ⚪ Gris | Ninguna todavía |

El cálculo corre solo: nadie aprueba nodo por nodo. El color nunca va solo, siempre
lleva además una forma o un glifo, para que se lea sin depender de distinguir colores.

---

## Cómo se actualiza el estado cada semana

**No se toca ningún archivo HTML.** Se edita el archivo de datos y se vuelve a generar.

1. Revisar la carpeta de Drive montada en local y actualizar
   `datos/semillero.json`: cada tarea es `[true o false, "la evidencia"]`.
2. Correr el generador:

   ```
   python herramientas/generar.py
   ```

3. Comitear y hacer push. GitHub Pages publica solo.

El generador reescribe las quince páginas desde cero cada vez, así que se puede
correr tantas veces como haga falta.

### Marcar una tarea como cumplida

En `datos/semillero.json`, dentro del equipo, en `estado`:

```json
"u4": [true, "Escena Juego.unity con el objetivo apareciendo y el clic detectado"]
```

El primer valor es si está hecha. El segundo es la evidencia que lo demuestra, y
sale impresa en la página debajo de la tarea. Si no hay evidencia que citar, la
tarea no está hecha.

### Agregar un tutorial a un hito

En `datos/semillero.json`, dentro de `lineas`, en el hito que corresponda:

```json
"recursos": [ { "titulo": "Cómo detectar el clic sobre un objetivo", "url": "https://..." } ]
```

Y cuando un tutorial todavía no existe, en vez de inventar un enlace se deja dicho
qué tendría que explicar:

```json
"porGrabar": "Cómo hacer que un objetivo aparezca en una posición al azar."
```

Eso sale en la página como **tutorial pendiente de grabar por el profe**, para que
el estudiante sepa que viene y el docente sepa exactamente qué grabar.

---

## Publicar en internet

En GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / carpeta `/docs`**.

⚠️ **Con cuenta gratuita, GitHub Pages solo funciona en repositorios públicos.**
Por eso en `docs/` no entra ningún dato de contacto de los estudiantes.

---

## Espacios hermanos

Tres espacios con nombre propio, distintos entre sí:

- **Semillero Maker de Tecnología con Sentido**, este.
- **Filosofartec**, proyecto transversal del colegio donde se unen Filosofía, Artes
  y Tecnología. La edición 2026 es la Odisea.
- **Un Café con la Iguana**, canal de divulgación digital creado por estudiantes.
  Su sitio lo construye el Equipo 1 y está publicado en
  <https://profenapaipa.github.io/lawebdelaiguana/>.
