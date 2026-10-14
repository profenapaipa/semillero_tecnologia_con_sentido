/*
 * screens/logros.js — hoja de Logros (achievements)
 * =======================================================
 * Origen: wisfo_19.backup.html líneas 2877-2883 (renderAchievements).
 * Portado por completo. Se renderiza tanto desde el ícono de trofeo de
 * la barra superior (#logrosSheet, abierto activando `.open` al estilo
 * components/modal.js — ver openLogros() abajo) y podría reusarse en
 * línea si algún día se agrega una página dedicada de Logros (por ahora
 * index.html solo la conecta como una hoja/sheet).
 *
 * DOM que le pertenece: #achvGrid (dentro de #logrosSheet, ver index.html).
 */

import { ACHIEVEMENTS } from '../data/achievements.js';
import { tx, t } from '../i18n/index.js';

export function renderAchievements() {
  const grid = document.getElementById('achvGrid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map((a) => `
    <div class="card achv ${a.un ? '' : 'locked'}">
      <span class="aicon">${a.i}</span><b>${tx(a, 't')}</b><p>${tx(a, 'p')}</p>
      <span class="state">${a.un ? t('unlocked') : t('locked')}</span>
    </div>`).join('');
}

/** Renderiza la grilla de logros y abre el #logrosSheet. Referenciada por el botón de trofeo de index.html (ver el puente de window en app.js). */
export function openLogros() {
  renderAchievements();
  document.getElementById('logrosSheet')?.classList.add('open');
}
