/*
 * components/orbit.js — mapa orbital de habilidades de Inicio (SVG + burbujas flotantes de materia)
 * =========================================================================================================
 * Origen: wisfo_19.backup.html líneas 2119-2171 (renderOrbit, con alias
 * `renderTree`). Portado casi textualmente — este es un algoritmo de
 * layout completamente especificado, no una decisión de diseño, así que
 * se implementó de verdad en vez de dejarse como stub.
 *
 * Dibuja, dentro de #orbit / #orbitSvg (ver la sección de Inicio de
 * index.html):
 *   - una línea conectora punteada por materia, desde el centro (50,46)
 *     en un viewBox 0-100 hasta la posición {x,y} (en porcentaje) de
 *     SUBJECTS[key].pos de esa materia;
 *   - una burbuja flotante `.subject-node` por materia con un anillo de
 *     progreso (materiaPct), un ícono, y un tooltip al pasar el cursor
 *     (.node-tip) que lista hasta 4 temas pendientes (de temasDe en
 *     data/curriculum.js, cayendo de vuelta a los nombres de grupo de
 *     MINDMAPS en data/subjects.js si la materia todavía no tiene temas
 *     salidos de la malla).
 *
 * ELIMINADO: el prototipo también traía un segundo sistema visual, sin
 * usar, para este mismo lugar — un SVG de árbol "ÁRBOL DE INICIO"
 * (.tree-svg/.tnode/...). Ahí, `renderTree` era simplemente
 * `const renderTree = renderOrbit`, es decir, el marcado/CSS del árbol
 * nunca llegaba a renderizarse. Se eliminó de overlays.css por decisión
 * del proyecto — este mapa orbital es la única implementación real.
 */

import { SUBJECTS, MINDMAPS } from '../data/subjects.js';
import { materiaPct, temasDe, temaDone } from '../data/curriculum.js';
import { grado } from '../state/profile.js';
import { state } from '../state/store.js';
import { getLang, t, tx } from '../i18n/index.js';
import { ic } from './icons.js';
import { go } from './navigation.js';

/**
 * @param {(subjectKey: string) => void} [onSubjectClick] — se llama al
 *   hacer clic en una burbuja de materia, después de navegar a la
 *   pantalla de Lecciones. Por defecto no hace nada; screens/inicio.js
 *   le pasa `setFilter` de screens/lecciones.js (el original llamaba a
 *   `setFilter(key)` directamente).
 */
export function renderOrbit(onSubjectClick = () => {}) {
  const orbit = document.getElementById('orbit');
  const svg = document.getElementById('orbitSvg');
  if (!orbit || !svg) return;

  const lang = getLang();
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  orbit.querySelectorAll('.subject-node').forEach((n) => n.remove());

  const cx = 50, cy = 46, R = 36, C = 2 * Math.PI * R;
  let i = 0;
  for (const key in SUBJECTS) {
    const s2 = SUBJECTS[key];
    const pct = materiaPct(key, grado, lang, state);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', s2.pos.x); line.setAttribute('y2', s2.pos.y);
    line.setAttribute('stroke', s2.color); line.setAttribute('stroke-width', '.35');
    line.setAttribute('stroke-dasharray', '1.4 1.6'); line.setAttribute('opacity', '.65');
    svg.appendChild(line);

    const node = document.createElement('div');
    node.className = 'subject-node';
    node.style.left = s2.pos.x + '%'; node.style.top = s2.pos.y + '%';
    node.style.animationDelay = i * 0.7 + 's';
    let tipClass = s2.pos.y < 50 ? 'tip-bottom' : 'tip-top';
    if (s2.pos.x < 30) tipClass += ' tip-right';
    else if (s2.pos.x > 70) tipClass += ' tip-left';

    // Temas pendientes tomados de la malla; si no hay, se usan los mapas mentales.
    const temas = temasDe(key, grado, lang);
    const pend = temas.filter((x) => !temaDone(x, state));
    const lista = temas.length
      ? pend.slice(0, 4).map((x) => `<span>${ic(s2.ik)} ${tx(x, 't')}</span>`).join('')
      : (MINDMAPS[key] || []).slice(0, 4).map((g) => `<span>${ic(s2.ik)} ${tx(g, 'name')}</span>`).join('');

    node.innerHTML = `
      <div class="bubble-wrap">
        <svg class="ringsvg" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="${R}" fill="none" stroke="${s2.color}" stroke-opacity=".18" stroke-width="5"/>
          <circle class="ringfg" cx="40" cy="40" r="${R}" fill="none" stroke="${s2.color}" stroke-width="5"
            stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"
            transform="rotate(-90 40 40)"/>
        </svg>
        <div class="bubble" style="color:${s2.color}">${ic(s2.ik)}</div>
      </div>
      <b>${tx(s2, 'name')}</b><span style="color:${s2.color}">${pct}%</span>
      <div class="node-tip ${tipClass}">
        <div class="tip-head"><span style="color:${s2.color}">${ic(s2.ik)}</span><b>${tx(s2, 'name')}</b><i style="color:${s2.color}">${pct}%</i></div>
        <div class="tip-bar"><i style="width:${pct}%;background:${s2.color}"></i></div>
        <div class="tip-topics">${lista}</div>
        <small>${t('tipClick')}</small>
      </div>`;
    node.onclick = () => { go('lecciones'); onSubjectClick(key); };
    orbit.appendChild(node);
    i++;
  }
}
