/*
 * screens/lecciones.js — pantalla de Lecciones (rutas -> temas -> formatos de lección)
 * ==========================================================================================
 * Origen: wisfo_19.backup.html líneas 2186-2464 (renderRuta, setFilter,
 * abrirTema, volverARuta, renderLessons, openLesson, completeLesson,
 * abrirFormato, cerrarFormato, textoDelFormato, leerFormato, vistaTexto,
 * vistaMental, vistaConcepto, vistaFichas). `leerLeccion()` (agrupada
 * originalmente con las demás funciones de voz, wisfo_19.backup.html
 * L2923-2929) vive aquí en su lugar, según la nota de cabecera de
 * services/speech.js — lee `#lessonArticle`/`#lessonModalBody h2`, que
 * le pertenecen a esta pantalla.
 *
 * ELIMINADO: el prototipo tenía una `function renderLessonFilters(){}`
 * vacía — código muerto (o una barra de chips de filtro por materia
 * inconclusa que nunca se construyó). Se eliminó por decisión del
 * proyecto en vez de dejarla como stub sin efecto.
 *
 * DOM que le pertenece (ver index.html #page-lecciones):
 *   #vistaRuta / #rutaGrid, #vistaTema (#temaCrumb/#temaTitulo/#temaSub/
 *   #temaCont/#temaFormato), y el overlay compartido
 *   #lessonModal/#lessonModalBody (index.html, abierto vía el patrón
 *   `.open` de components/modal.js).
 *
 * CAMBIO respecto al original: cada `onclick="fn(...)"` en el marcado
 * generado se convirtió en un par `data-action`/`data-id` manejado por
 * un listener delegado por contenedor (ver initLecciones()) — mismo
 * razonamiento que screens/recursos.js: este marcado se genera aquí, así
 * que no hay motivo para recurrir a una función global.
 *
 * VACÍO CONOCIDO (no corregido aquí, se señala en vez de trabajarlo
 * alrededor silenciosamente): la caja de búsqueda de la barra superior
 * estaba conectada en el prototipo para llamar a `renderLessons(q)`
 * después de `go('lecciones')`, pero renderLessons() solo filtra *dentro
 * del tema actualmente abierto* (`if(!temaAbierto) return`) — no hay una
 * vista de búsqueda plana entre materias, así que escribir en la caja de
 * búsqueda sin un tema abierto no hacía nada. `lessonFilter` incluso se
 * fijaba en el centinela `'todas'`, que no es una clave real en
 * SUBJECTS, como si se hubiera planeado una vista plana que nunca se
 * construyó. Se dejó sin conectar — ver el TODO de
 * components/navigation.js — hasta que alguien diseñe cómo debería verse
 * una vista de resultados de búsqueda real entre materias.
 */

import { SUBJECTS } from '../data/subjects.js';
import { LESSONS, LESSON_CONTENT, FORMATOS } from '../data/lessons.js';
import { QUIZ_BANK } from '../data/quizzes.js';
import { FICHAS, REPASOS, QUIZ_POR_UNIDAD } from '../content/ingles/index.js';
import { temasDe, temaDone, materiaPct, estaHecha } from '../data/curriculum.js';
import { t, tx, getLang } from '../i18n/index.js';
import { recortar, envolver } from '../utils/format.js';
import { ic } from '../components/icons.js';
import { go } from '../components/navigation.js';
import { closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { grado } from '../state/profile.js';
import { state, addXP, save } from '../state/store.js';
import { hablar, pararVoz, isHablando } from '../services/speech.js';
import { renderInicio } from './inicio.js';
import { startQuizEstandar } from './quiz.js';
import { proDepthTag } from './planes.js';

let lessonFilter = 'ingles';
let temaAbierto = null;
let formatoAbierto = null;

/* ================== RUTAS ================== */

export function renderRuta() {
  const grid = document.getElementById('rutaGrid');
  if (!grid) return;
  const lang = getLang();
  grid.innerHTML = Object.keys(SUBJECTS).map((k) => {
    const s2 = SUBJECTS[k];
    const temas = temasDe(k, grado, lang);
    const pct = materiaPct(k, grado, lang, state);
    if (!temas.length) return '';
    let yaHayActual = false;
    const pasos = temas.map((x) => {
      const hecho = temaDone(x, state);
      let est = 'todo';
      if (hecho) est = 'done';
      else if (!yaHayActual) { est = 'now'; yaHayActual = true; }
      const sub = x.lecciones.slice(0, 3).map((l) => tx(l, 't')).join(', ');
      return `<button class="rc-step ${est}" data-action="abrir-tema" data-materia="${k}" data-id="${x.id}">
        <span class="knot">${est === 'done' ? ic('check') : (est === 'now' ? ic('play', 'ic-fill') : '')}</span>
        <span><p>${tx(x, 't')}</p><small>${sub || x.periodo}</small></span>
      </button>`;
    }).join('');
    const siguiente = temas.find((x) => !temaDone(x, state)) || temas[0];
    return `<div class="card ruta-card" id="ruta-${k}">
      <div class="rc-head">
        <div class="rc-ic" style="background:${s2.ring};color:${s2.color}">${ic(s2.ik)}</div>
        <div><b>${t('rutaWord')} ${tx(s2, 'name')}</b><span>${pct}% ${t('completadaWord')}</span></div>
      </div>
      <div class="rc-steps">${pasos}</div>
      <button class="btn-green" style="width:100%" data-action="abrir-tema" data-materia="${k}" data-id="${siguiente.id}">${t('continueRoute')}</button>
    </div>`;
  }).join('') || `<div class="empty-state"><p>${t('sinTemas')}</p></div>`;
}

/** Salta a Lecciones y resalta con un destello la tarjeta de ruta de una materia. Pasar como `onSubjectClick` a renderOrbit() de components/orbit.js. */
export function setFilter(k) {
  lessonFilter = k;
  volverARuta();
  const el = document.getElementById('ruta-' + k);
  if (el) {
    el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
}

function abrirTema(k, id) {
  lessonFilter = k;
  const tema = temasDe(k, grado, getLang()).find((x) => x.id === id);
  if (!tema) return;
  temaAbierto = tema;
  go('lecciones');
  document.getElementById('vistaRuta').style.display = 'none';
  document.getElementById('vistaTema').style.display = '';
  document.getElementById('temaFormato').style.display = 'none';
  document.getElementById('temaCont').style.display = '';
  document.getElementById('temaCrumb').textContent = tx(SUBJECTS[k], 'name');
  document.getElementById('temaTitulo').textContent = tx(tema, 't');
  document.getElementById('temaSub').textContent =
    tema.periodo + ' · ' + tema.lecciones.length + ' ' + t('leccionesWord');
  renderLessons();
}

export function volverARuta() {
  temaAbierto = null;
  document.getElementById('vistaRuta').style.display = '';
  document.getElementById('vistaTema').style.display = 'none';
  renderRuta();
}

/* Vista de un tema: lo que sigue en curso + los cuatro formatos. */
function renderLessons(query) {
  const cont = document.getElementById('temaCont');
  if (!cont || !temaAbierto) return;
  const s2 = SUBJECTS[lessonFilter];
  let list = temaAbierto.lecciones.slice();
  if (query) list = list.filter((l) => tx(l, 't').toLowerCase().includes(query));

  const enCurso = list.filter((l) => !estaHecha(l.id, state)).slice(0, 3);
  const hechas = list.filter((l) => estaHecha(l.id, state)).length;
  const pctTema = list.length ? Math.round((hechas / list.length) * 100) : 0;

  const seguir = enCurso.length ? `
    <div class="sec-h">${ic('play')}<span>${t('continuaAprendiendo')}</span></div>
    <div class="cont-grid">${enCurso.map((l) => `
      <div class="card cont-card" data-action="open-lesson" data-id="${l.id}">
        <div class="cic" style="background:${s2.ring};color:${s2.color}">${ic(s2.ik)}</div>
        <div style="flex:1;min-width:0">
          <b>${tx(l, 't')}</b>
          <div class="cont-bar"><i style="width:${Math.max(8, pctTema)}%;background:${s2.color}"></i></div>
        </div>
      </div>`).join('')}</div>` : '';

  // El repaso solo existe para los temas que vienen de la malla (hoy,
  // inglés); las materias que todavía salen de TEMAS_BASE no lo tienen.
  const repaso = REPASOS[temaAbierto.unidad] ? `
    <div class="sec-h">${ic('sparkles')}<span>${t('repasoPeriodo')}</span></div>
    <div class="fmt-grid">
      <div class="card fmt-card" data-action="abrir-repaso" data-id="${temaAbierto.unidad}">
        <div class="fic" style="background:${s2.ring};color:${s2.color}">${ic('trophy')}</div>
        <b>${t('verRepaso')}</b>
        <p>${t('repasoSub')}</p>
        <div class="go">${ic('right')}</div>
      </div>
    </div>` : '';

  cont.innerHTML = seguir + `
    <div class="sec-h">${ic('book')}<span>${t('explorarLecciones')}</span></div>
    <div class="fmt-grid">${FORMATOS.map((f) => `
      <div class="card fmt-card" data-action="abrir-formato" data-format="${f.k}">
        <div class="fic" style="background:${f.bg};color:${f.c}">${ic(f.ic)}</div>
        <b>${t('fmt_' + f.k)}</b>
        <p>${t('fmtSub_' + f.k)}</p>
        <div class="go">${ic('right')}</div>
      </div>`).join('')}</div>` + repaso;
}

/* ================== LECCIÓN (modal) ================== */

function openLesson(id) {
  const dentro = temaAbierto ? temaAbierto.lecciones.find((x) => x.id === id) : null;
  const l = LESSONS.find((x) => x.id === id) || dentro;
  if (!l) return;
  const s2 = SUBJECTS[l.s] || SUBJECTS[lessonFilter];
  const done = estaHecha(id, state);
  const lang = getLang();
  const cuerpo = (LESSON_CONTENT[lang] && LESSON_CONTENT[lang][id]) || t('mallaPend');
  document.getElementById('lessonModalBody').innerHTML = `
    <h2>${ic(s2.ik)} ${tx(l, 't')}</h2>
    <div class="lm-meta">${tx(s2, 'name')} · ${l.d} · ${done ? t('tagDone') : t('tagPending')} ${proDepthTag()}</div>
    <div style="margin:10px 0 4px">
      <button class="speak-btn" id="btnLeer" data-action="leer-leccion">
        🔊 <span>${t('listen')}</span><span class="wave"><i></i><i></i><i></i></span>
      </button>
    </div>
    <article id="lessonArticle">${cuerpo}</article>
    <div class="lm-foot">
      <button class="link-btn" data-action="close-lesson-modal">${t('close')}</button>
      ${done ? '' : `<button class="btn-green" data-action="complete-lesson" data-id="${id}">${t('markDone')}</button>`}
    </div>`;
  document.getElementById('lessonModal').classList.add('open');
}

function completeLesson(id) {
  const l = LESSONS.find((x) => x.id === id);
  if (l && !l.done) { l.done = true; state.doneLessons.push(id); }
  else if (!l && !state.hechas[id]) { state.hechas[id] = true; }
  else return;
  state.lessonsToday++;
  addXP(25); // ya persiste vía save() de state/store.js — no hace falta volver a llamarlo aquí.
  pararVoz();
  closeModal('lessonModal');
  renderInicio(); // orbit + misiones (antes eran renderTree()+renderMissions() por separado en el original)
  renderRuta();
  if (temaAbierto) {
    temaAbierto = temasDe(lessonFilter, grado, getLang()).find((x) => x.id === temaAbierto.id);
    renderLessons();
  }
  toast(t('lessonDoneToast'));
}

function leerLeccion() {
  if (isHablando()) { pararVoz(); return; }
  const art = document.getElementById('lessonArticle');
  const tit = document.querySelector('#lessonModalBody h2');
  if (!art) return;
  hablar(((tit ? tit.textContent + '. ' : '') + art.textContent).replace(/\s+/g, ' ').trim());
}

/* ================== FORMATOS DE LECCIÓN ================== */

function abrirFormato(f) {
  if (!temaAbierto) return;
  formatoAbierto = f;
  document.getElementById('temaCont').style.display = 'none';
  const box = document.getElementById('temaFormato');
  box.style.display = '';
  const s2 = SUBJECTS[lessonFilter];
  const cuerpo = { texto: vistaTexto, mental: vistaMental, concept: vistaConcepto, fichas: vistaFichas }[f](temaAbierto, s2);
  box.innerHTML = `
    <div class="fmt-bar">
      <button class="crumb-back" data-action="cerrar-formato">${ic('left')}<span>${t('backToTopic')}</span></button>
      <b>${t('fmt_' + f)}</b>
      <button class="speak-btn" id="btnVozFmt" data-action="leer-formato">${ic('volume')}<span>${t('listen')}</span></button>
    </div>
    ${cuerpo}`;
}

function cerrarFormato() {
  pararVoz();
  formatoAbierto = null;
  document.getElementById('temaFormato').style.display = 'none';
  document.getElementById('temaCont').style.display = '';
}

function textoDelFormato() {
  const box = document.getElementById('temaFormato');
  return box ? box.innerText.replace(/\s+/g, ' ').trim() : '';
}

function leerFormato() {
  hablar(textoDelFormato());
}

/* ---------- Texto ---------- */
function vistaTexto(tema, s2) {
  const lang = getLang();
  const cuerpo = tema.lecciones.map((l, i) => `
    <article class="tx-block" data-lec="${l.id}">
      <h4>${i + 1}. ${tx(l, 't')}</h4>
      ${LESSON_CONTENT[lang] && LESSON_CONTENT[lang][l.id]
        ? LESSON_CONTENT[lang][l.id]
        : `<p class="tx-wip">${t('lessonWip')}</p>`}
      <div class="tx-foot">
        <button class="link-btn" data-action="open-lesson" data-id="${l.id}">${ic('book')}<span>${t('openLesson')}</span></button>
        ${estaHecha(l.id, state)
          ? `<span class="tag-done">${t('tagDone')}</span>`
          : `<button class="link-btn" data-action="complete-lesson" data-id="${l.id}">${ic('check')}<span>${t('markDone')}</span></button>`}
      </div>
    </article>`).join('');
  return `<div class="card fmt-body">
    <p class="fmt-lead">${t('selText')}</p>${cuerpo}</div>`;
}

/* ---------- Mapa mental: radial ---------- */
function vistaMental(tema, s2) {
  const hojas = tema.lecciones.map((l) => tx(l, 't'));
  const n = hojas.length, W = 900, H = Math.max(420, 130 + n * 46);
  const cx = W / 2, cy = H / 2, rx = W * 0.34, ry = H * 0.36;
  let ramas = '', nodos = '';
  hojas.forEach((txt, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry;
    const mx = cx + Math.cos(ang) * rx * 0.55, my = cy + Math.sin(ang) * ry * 0.55;
    ramas += `<path d="M ${cx} ${cy} Q ${mx} ${my} ${x} ${y}" fill="none"
      stroke="${s2.color}" stroke-width="2" opacity=".45" stroke-linecap="round"/>`;
    const izq = Math.cos(ang) < 0;
    nodos += `<g class="mm-leaf">
      <rect x="${x - (izq ? 170 : 0)}" y="${y - 17}" width="170" height="34" rx="12"
        fill="var(--card)" stroke="${s2.color}" stroke-opacity=".5"/>
      <text x="${x + (izq ? -160 : 10)}" y="${y + 4.5}" class="mm-t">${recortar(txt, 22)}</text>
    </g>`;
  });
  return `<div class="card fmt-body">
    <p class="fmt-lead">${t('selMental')}</p>
    <svg class="mapa" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tx(tema, 't')}">
      ${ramas}
      <ellipse cx="${cx}" cy="${cy}" rx="128" ry="42" fill="${s2.color}" opacity=".14"/>
      <ellipse cx="${cx}" cy="${cy}" rx="122" ry="38" fill="${s2.color}"/>
      <text x="${cx}" y="${cy + 5}" class="mm-c">${recortar(tx(tema, 't'), 20)}</text>
      ${nodos}
    </svg></div>`;
}

/* ---------- Mapa conceptual: jerarquía con enlaces ---------- */
function vistaConcepto(tema, s2) {
  const hojas = tema.lecciones.map((l) => tx(l, 't'));
  const cols = 3, filas = Math.ceil(hojas.length / cols);
  const W = 900, H = 190 + filas * 118;
  let cajas = '', lineas = '';
  hojas.forEach((txt, i) => {
    const c = i % cols, f = Math.floor(i / cols);
    const x = 70 + c * ((W - 140) / cols), y = 175 + f * 118, w = (W - 140) / cols - 26;
    lineas += `<path d="M ${W / 2} 96 C ${W / 2} 140, ${x + w / 2} 130, ${x + w / 2} ${y}" fill="none"
      stroke="var(--border)" stroke-width="2"/>`;
    lineas += `<rect x="${(W / 2 + x + w / 2) / 2 - 26}" y="${(96 + y) / 2 - 10}" width="52" height="19" rx="9"
      fill="var(--card)" stroke="var(--border)"/>`;
    lineas += `<text x="${(W / 2 + x + w / 2) / 2}" y="${(96 + y) / 2 + 3.5}" class="cm-link">${t('incluye')}</text>`;
    cajas += `<g><rect x="${x}" y="${y}" width="${w}" height="66" rx="14"
        fill="var(--green-soft)" stroke="${s2.color}" stroke-opacity=".45"/>
      ${envolver(txt, 26, x + w / 2, y + 27, 'cm-t')}</g>`;
  });
  return `<div class="card fmt-body">
    <p class="fmt-lead">${t('selConcept')}</p>
    <svg class="mapa" viewBox="0 0 ${W} ${H}">
      ${lineas}
      <rect x="${W / 2 - 190}" y="46" width="380" height="52" rx="16" fill="${s2.color}"/>
      <text x="${W / 2}" y="78" class="cm-c">${recortar(tx(tema, 't'), 34)}</text>
      ${cajas}
    </svg></div>`;
}

/* ---------- Fichas bibliográficas ---------- */
/* Cada lección de la malla trae su propio juego de fichas (término al
 * frente, definición al respaldo) en src/content/ingles — ver FICHAS.
 * Las lecciones que todavía no tengan fichas caen de vuelta a una sola
 * tarjeta con el título y el texto de relleno t('fichaEmpty'), que es
 * como se comportaba toda esta vista antes de que existiera contenido. */
function vistaFichas(tema, s2) {
  const lang = getLang();
  let n = 0;
  const fichas = tema.lecciones.map((l) => {
    const mazo = FICHAS[l.id] || [];
    if (!mazo.length) {
      n += 1;
      return tarjetaFicha(n, tx(l, 't'), t('fichaEmpty'), tx(l, 't'), s2);
    }
    return mazo.map((f) => {
      n += 1;
      const dorso = (lang === 'en' && f.d_en) ? f.d_en : f.d;
      return tarjetaFicha(n, f.t, dorso, tx(l, 't'), s2);
    }).join('');
  }).join('');
  return `<div class="card fmt-body">
    <p class="fmt-lead">${t('selFichas')}</p>
    <div class="fichas-grid">${fichas}</div></div>`;
}

function tarjetaFicha(n, frente, dorso, origen, s2) {
  return `<button class="ficha" data-action="flip-ficha">
      <div class="fi-front" style="border-top:4px solid ${s2.color}">
        <span class="fi-n">${String(n).padStart(2, '0')}</span>
        <b>${frente}</b>
        <small>${origen}</small>
      </div>
      <div class="fi-back" style="background:${s2.ring}">
        <p>${dorso}</p>
      </div>
    </button>`;
}

/* ================== REPASO DEL PERIODO ================== */

/* El repaso vive por unidad (un periodo de la malla), no por lección:
 * trae el resumen del periodo, sus puntos clave y su propio banco de
 * preguntas. Se abre en el mismo #lessonModal que las lecciones. */
function abrirRepaso(unidadId) {
  const r = REPASOS[unidadId];
  if (!r) return;
  const lang = getLang();
  const resumen = (lang === 'en' ? r.resumen_en : r.resumen_es) || '';
  const titulo = (lang === 'en' && r.titulo_en) ? r.titulo_en : r.titulo;
  const claves = (r.puntos_clave || [])
    .map((par) => `<li>${lang === 'en' ? (par[1] || par[0]) : par[0]}</li>`).join('');
  const preguntas = QUIZ_POR_UNIDAD[unidadId] || [];

  document.getElementById('lessonModalBody').innerHTML = `
    <h2>${ic('sparkles')} ${titulo}</h2>
    <div class="lm-meta">${t('repasoPeriodo')} · ${preguntas.length} ${t('questionsWord')}</div>
    <div style="margin:10px 0 4px">
      <button class="speak-btn" id="btnLeer" data-action="leer-leccion">
        🔊 <span>${t('listen')}</span><span class="wave"><i></i><i></i><i></i></span>
      </button>
    </div>
    <article id="lessonArticle">
      ${resumen}
      ${claves ? `<h4>${t('puntosClave')}</h4><ul>${claves}</ul>` : ''}
    </article>
    <div class="lm-foot">
      <button class="link-btn" data-action="close-lesson-modal">${t('close')}</button>
      ${preguntas.length
        ? `<button class="btn-green" data-action="quiz-unidad" data-id="${unidadId}">${t('quizPeriodo')}</button>`
        : `<span class="tag-done">${t('repasoSinQuiz')}</span>`}
    </div>`;
  document.getElementById('lessonModal').classList.add('open');
}

/* Publica las preguntas del periodo en QUIZ_BANK con la clave de la
 * unidad y arranca el quiz cronometrado con esa clave. screens/quiz.js
 * resuelve el color y el nombre de la materia a partir del prefijo del
 * id (ver materiaDe() allí), así que no hace falta que SUBJECTS conozca
 * cada unidad. */
function quizDeUnidad(unidadId) {
  const preguntas = QUIZ_POR_UNIDAD[unidadId];
  if (!preguntas || !preguntas.length) return;
  QUIZ_BANK[unidadId] = preguntas;
  pararVoz();
  closeModal('lessonModal');
  startQuizEstandar(unidadId);
}

/* ================== CABLEADO DE EVENTOS ================== */

function handleAction(action, el) {
  const id = el.dataset.id;
  switch (action) {
    case 'abrir-tema': return abrirTema(el.dataset.materia, id);
    case 'volver-ruta': return volverARuta();
    case 'open-lesson': return openLesson(id);
    case 'complete-lesson': return completeLesson(id);
    case 'abrir-formato': return abrirFormato(el.dataset.format);
    case 'abrir-repaso': return abrirRepaso(id);
    case 'quiz-unidad': return quizDeUnidad(id);
    case 'cerrar-formato': return cerrarFormato();
    case 'leer-formato': return leerFormato();
    case 'leer-leccion': return leerLeccion();
    case 'close-lesson-modal': pararVoz(); return closeModal('lessonModal');
    case 'flip-ficha': return el.classList.toggle('flip');
    default: return;
  }
}

/** Conecta cada clic dentro de #page-lecciones y el #lessonModal compartido vía delegación. Llamar una vez desde app.js. */
export function initLecciones() {
  document.getElementById('page-lecciones')?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) handleAction(el.dataset.action, el);
  });
  document.getElementById('lessonModal')?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) handleAction(el.dataset.action, el);
  });
}
