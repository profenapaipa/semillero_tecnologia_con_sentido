/*
 * screens/recursos.js — pantalla de Recursos (materiales de estudio)
 * ========================================================================
 * Origen: wisfo_19.backup.html líneas 2466-2473 (renderResources,
 * openResource). Portado por completo — esta pantalla es lo bastante
 * simple como para que un stub no ahorrara ningún trabajo de diseño real.
 *
 * DOM que le pertenece: #resourcesGrid (dentro de #page-recursos, ver
 * index.html).
 *
 * CAMBIO respecto al original: los clics en las tarjetas usaban un
 * atributo `onclick` en línea que referenciaba un `openResource(i)`
 * global. Como este marcado se genera aquí (no es HTML estático como
 * index.html), usa un atributo data + un único listener delegado en su
 * lugar — no hace falta ninguna función global. Prefiere este patrón
 * para cualquier otra pantalla que construyas: solo el *marcado estático
 * preexistente* de index.html sigue necesitando onclick en línea + una
 * función expuesta en window (ver app.js).
 */

import { RESOURCES } from '../data/resources.js';
import { tx, t } from '../i18n/index.js';
import { toast } from '../components/toast.js';
import { crown, openPlanes } from './planes.js';
import { isPro, onPlanChange } from '../state/plan.js';

export function renderResources() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;
  grid.innerHTML = RESOURCES.map((r, i) => `
    <div class="card resource" data-resource-index="${i}">
      <div class="ricon" style="background:${r.bg}">${r.icon}</div>
      <div><b>${tx(r, 't')}${r.pro ? crown() : ''}</b><p>${tx(r, 'p')}</p></div>
    </div>`).join('');
}

function openResource(i) {
  // Las opciones Pro (corona) llevan a la hoja de planes mientras el usuario esté en Freemium.
  if (RESOURCES[i].pro && !isPro()) { openPlanes(); return; }
  toast(t('opening') + tx(RESOURCES[i], 't'));
}

/** Conecta la delegación de clics de las tarjetas de recurso. Llamar una vez desde app.js. */
export function initRecursos() {
  onPlanChange(renderResources);
  document.getElementById('resourcesGrid')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-resource-index]');
    if (card) openResource(Number(card.dataset.resourceIndex));
  });
}
