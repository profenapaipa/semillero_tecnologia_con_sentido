/*
 * utils/format.js — helpers de texto (escapado HTML + ajuste de etiquetas SVG)
 * ==================================================================================
 * Origen: wisfo_19.backup.html líneas 2447-2464 (recortar, envolver) y
 * línea 2521 (escapeHtml). Las tres son funciones puras
 * string->string, movidas aquí tal cual.
 *
 * escapeHtml: úsala antes de insertar cualquier texto *provisto por el
 * usuario* vía innerHTML/insertAdjacentHTML (mensajes de chat, títulos
 * de nota, nombres de archivo subidos...). El contenido estático escrito
 * en data/*.js no la necesita.
 *
 * recortar/envolver: helpers de ajuste de etiquetas para los SVG de
 * mapa mental y mapa conceptual (vistaMental/vistaConcepto de
 * screens/lecciones.js) — recortar trunca a una línea con puntos
 * suspensivos, envolver reparte el texto en hasta 2 líneas de elementos
 * <text> y devuelve el marcado SVG listo para inyectar.
 */

export function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function recortar(txt, max) {
  const e = escapeHtml(txt);
  return e.length > max ? e.slice(0, max - 1) + '…' : e;
}

export function envolver(txt, max, x, y, cls) {
  const palabras = escapeHtml(txt).split(' ');
  const lineas = [];
  let cur = '';
  palabras.forEach((p) => {
    if ((cur + ' ' + p).trim().length > max) { lineas.push(cur.trim()); cur = p; }
    else cur += ' ' + p;
  });
  if (cur.trim()) lineas.push(cur.trim());
  const vis = lineas.slice(0, 2);
  if (lineas.length > 2) vis[1] = vis[1].slice(0, max - 1) + '…';
  const y0 = y - (vis.length - 1) * 8;
  return vis.map((l, i) => `<text x="${x}" y="${y0 + i * 16}" class="${cls}">${l}</text>`).join('');
}
