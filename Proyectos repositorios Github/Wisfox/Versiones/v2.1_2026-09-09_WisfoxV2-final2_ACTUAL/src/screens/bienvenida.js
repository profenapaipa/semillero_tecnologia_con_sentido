/*
 * screens/bienvenida.js — pantalla de onboarding de primer uso
 * ==================================================================
 * Origen: wisfo_19.backup.html líneas 3006-3012 (guardarBienvenida).
 * El selector de grado (#welGrados) lo renderiza
 * renderGradoPicks()/setGradoWel() de screens/perfil.js — la pantalla de
 * bienvenida y la hoja de configuración comparten esa única
 * implementación del selector de grado.
 *
 * DOM que le pertenece: #welcome (ver index.html) — input #welName,
 * #welGrados, el botón "Comenzar".
 *
 * Disparador de primer uso: app.js abre #welcome vía `showBienvenida()`
 * de abajo cuando `perfil.nombre` está vacío (ver el bloque final de
 * arranque de wisfo_19.backup.html, líneas 3253-3257 — de ahí también
 * viene el retraso de 350ms para el autofocus de `#welName`, que se
 * conservó en app.js).
 */

import { t } from '../i18n/index.js';
import { perfil, setNombre } from '../state/profile.js';
import { pintarPerfil, renderGradoPicks } from './perfil.js';
import { renderOrbit } from '../components/orbit.js';
import { setFilter, renderRuta } from './lecciones.js';

function guardarBienvenida() {
  const input = document.getElementById('welName');
  const v = input ? input.value.trim() : '';
  setNombre(v || t('explorer'));
  document.getElementById('welcome')?.classList.remove('open');
  pintarPerfil();
  renderOrbit(setFilter);
  renderRuta();
}

/** Conecta el envío con Enter y el botón "Comenzar" de la pantalla de bienvenida. Llamar una vez desde app.js. */
export function initBienvenida() {
  const box = document.getElementById('welcome');
  if (!box) return;
  document.getElementById('welName')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') guardarBienvenida();
  });
  box.addEventListener('click', (e) => {
    if (e.target.closest('.welcome-box .btn-green')) guardarBienvenida();
  });
}

export function showBienvenida() {
  renderGradoPicks();
  document.getElementById('welcome')?.classList.add('open');
}
