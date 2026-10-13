# Cómo publicar un proyecto del semillero

Guía para dejar el proyecto de un equipo abierto en internet y enlazado desde el
portal del semillero.

No todos los proyectos se publican igual, y algunos no se publican como sitio: eso
no es un defecto, es la naturaleza de cada línea. Busca abajo el caso que
corresponda.

---

## Lo primero, siempre: el repositorio tiene que ser público

**Con cuenta gratuita, GitHub Pages solo funciona en repositorios públicos.**

En el repositorio: **Settings → abajo del todo, Danger Zone → Change repository
visibility → Make public**.

### Antes de hacerlo público, revisa tres cosas

Hacer público un repositorio hace público **todo su historial**, no solo lo que
tiene hoy. Un archivo borrado hace un mes sigue estando en los commits viejos.

1. **Datos de estudiantes.** Listados, notas, diagnósticos, correos. Si hay datos
   reales de menores, no se publica: primero se reemplazan por datos ficticios y
   se limpia el historial, o se deja privado.
2. **Claves y contraseñas.** Archivos `.env`, llaves de Firebase, tokens. Si
   alguna vez se comiteó una clave, hay que rotarla, no basta con borrarla.
3. **Material con derechos de terceros.** Música, imágenes o video que no sean del
   equipo.

Si algo de esto aparece, páralo y pregúntale al profe antes de seguir.

> **Alternativa sin hacerlo público:** GitHub Education le da GitHub Pro sin costo
> a los docentes verificados, en <https://education.github.com/teachers>. Con Pro,
> Pages funciona también en repositorios privados.

---

## Caso 1 · Sitio web de archivos estáticos

**Quién:** Equipo 1, La web de la iguana. Ya está publicado, es el modelo a seguir.

Sirve para cualquier proyecto de HTML, CSS y JavaScript que no necesite servidor.

1. Mete todo lo que se publica en una carpeta llamada **`docs/`**. Tiene que
   llamarse así: GitHub solo deja publicar desde la raíz o desde `docs/`.
2. Lo que **no** se publica, como el artículo, los antecedentes o las evidencias,
   va fuera de `docs/`. Aunque el repositorio sea público, no todo tiene que quedar
   servido en internet.
3. Commit y push.
4. **Settings → Pages → Source: Deploy from a branch → `main` / carpeta `/docs`
   → Save.**
5. Espera un minuto y recarga. La dirección queda así:

   ```
   https://profenapaipa.github.io/NOMBRE-DEL-REPOSITORIO/
   ```

### Si la página sale en blanco o sin estilos

Casi siempre es una ruta que empieza por `/`. En una página de proyecto el sitio
no vive en la raíz del dominio sino en `/nombre-del-repositorio/`, así que:

```html
<!-- mal: busca en la raíz del dominio y no lo encuentra -->
<link rel="stylesheet" href="/assets/css/estilos.css">

<!-- bien: busca al lado del archivo -->
<link rel="stylesheet" href="assets/css/estilos.css">
```

Lo mismo con las imágenes y los `fetch`.

---

## Caso 2 · Proyecto con Vite, React o similar

**Quién:** Equipo 6, Diverseña.

Estos proyectos no se publican tal cual: primero hay que **compilarlos**, y lo que
se publica es el resultado de esa compilación.

1. **Revisa el `base` en `vite.config.ts`.** Tiene que ser el nombre del
   repositorio, entre barras. Diverseña ya lo tiene bien:

   ```ts
   export default defineConfig({
     base: '/diversena/',
     plugins: [react()],
   })
   ```

   Si ese `base` está mal, la página carga en blanco y la consola muestra errores
   404 de los archivos `.js`. Es el error número uno de este caso.

2. **Compila:**

   ```
   npm install
   npm run build
   ```

   Eso crea la carpeta `dist/`.

3. **Copia `dist/` a `docs/`** y comitea `docs/`. Revisa que `docs/` no esté en el
   `.gitignore`, porque muchos proyectos ignoran `dist/` y a veces arrastra.

   ```
   git add -f docs
   git commit -m "Publica la version compilada"
   git push
   ```

4. **Settings → Pages → `main` / carpeta `/docs`.**

> Cada vez que cambien el código hay que volver a compilar y volver a copiar. Es
> el precio de no usar GitHub Actions todavía.

---

## Caso 3 · Aplicación de escritorio

**Quién:** Equipo 5, English Roulette.

Un programa de Python con ventanas **no se puede publicar en GitHub Pages**: Pages
solo sirve archivos, no ejecuta programas. Eso no es un atraso del equipo, es que
el entregable es otro.

Lo que sí se hace, y cuenta igual como publicación:

1. **Una página de presentación.** Una carpeta `docs/` con un `index.html` que
   explique qué es el proyecto, con capturas de pantalla y el enlace de descarga.
   Esa página sí se publica con el Caso 1.
2. **Una entrega descargable.** En el repositorio: **Releases → Create a new
   release**, se le pone una versión como `v1.0`, y se adjunta el ejecutable o un
   `.zip` con el proyecto y su `COMO_EJECUTAR.md`.

Para el artículo, en la sección 3.2, hay que decir con qué versión exacta de
Python se construyó.

---

## Caso 4 · Aplicación con base de datos

**Quién:** Equipo 3, App de planeación inclusiva.

Una aplicación de Next.js con base de datos **no funciona en GitHub Pages**,
porque necesita un servidor corriendo todo el tiempo y Pages no corre nada.

Opciones, en orden de esfuerzo:

1. **Documentarla en el portal y no publicarla.** Capturas, video de dos minutos
   mostrándola funcionar, y el código en GitHub. Para un artículo de desarrollo
   tecnológico esto alcanza perfectamente: lo que se documenta es el desarrollo.
2. **Publicar solo una página de presentación**, como en el Caso 3.
3. **Desplegarla en un servicio que sí corra Node.** Sale del alcance de este
   semestre y necesita cuentas nuevas.

Para octubre, la opción 1 es la sensata.

---

## Caso 5 · Juego de Unity

**Quién:** Equipos 10.1 y 10.2.

Un juego de Unity sí se puede publicar, exportándolo como **WebGL**.

1. **File → Build Settings → Platform: WebGL → Switch Platform.** La primera vez
   se demora bastante, porque recompila todo.
2. **Player Settings → Publishing Settings → Compression Format: `Disabled`.**

   > Este paso es obligatorio y es donde se traba todo el mundo. Por defecto Unity
   > comprime el build, y GitHub Pages entrega esos archivos sin avisarle al
   > navegador que vienen comprimidos. Resultado: una barra de carga que nunca
   > llega al final y un error en la consola. Con la compresión desactivada el
   > juego pesa más, pero carga.

3. **Build**, y guarda el resultado en la carpeta `docs/` del repositorio. Lo que
   sale son un `index.html`, una carpeta `Build/` y una carpeta `TemplateData/`.
   **Se suben las tres cosas completas.**
4. Commit, push, y **Settings → Pages → `main` / carpeta `/docs`**.

Antes de esto hay que tener la dinámica del juego funcionando: publicar un menú
sin juego no sirve de nada.

---

## Caso 6 · Video y electrónica

**Quién:** los equipos de producción audiovisual y los de electrónica y robótica.

Estas líneas **no se publican como sitio web**, y forzarlas a GitHub Pages no tiene
sentido técnico. Se documentan en el portal del semillero:

- **Audiovisual:** el video subido a YouTube y enlazado, más el guion.
- **Electrónica:** un video corto del montaje funcionando, fotos del circuito, la
  tabla de pines y el archivo `.ino`.

Para estos equipos, el video **es** el resultado que documenta el artículo en la
sección 3.4.

---

## Último paso para todos: enlazarlo desde el portal

Cuando el proyecto ya esté en línea, se agrega al portal del semillero editando
[datos/semillero.json](datos/semillero.json), en el equipo que corresponda:

```json
"publicacion": {
  "estado": "en linea",
  "url": "https://profenapaipa.github.io/NOMBRE-DEL-REPOSITORIO/",
  "repo": "https://github.com/profenapaipa/NOMBRE-DEL-REPOSITORIO",
  "nota": "Publicado en GitHub Pages desde la rama main, carpeta /docs."
}
```

Y se vuelve a generar:

```
python herramientas/generar.py
```

El portal arma solo la **vista previa en vivo**: una miniatura del sitio de verdad,
cargada desde su propia dirección, en la página del equipo y en la sección
"Proyectos en GitHub" del portal. No hay que tomar ninguna captura de pantalla.

Los valores posibles de `estado` son:

| Estado | Qué muestra el portal |
|---|---|
| `en linea` | Vista previa en vivo y botón para abrirlo |
| `sin publicar` | Enlace al código y qué falta para publicarlo |
| `sin repositorio` | Que todavía no hay repositorio |
| `pendiente de build` | Que se podrá publicar cuando haya build |
| `no aplica` | Que esa línea no se publica como sitio |
