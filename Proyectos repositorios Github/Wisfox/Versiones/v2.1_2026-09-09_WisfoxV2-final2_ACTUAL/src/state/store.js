/*
 * state/store.js — estado de progreso (XP, racha, lecciones hechas, notas)
 * ==============================================================================
 * Origen: wisfo_19.backup.html líneas 2082-2097 (`state`, su hidratación
 * desde localStorage, y `save()`), más líneas 3199-3213 (addXP — ver
 * src/utils/xp.js, que es lo que realmente muta `state.xp`/nivel y llama
 * a save() aquí).
 *
 * `state.hechas` es una bolsa de booleanos de lección-completada para
 * lecciones que no existen en el catálogo estático LESSONS de
 * data/lessons.js (ej. subtemas de la malla curricular generados por
 * temasDe() de data/curriculum.js, que tienen un id dinámico como
 * "ingles-9-1-3" y nunca aparecen en LESSONS). `estaHecha(id)` de
 * data/curriculum.js revisa LESSONS primero, y si no, cae de vuelta a
 * `state.hechas[id]`.
 *
 * `state.doneLessons` es la lista de ids *estáticos* de LESSONS que el
 * usuario ha completado; hydrate() abajo la vuelve a aplicar sobre el
 * arreglo LESSONS de data/lessons.js (mutando `.done` en cada
 * coincidencia), replicando lo que el prototipo hacía justo después de
 * cargar el estado.
 */

import { getJSON, setJSON } from '../services/storage.js';
import { LESSONS } from '../data/lessons.js';
import { xpProgress } from '../utils/xp.js';

export let state = {
  xp: 340,
  lessonsToday: 2,
  minutes: 20,
  quizToday: 10,
  doneLessons: [],
  hechas: {},
  notas: [],
};

export function hydrateState() {
  const saved = getJSON('wisfoxState');
  if (saved) state = Object.assign(state, saved);
  LESSONS.forEach((l) => { if (state.doneLessons.includes(l.id)) l.done = true; });
  return state;
}

export function save() {
  setJSON('wisfoxState', state);
}

const xpListeners = new Set();

/** Registra un callback para que se vuelva a ejecutar cada vez que cambia el XP (ej. para repintar la barra de XP / etiqueta de nivel). Devuelve una función para desuscribirse. */
export function onXPChange(fn) {
  xpListeners.add(fn);
  return () => xpListeners.delete(fn);
}

/**
 * Suma `n` XP (n puede ser 0, usado por el original para forzar un
 * repintado tras un cambio de idioma) y persiste. Devuelve la misma
 * forma que xpProgress() de utils/xp.js para que quien la llame no
 * necesite un segundo import solo para repintar. Las actualizaciones de
 * DOM (#statXP, #xpBar, #levelLabel, #userLevelSide, #statLessons en el
 * original) le pertenecen a quien renderiza ese marcado — ver
 * screens/inicio.js y components/navigation.js, ambos deberían llamar a
 * onXPChange(...) durante su init.
 */
export function addXP(n) {
  state.xp += n;
  save();
  const progress = xpProgress(state.xp);
  xpListeners.forEach((fn) => fn(progress));
  return progress;
}
