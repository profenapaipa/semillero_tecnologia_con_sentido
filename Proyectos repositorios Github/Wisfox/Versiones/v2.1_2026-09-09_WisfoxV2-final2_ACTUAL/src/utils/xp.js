/*
 * utils/xp.js — matemática de nivel/XP
 * =========================================
 * Origen: extraído del cálculo dentro de addXP()
 * (wisfo_19.backup.html líneas 3199-3212). El original mezclaba esta
 * matemática con escrituras directas al DOM en 6 elementos distintos;
 * esa parte de DOM se mudó a la pantalla que sea dueña de cada elemento
 * (ver `addXP()` en state/store.js, que ahora solo actualiza el estado y
 * deja que los suscriptores vuelvan a renderizar).
 *
 * Regla de nivel (sin cambios respecto al prototipo): el nivel 5 es el
 * piso, y cada 500 XP gana un nivel más. No hay diseño detrás de esos
 * números más allá de que "se sentían bien" en la maqueta — revisar si
 * se termina de definir la economía/fuentes de XP.
 */

const XP_PER_LEVEL = 500;
const BASE_LEVEL = 5;

export function levelFromXP(xp) {
  return BASE_LEVEL + Math.floor(xp / XP_PER_LEVEL);
}

/** Devuelve { level, inLevel, pct } — el progreso de XP dentro del nivel actual. */
export function xpProgress(xp) {
  const inLevel = xp % XP_PER_LEVEL;
  return {
    level: levelFromXP(xp),
    inLevel,
    pct: Math.round((inLevel / XP_PER_LEVEL) * 100),
  };
}
