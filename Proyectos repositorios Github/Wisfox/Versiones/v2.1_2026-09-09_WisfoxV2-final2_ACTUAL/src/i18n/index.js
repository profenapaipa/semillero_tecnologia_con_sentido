/*
 * i18n/index.js — motor de traducción
 * ========================================
 * Origen: portado de wisfo_19.backup.html líneas 1385-1679 (funciones t,
 * tx, quizTitle, setLang, applyLang — renderLangList se dejó afuera, ver
 * nota al final). Este archivo se implementó de verdad (no como stub)
 * porque casi toda pantalla necesita `t()` solo para renderizar texto de
 * relleno, así que el esqueleto es mucho más útil con un traductor
 * funcionando de verdad.
 *
 * Uso:
 *   import { t, tx, getLang, setLang, onLanguageChange } from '../i18n/index.js';
 *   el.textContent = t('navInicio');            // texto de interfaz por clave
 *   tx(resource, 't')                            // campo de contenido con un
 *                                                 // override opcional
 *                                                 // `<campo>_en` (ver es.js
 *                                                 // vs. data/resources.js)
 *
 * Re-renderizado entre módulos, desacoplado a propósito:
 *   El applyLang() original llamaba directamente a ~15 funciones de
 *   renderizado de todas las demás secciones del archivo (renderThemeList,
 *   renderTree, renderMissions, renderQuizHome, pintarPerfil, ...).
 *   Programar esas llamadas aquí de forma fija haría que i18n/index.js
 *   dependiera de cada módulo de pantalla, que a su vez dependería de
 *   vuelta de i18n — un lío de importaciones circulares.
 *
 *   En su lugar, las pantallas/componentes se registran ellos mismos con
 *   `onLanguageChange(fn)` durante su propio init, y el applyLang() de
 *   abajo simplemente avisa a todos los que están escuchando. Quien
 *   renderice algo con `t()` adentro debería volver a correr ese
 *   renderizado dentro de un listener de cambio de idioma. Ver app.js
 *   para dónde debería ocurrir el cableado de init/listener de cada
 *   pantalla.
 *
 * TODO: `renderLangList()` (los botones dentro del campo "Idioma" de la
 * hoja de configuración, #langList) era una función de construcción de
 * DOM, no parte del motor de traducción en sí — pertenece a
 * screens/perfil.js, construida a partir de `LANGS` + `getLang()` +
 * `setLang()` exportados abajo.
 */

import { es } from './es.js';
import { en } from './en.js';

export const LANGS = {
  es: { name: 'Español', code: 'ES' },
  en: { name: 'English', code: 'EN' },
};

const DICTS = { es, en };

let lang = 'es';
try {
  const saved = localStorage.getItem('wisfoxLang');
  if (DICTS[saved]) lang = saved;
} catch (e) { /* localStorage no disponible (modo privado, SSR, etc.) */ }

export function getLang() {
  return lang;
}

/** Busca un texto de interfaz por clave, ej. t('navInicio'). Si falta, devuelve la clave misma. */
export function t(key) {
  const dict = DICTS[lang] || es;
  return dict[key] !== undefined ? dict[key] : key;
}

/** Busca un campo de contenido con un override opcional `<campo>_en` en el objeto, ej. tx(resource, 't'). */
export function tx(obj, field) {
  const enValue = obj[`${field}_en`];
  return lang === 'en' && enValue !== undefined ? enValue : obj[field];
}

export function quizTitle(subjectName) {
  return lang === 'en' ? `${subjectName} Quiz` : `Quiz de ${subjectName}`;
}

const listeners = new Set();

/** Registra un callback para que se vuelva a ejecutar cada vez que cambia el idioma. Devuelve una función para desuscribirse. */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLang(l) {
  if (!DICTS[l] || l === lang) return;
  lang = l;
  try { localStorage.setItem('wisfoxLang', l); } catch (e) {}
  applyLang();
}

/**
 * Vuelve a traducir cada elemento [data-i18n] / [data-i18n-ph] /
 * [data-i18n-title] presente en el DOM, y luego notifica a los
 * listeners de onLanguageChange para que el contenido generado
 * dinámicamente (tarjetas, listas, chat, etc.) también se vuelva a
 * renderizar en el nuevo idioma.
 */
export function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const svg = el.querySelector(':scope > svg.ic');
    if (svg) {
      // Conserva el ícono, reemplaza solo los nodos de texto alrededor.
      [...el.childNodes].forEach((n) => { if (n !== svg) n.remove(); });
      el.insertAdjacentHTML('beforeend', t(el.dataset.i18n));
    } else {
      el.innerHTML = t(el.dataset.i18n);
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });

  listeners.forEach((fn) => fn(lang));
}
