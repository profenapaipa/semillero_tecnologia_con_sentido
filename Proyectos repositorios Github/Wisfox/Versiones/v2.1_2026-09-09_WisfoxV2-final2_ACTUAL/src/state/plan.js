/*
 * state/plan.js — plan de suscripción del usuario (Freemium / Pro)
 * ======================================================================
 * Dos planes:
 *   'free' — lecciones completas, evaluaciones y quizes, videojuegos, IA básica.
 *   'pro'  — lo anterior + videotutorías, IA avanzada, podcast, mayor
 *            profundidad en lecciones y evaluaciones, y rutas personalizadas
 *            (evaluación inicial que fija nivel y temas).
 *
 * Por ahora solo hay frontend y `localStorage` (ver la BITACORA), así que
 * `setPlan('pro')` es una activación local de demostración: no cobra nada.
 * Cuando exista backend de pagos, este es el único sitio que hay que
 * conectar — el resto de la UI solo pregunta `isPro()` y escucha
 * `onPlanChange()`.
 */

import { getStr, setStr } from '../services/storage.js';
import { PAISES, PAIS_DEFECTO } from '../data/precios.js';

export const PLANES = ['free', 'pro'];

let plan = 'free';
let pais = PAIS_DEFECTO;

export function hydratePlan() {
  const p = getStr('wisfoxPlan');
  if (PLANES.includes(p)) plan = p;
  const c = getStr('wisfoxPais');
  if (PAISES[c]) pais = c;
}

export function getPlan() {
  return plan;
}

/** País cuyo precio se muestra (clave de PAISES en data/precios.js). */
export function getPais() {
  return pais;
}

export function setPais(c) {
  if (!PAISES[c] || c === pais) return;
  pais = c;
  setStr('wisfoxPais', c);
  listeners.forEach((fn) => fn(plan));
}

export function isPro() {
  return plan === 'pro';
}

const listeners = new Set();

/** Registra un callback que se ejecuta cada vez que cambia el plan. Devuelve una función para desuscribirse. */
export function onPlanChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setPlan(p) {
  if (!PLANES.includes(p) || p === plan) return;
  plan = p;
  setStr('wisfoxPlan', p);
  listeners.forEach((fn) => fn(plan));
}
