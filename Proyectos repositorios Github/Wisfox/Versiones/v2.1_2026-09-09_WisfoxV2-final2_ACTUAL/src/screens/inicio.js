/*
 * screens/inicio.js — pantalla de Inicio (tablero principal)
 * ================================================================
 * Origen: wisfo_19.backup.html líneas 3182-3197 (renderMissions, la
 * mitad de addXP que escribe en el DOM). El mapa orbital de habilidades
 * en sí vive en components/orbit.js (compartido con otras pantallas que
 * necesitan refrescarlo, ej. screens/perfil.js tras un cambio de grado)
 * — renderInicio() le pasa `setFilter` de screens/lecciones.js como
 * manejador del clic en materia (era `setFilter(key)` en línea dentro
 * del renderOrbit() original).
 *
 * DOM que le pertenece (ver index.html #page-inicio):
 *   #orbit / #orbitSvg     — delegado a components/orbit.js.
 *   #missionsBox           — lista de misiones diarias.
 *   #statXP / #statLessons / #xpLabel / #xpBar / #xpPct / #levelLabel /
 *   #userLevelSide          — lecturas de XP/nivel, mantenidas en
 *                            sincronía vía onXPChange() de
 *                            state/store.js en vez de que addXP()
 *                            escriba el DOM directamente (ver la
 *                            cabecera de ese archivo para el porqué).
 *
 * La tarjeta "Próximos eventos" y la tarjeta "¿Necesitas ayuda?" en
 * index.html son marcado completamente estático (sin función de
 * renderizado en el original) salvo por el `onclick="startQuiz(...)"`
 * de la tarjeta de evento, que pertenece a screens/quiz.js y hoy está en
 * el puente de window (ver app.js).
 */

import { t } from '../i18n/index.js';
import { state, onXPChange } from '../state/store.js';
import { LESSONS } from '../data/lessons.js';
import { renderOrbit } from '../components/orbit.js';
import { setFilter } from './lecciones.js';

function renderMissions() {
  const box = document.getElementById('missionsBox');
  if (!box) return;
  const missions = [
    { icon: '📗', bg: '#e6f6ee', t: t('mission1'), cur: state.lessonsToday, max: 3, xp: 50 },
    { icon: '⏰', bg: '#f3eefb', t: t('mission2'), cur: state.minutes, max: 30, xp: 40 },
    { icon: '🎯', bg: '#eaf1fb', t: t('mission3'), cur: state.quizToday, max: 10, xp: 0, done: true },
  ];
  box.innerHTML = missions.map((x) => {
    const done = x.done || x.cur >= x.max;
    const pct = Math.min(100, Math.round((x.cur / x.max) * 100));
    return `<div class="mission">
      <div class="micon" style="background:${x.bg}">${x.icon}</div>
      <div class="minfo"><b>${x.t} ${done ? '' : `<span class="mcount">${x.cur}/${x.max}</span>`}</b>
        <div class="pbar"><i style="width:${done ? 100 : pct}%"></i></div></div>
      ${done ? '<div class="done-check">✓</div>' : `<span class="mxp">XP ${x.xp}</span>`}
    </div>`;
  }).join('');
}

function paintXP({ level, inLevel, pct }) {
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  set('statXP', state.xp);
  set('xpLabel', inLevel);
  const bar = document.getElementById('xpBar'); if (bar) bar.style.width = pct + '%';
  set('xpPct', pct + '%');
  set('levelLabel', `${t('levelWord')} ${level}`);
  set('userLevelSide', `${t('levelWord')} ${level} · ${t('explorer')}`);
  // NOTA: esta fórmula 22/-4 se copió textual del addXP() del
  // prototipo — tampoco se explicaba ahí. Parece aritmética sobrante de
  // datos de prueba más que una derivación real; revisar cuando
  // completar lecciones tenga una fuente de verdad real de punta a punta.
  set('statLessons', 22 + LESSONS.filter((l) => l.done).length - 4);
}

/** Renderiza todo en Inicio que no sea marcado estático. Llamar al cargar la página, y de nuevo tras cambios de idioma/tema/grado. */
export function renderInicio() {
  renderOrbit(setFilter); // hacer clic en una burbuja de materia salta a su ruta en Lecciones.
  renderMissions();
}

/** Conecta las lecturas impulsadas por XP para que se repinten al cambiar. Llamar una vez desde app.js. */
export function initInicio() {
  onXPChange(paintXP);
}
