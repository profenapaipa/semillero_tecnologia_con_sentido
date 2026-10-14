/*
 * theme/theme.js — motor de paleta + modo claro/oscuro
 * =========================================================
 * Origen: wisfo_19.backup.html líneas 1711-1729 (estado paleta/modo +
 * applyTheme/setModo). renderThemeList() (originalmente justo debajo de
 * estas) es construcción de UI para el selector de tema de la hoja de
 * configuración y pertenece a screens/perfil.js en su lugar — ver la
 * nota de `onThemeChange` abajo sobre cómo debería reconectarse.
 *
 * applyTheme(key) escribe las propiedades personalizadas CSS de la
 * paleta elegida directamente en <html style="...">, que es lo que
 * realmente sobrescribe los valores por defecto de :root de
 * styles/base.css en tiempo de ejecución. También establece
 * `data-theme="dark"|"light"` (usado por los OVERRIDES DE TEMA OSCURO de
 * overlays.css) y `data-paleta` en <html>.
 */

import { getStr, setStr } from '../services/storage.js';
import { PALETAS } from './palettes.js';

export let paleta = 'bosque';
export let modo = 'claro';

export function hydrateTheme() {
  const pk = getStr('wisfoxPaleta');
  if (pk && PALETAS[pk]) paleta = pk;
  const mk = getStr('wisfoxModo');
  if (mk === 'claro' || mk === 'oscuro') modo = mk;
}

const listeners = new Set();

/** Registra un callback para que se vuelva a ejecutar cada vez que cambia la paleta o el modo claro/oscuro (ej. para re-renderizar el selector de tema). */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyTheme(key) {
  if (key && PALETAS[key]) paleta = key;
  const root = document.documentElement;
  Object.entries(PALETAS[paleta][modo]).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = modo === 'oscuro' ? 'dark' : 'light';
  root.dataset.paleta = paleta;
  setStr('wisfoxPaleta', paleta);
  setStr('wisfoxModo', modo);
  listeners.forEach((fn) => fn({ paleta, modo }));
}

export function setModo(m) {
  modo = m === 'oscuro' ? 'oscuro' : 'claro';
  applyTheme();
}
