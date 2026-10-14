/*
 * components/modal.js — abrir/cerrar de modal overlay + hoja (sheet)
 * ========================================================================
 * Origen: wisfo_19.backup.html líneas 1744-1746 (cerrarHojas), 2173-2174
 * (closeModal + manejador de tecla Escape), 2993 (closeSheet).
 *
 * Dos patrones de overlay comparten este archivo:
 *   - "modal" (.overlay/.modal, overlays.css) — por ahora solo el modal
 *     de detalle de lección, #lessonModal en index.html.
 *   - "sheet" (.sheet/.sheet-box, overlays.css) — la hoja de
 *     perfil/configuración (#perfilSheet) y la hoja de logros (#logrosSheet).
 * Ambos solo activan/desactivan una clase `.open`; el propio CSS del
 * overlay maneja mostrar/ocultar + animación. `openModal`/`openSheet` no
 * eran funciones separadas en el original — las pantallas agregan la
 * clase `.open` directamente cuando llenan el contenido de un
 * modal/hoja (ver por ejemplo openLesson() en screens/lecciones.js,
 * openPerfil()/openLogros() en screens/perfil.js y screens/logros.js) —
 * se mantiene ese patrón aquí en vez de inventar una nueva API open*
 * que las pantallas de este esqueleto todavía no usan.
 */

export function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

export function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
}

export function cerrarHojas() {
  document.querySelectorAll('.sheet.open').forEach((h) => h.classList.remove('open'));
}

/** Conecta el atajo global de tecla Escape que cierra el modal de lección y cualquier hoja abierta. Llamar una vez desde app.js. */
export function initModalShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('lessonModal');
      cerrarHojas();
    }
  });
}
