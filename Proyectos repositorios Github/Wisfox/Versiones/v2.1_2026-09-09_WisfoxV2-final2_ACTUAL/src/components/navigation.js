/*
 * components/navigation.js — cambio de pantalla (barra lateral + nav inferior + atajos de Inicio)
 * ======================================================================================================
 * Origen: wisfo_19.backup.html líneas 2106-2116 (la delegación de clics
 * `[data-page]` y `go(page)`) y líneas 3219-3221 (el atajo de búsqueda Ctrl+K).
 *
 * go(page) es la única función de la que dependen indirectamente todas
 * las pantallas: activa/desactiva `.active` en la sección
 * `#page-<nombre>` correspondiente (ver `.page.active` en
 * styles/layout.css) y en cada `button[data-page]` (tanto la `.nav` de
 * la barra lateral como la `.bottomnav` móvil comparten los mismos
 * valores data-page, ver index.html).
 *
 * TODO — búsqueda en vivo: el original también conectaba el evento
 * `input` de `#searchInput` para saltar a Lecciones y filtrar mientras
 * se escribe (`go('lecciones'); lessonFilter='todas'; renderLessons(q)`).
 * Como se documenta en el "KNOWN GAP" de la cabecera de
 * screens/lecciones.js, ese flujo ya estaba incompleto en el prototipo
 * original (renderLessons() solo filtra dentro de un tema ya abierto, no
 * hay una vista plana entre materias) — por eso se dejó sin conectar acá
 * a propósito. Impleméntalo en screens/lecciones.js importando `go` de
 * este archivo, en vez de agregar aquí un import específico de lecciones.
 */

export function go(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('button[data-page]').forEach((b) => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  window.scrollTo({ top: 0 });
  cerrarHojasIfPresent();
}

// Evita un ciclo de importación fuerte con components/modal.js por una
// sola llamada — el cerrarHojas() de modal.js solo limpia `.sheet.open`,
// es seguro que no haga nada si todavía no hay nada abierto en el primer render.
function cerrarHojasIfPresent() {
  document.querySelectorAll('.sheet.open').forEach((h) => h.classList.remove('open'));
}

/** Conecta la delegación de clics de la barra lateral/nav inferior y el atajo de búsqueda Ctrl+K. Llamar una vez desde app.js. */
export function initNavigation() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (btn) go(btn.dataset.page);
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
  });
}
