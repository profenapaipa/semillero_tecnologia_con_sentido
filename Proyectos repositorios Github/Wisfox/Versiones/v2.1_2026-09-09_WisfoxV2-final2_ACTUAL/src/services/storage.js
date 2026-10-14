/*
 * services/storage.js — envoltorio de localStorage
 * =====================================================
 * Origen: el prototipo llamaba a localStorage.getItem/setItem
 * directamente, cada una envuelta en su propio try/catch (la navegación
 * privada o el almacenamiento deshabilitado lanzan error). Este módulo
 * lo centraliza para que cada porción de estado (state/store.js,
 * state/profile.js, theme/theme.js, i18n/index.js) simplemente llame a
 * getJSON/setJSON/getStr/setStr sin repetir el try/catch.
 *
 * Las claves usan el prefijo 'wisfox*' (renombrado desde 'wisfo*' el
 * 2026-08-13 junto con el resto de la marca — ver BITACORA.md). Como
 * todavía no hay usuarios reales, el rename no incluye lógica de
 * migración: cualquier estado guardado en el navegador bajo las claves
 * viejas queda huérfano y simplemente se ignora.
 *
 * TODO: este es el punto de conexión para cambiar por un backend real
 * más adelante (según la decisión de "solo frontend por ahora") — por
 * ejemplo, convertir get/set en llamadas asíncronas contra una API, y
 * este pasaría a ser el único archivo que cambia.
 */

export function getStr(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

export function setStr(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* almacenamiento no disponible */ }
}

export function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
}
