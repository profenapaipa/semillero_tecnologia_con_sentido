/*
 * components/icons.js — helper de marcado de íconos
 * =======================================================
 * Origen: wisfo_19.backup.html línea 1386 (`function ic(n,cls)`).
 *
 * Genera el marcado <svg><use> que referencia un <symbol> del sprite de
 * íconos incrustado al inicio del <body> de index.html (#iconset). Cada
 * nombre de ícono (`n`) debe coincidir con un `<symbol id="i-<nombre>">`
 * ahí — ver index.html para la lista completa (i-home, i-book, i-fox, ...).
 *
 * Se usa desde JS en cualquier lugar donde una pantalla construya HTML
 * vía un template string, ej. `` `<button>${ic('play', 'ic-fill')}</button>` ``.
 */

export function ic(name, cls = '') {
  return `<svg class="ic ${cls}"><use href="#i-${name}"/></svg>`;
}
