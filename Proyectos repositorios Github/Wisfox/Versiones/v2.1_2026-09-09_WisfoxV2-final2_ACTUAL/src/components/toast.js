/*
 * components/toast.js — notificación transitoria inferior
 * =============================================================
 * Origen: wisfo_19.backup.html líneas 3222-3229 (toast()). Estilos en
 * overlays.css (.toast). Requiere el elemento
 * `<div class="toast" id="toast">` que ya está en index.html.
 */

let toastTimer;

export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
