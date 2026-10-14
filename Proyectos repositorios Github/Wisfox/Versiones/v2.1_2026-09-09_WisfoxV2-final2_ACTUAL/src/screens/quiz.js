/*
 * screens/quiz.js — pantalla de Evaluaciones (quiz cronometrado + minijuegos)
 * =================================================================================
 * Origen: wisfo_19.backup.html líneas 2532-2874 (renderQuizHome,
 * elegirMateria, startQuiz, pararReloj/arrancarReloj/reloj,
 * renderQuestion, answer, showQuizResult, exitQuiz, arrancarJuego,
 * cabeceraJuego, juegoVF/pintarVF/respVF, juegoMemoria/pintarMemoria/
 * voltear, juegoOrdena/pintarOrdena/mover/comprobarOrden, juegoPendiente,
 * finJuego).
 *
 * DOM que le pertenece (ver index.html #page-quiz):
 *   #quizHome — selector de materia/modo + tira de logros.
 *   #quizBox  — la superficie activa de quiz/juego (oculta hasta que empieza).
 *
 * CAMBIO respecto al original: cada `onclick="fn(...)"` en el marcado
 * generado se convirtió en un par `data-action`/`data-*` manejado por un
 * listener delegado en #page-quiz (ver initQuiz()) — mismo razonamiento
 * que screens/lecciones.js y screens/recursos.js.
 *
 * `startQuiz(key)` también es el destino de la tarjeta de evento estática
 * "Quiz de Matemáticas" de Inicio en index.html
 * (`onclick="startQuiz('matematicas')"`) — eso está fuera de #page-quiz,
 * así que se queda en el puente de window (ver app.js) en vez de en la
 * delegación de esta pantalla.
 *
 * 'atrapa' (la 4ª tarjeta de minijuego) intencionalmente no tiene juego
 * propio — arrancarJuego() cae en juegoPendiente(), un relleno
 * "próximamente". Eso es por diseño en el código fuente, no un bug — ver
 * la cabecera de data/quizzes.js.
 */

import { SUBJECTS } from '../data/subjects.js';
import { QUIZ_BANK, MINIJUEGOS, LIMITE } from '../data/quizzes.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { t, tx, quizTitle } from '../i18n/index.js';
import { recortar } from '../utils/format.js';
import { ic } from '../components/icons.js';
import { go } from '../components/navigation.js';
import { state, addXP, save } from '../state/store.js';

let quiz = null;
let modoQuiz = 'std';

/* La clave de un quiz puede ser una materia ('ingles') o una unidad de
 * la malla ('ingles-6-1', que publica screens/lecciones.js al abrir el
 * repaso de un periodo). En el segundo caso la materia es el prefijo
 * antes del primer guion, así que SUBJECTS no necesita conocer cada
 * unidad para que el quiz tenga su color, su ícono y su nombre. */
function materiaDe(key) {
  return SUBJECTS[key] || SUBJECTS[String(key).split('-')[0]] || SUBJECTS.ingles;
}

/* ================== HOME ================== */

export function renderQuizHome() {
  const box = document.getElementById('quizHome');
  if (!box) return;
  const medallas = ACHIEVEMENTS.slice(0, 5).map((a, i) =>
    `<span class="medalla ${a.un ? '' : 'off'}" style="${a.un ? 'background:' + ['#7c5ce6', '#e8a13c', '#4a9fd8', '#3d9960', '#8a63d2'][i] : ''}"
      title="${tx(a, 't')}">${a.un ? ic('star', 'ic-fill') : ic('lock')}</span>`).join('');

  box.innerHTML = `
    <h3 class="q-lead">${t('comoEvaluar')}</h3>
    <div class="modos-q">
      <div class="card modo-card std">
        <div class="mc-head">
          <div class="mc-ic">${ic('file')}</div>
          <div><b>${t('modoStd')}</b><span>${t('modoStdSub')}</span></div>
        </div>
        <div class="q-demo">
          <div class="qd-top"><span>${t('questionWord')} 2 / 5</span>
            <span class="qd-time">${ic('clock')}00:18</span></div>
          <div class="qd-bar"><i style="width:40%"></i></div>
          <div class="qd-q">${t('demoQ')}</div>
          <div class="qd-opts">
            ${['A', 'B', 'C', 'D'].map((L, i) => `<span class="qd-opt ${i === 1 ? 'sel' : ''}">
              <span class="ltr">${L}</span>${t('demoO' + i)}
              ${i === 1 ? '<span class="mark">' + ic('check') + '</span>' : ''}</span>`).join('')}
          </div>
          <div class="qd-res">
            <div>${ic('trophy')}<span><b>${t('demoOk')}</b><small>+80 XP</small></span></div>
            <div>${ic('clock')}<span><b>00:18</b><small>${t('demoFast')}</small></span></div>
          </div>
        </div>
        <button class="btn-green" style="width:100%" data-action="elegir-materia" data-modo="std">
          ${ic('play', 'ic-fill')}<span>${t('startStd')}</span></button>
      </div>

      <div class="card modo-card game">
        <div class="mc-head">
          <div class="mc-ic">${ic('gamepad')}</div>
          <div><b>${t('modoGame')}</b><span>${t('modoGameSub')}</span></div>
        </div>
        <div class="games-grid">
          ${MINIJUEGOS.map((g) => `
            <div class="game-tile" data-action="elegir-materia" data-modo="${g.k}">
              <b>${t('game_' + g.k)}</b>
              <div class="gt-art" style="color:${g.color}">${ic(g.ic)}</div>
              <div class="gt-pts"><span>${t('puntosWord')}</span>
                ${[0, 1, 2].map((i) => `<span class="${i < g.estrellas ? 'on' : ''}">${ic('star', i < g.estrellas ? 'ic-fill' : '')}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
        <button class="btn-warn" style="width:100%" data-action="elegir-materia" data-modo="juegos">
          ${ic('gamepad')}<span>${t('exploreGames')}</span></button>
      </div>
    </div>

    <div class="card logros-strip">
      <span class="lab">${ic('trophy')}<span>${t('tusLogros')}</span></span>
      <div class="medallas">${medallas}</div>
      <span class="ls-msg">${ic('sparkles')}<span><b>${t('sigueAsi')}</b><span>${t('sigueAsiSub')}</span></span></span>
    </div>`;
}

/* Elegir materia antes de arrancar cualquier modalidad. */
function elegirMateria(m) {
  modoQuiz = m === 'juegos' ? 'vf' : m;
  const box = document.getElementById('quizBox');
  document.getElementById('quizHome').style.display = 'none';
  box.style.display = 'block';
  box.innerHTML = `
    <div class="fmt-bar">
      <button class="crumb-back" data-action="exit-quiz">${ic('left')}<span>${t('backToQuizzes')}</span></button>
      <b>${t(modoQuiz === 'std' ? 'modoStd' : 'game_' + modoQuiz)}</b>
    </div>
    <p class="fmt-lead">${t('pickSubject')}</p>
    <div class="fmt-grid">${Object.keys(QUIZ_BANK).filter((k) => SUBJECTS[k]).map((k) => {
      const s2 = SUBJECTS[k];
      return `<div class="card fmt-card" data-action="start-quiz" data-key="${k}">
        <div class="fic" style="background:${s2.ring};color:${s2.color}">${ic(s2.ik)}</div>
        <b>${tx(s2, 'name')}</b>
        <p>${QUIZ_BANK[k].length} ${t('questionsWord')}</p>
        <div class="go">${ic('right')}</div>
      </div>`;
    }).join('')}</div>`;
}

/** Inicia un quiz/juego para `key` (una clave de materia de QUIZ_BANK en data/quizzes.js). Puenteada en window para la tarjeta de evento estática de Inicio en index.html. */
/** Arranca el quiz cronometrado (modo estándar) para `key`, sin pasar por el selector de modo. Lo usa el repaso de periodo de screens/lecciones.js. */
export function startQuizEstandar(key) {
  modoQuiz = 'std';
  startQuiz(key);
}

export function startQuiz(key) {
  go('quiz');
  quiz = { key, i: 0, score: 0, puntos: 0, locked: false, done: false, modo: modoQuiz, t0: 0, timer: null };
  document.getElementById('quizHome').style.display = 'none';
  document.getElementById('quizBox').style.display = 'block';
  if (quiz.modo === 'std') renderQuestion();
  else arrancarJuego(quiz.modo);
}

/* ---------- Modo estándar: menos tiempo, más puntos ---------- */

function pararReloj() {
  if (quiz && quiz.timer) { clearInterval(quiz.timer); quiz.timer = null; }
}
function arrancarReloj() {
  pararReloj();
  quiz.t0 = Date.now();
  quiz.timer = setInterval(() => {
    const seg = (Date.now() - quiz.t0) / 1000;
    const el = document.getElementById('qTime');
    const barra = document.getElementById('qTimeBar');
    if (!el) { pararReloj(); return; }
    el.textContent = reloj(seg);
    if (barra) barra.style.width = Math.max(0, 100 - (seg / LIMITE) * 100) + '%';
    if (seg >= LIMITE && !quiz.locked) answer(-1);
  }, 200);
}
function reloj(seg) {
  const s2 = Math.min(999, Math.floor(seg));
  return String(Math.floor(s2 / 60)).padStart(2, '0') + ':' + String(s2 % 60).padStart(2, '0');
}

function renderQuestion() {
  const s2 = materiaDe(quiz.key), bank = QUIZ_BANK[quiz.key], q = bank[quiz.i];
  quiz.locked = false;
  document.getElementById('quizBox').innerHTML = `
    <div class="fmt-bar">
      <button class="crumb-back" data-action="exit-quiz">${ic('left')}<span>${t('backToQuizzes')}</span></button>
      <b>${quizTitle(tx(s2, 'name'))}</b>
      <span class="qd-time">${ic('clock')}<b id="qTime">00:00</b></span>
    </div>
    <div class="q-demo" style="margin-bottom:0">
      <div class="qd-top"><span>${t('questionWord')} ${quiz.i + 1} / ${bank.length}</span>
        <span>${quiz.puntos} ${t('puntosWord')}</span></div>
      <div class="qd-bar"><i id="qTimeBar" style="width:100%;background:${s2.color}"></i></div>
      <div class="qd-q">${tx(q, 'q')}</div>
      <div class="qd-opts" id="qOpts">${tx(q, 'o').map((o, j) =>
        `<button class="qd-opt" data-action="answer" data-j="${j}">
          <span class="ltr">${'ABCD'[j]}</span>${o}</button>`).join('')}</div>
      <div id="qFeed"></div>
    </div>`;
  arrancarReloj();
}

function answer(j) {
  if (quiz.locked) return;
  quiz.locked = true;
  pararReloj();
  const seg = (Date.now() - quiz.t0) / 1000;
  const bank = QUIZ_BANK[quiz.key], q = bank[quiz.i];
  const opts = document.querySelectorAll('#qOpts .qd-opt');
  opts.forEach((o) => { o.disabled = true; });
  opts[q.a].classList.add('good');
  opts[q.a].insertAdjacentHTML('beforeend', '<span class="mark">' + ic('check') + '</span>');

  let base = 0, bono = 0;
  if (j === q.a) {
    quiz.score++;
    base = 80;
    bono = Math.max(0, Math.round(20 * (1 - Math.min(seg, LIMITE) / LIMITE)));
    quiz.puntos += base + bono;
    addXP(20);
  } else if (j >= 0) {
    opts[j].classList.add('bad');
    opts[j].insertAdjacentHTML('beforeend', '<span class="mark">' + ic('x') + '</span>');
  }
  const rapido = bono >= 12;
  document.getElementById('qFeed').innerHTML = `
    <div class="qd-res">
      <div>${ic(j === q.a ? 'trophy' : 'x')}<span>
        <b>${j === q.a ? t('demoOk') : (j < 0 ? t('seAcaboTiempo') : t('respIncorrecta'))}</b>
        <small>${j === q.a ? '+' + (base + bono) + ' ' + t('puntosWord') : t('sigueIntentando')}</small></span></div>
      <div>${ic('clock')}<span><b>${reloj(seg)}</b>
        <small>${j === q.a && bono > 0 ? (rapido ? t('demoFast') : t('bonusTiempo') + ' +' + bono) : t('tiempoWord')}</small></span></div>
    </div>`;
  setTimeout(() => {
    quiz.i++;
    if (quiz.i < bank.length) renderQuestion();
    else showQuizResult();
  }, 1500);
}

function showQuizResult() {
  pararReloj();
  const bank = QUIZ_BANK[quiz.key];
  const perfect = quiz.score === bank.length;
  quiz.done = true;
  document.getElementById('quizBox').innerHTML = `
    <div class="quiz-result">
      <div class="big" style="color:var(--green)">${ic(perfect ? 'trophy' : (quiz.score >= 2 ? 'star' : 'zap'))}</div>
      <h3>${quiz.score} / ${bank.length} ${t('correctWord')}</h3>
      <p><b style="font-size:20px;color:var(--green-dark)">${quiz.puntos}</b> ${t('puntosWord')}</p>
      <p>${perfect ? t('quizPerfect') + (quiz.score * 20) + ' XP' : t('quizKeepA') + (quiz.score * 20) + t('quizKeepB')}</p>
      <button class="btn-green" data-action="exit-quiz">${t('backToQuizzes')}</button>
    </div>`;
  save();
}

function exitQuiz() {
  pararReloj();
  quiz = null;
  document.getElementById('quizBox').style.display = 'none';
  document.getElementById('quizHome').style.display = '';
  renderQuizHome();
}

/* ---------- Modo juego ---------- */

function arrancarJuego(k) {
  if (k === 'vf') juegoVF();
  else if (k === 'memoria') juegoMemoria();
  else if (k === 'ordena') juegoOrdena();
  else juegoPendiente();
}

function cabeceraJuego(titulo) {
  return `<div class="fmt-bar">
    <button class="crumb-back" data-action="exit-quiz">${ic('left')}<span>${t('backToQuizzes')}</span></button>
    <b>${titulo}</b><span class="qd-time" id="jPts">0 ${t('puntosWord')}</span></div>`;
}

/* Verdadero o falso: se afirma una opción y hay que juzgarla. */
function juegoVF() {
  const bank = QUIZ_BANK[quiz.key];
  quiz.ronda = 0; quiz.puntos = 0;
  quiz.cartas = bank.map((q) => {
    const cierto = Math.random() < 0.5;
    const opts = tx(q, 'o');
    const idx = cierto ? q.a : (q.a + 1 + Math.floor(Math.random() * (opts.length - 1))) % opts.length;
    return { q: tx(q, 'q'), afirm: opts[idx], cierto };
  });
  pintarVF();
}
function pintarVF() {
  const c = quiz.cartas[quiz.ronda];
  if (!c) return finJuego();
  document.getElementById('quizBox').innerHTML = cabeceraJuego(t('game_vf')) + `
    <div class="card fmt-body" style="text-align:center">
      <p class="fmt-lead">${t('questionWord')} ${quiz.ronda + 1} / ${quiz.cartas.length}</p>
      <div class="vf-q">${c.q}</div>
      <div class="vf-a">${c.afirm}</div>
      <div class="vf-btns">
        <button class="vf-btn ok" data-action="resp-vf" data-v="true">${ic('check')}<span>${t('verdadero')}</span></button>
        <button class="vf-btn no" data-action="resp-vf" data-v="false">${ic('x')}<span>${t('falso')}</span></button>
      </div>
      <div id="vfFeed" class="vf-feed"></div>
    </div>`;
}
function respVF(v) {
  const c = quiz.cartas[quiz.ronda];
  const bien = v === c.cierto;
  if (bien) { quiz.puntos += 50; quiz.score++; addXP(10); }
  document.querySelectorAll('.vf-btn').forEach((b) => { b.disabled = true; });
  document.getElementById('vfFeed').innerHTML =
    `<span class="${bien ? 'ok' : 'no'}">${ic(bien ? 'check' : 'x')} ${bien ? t('demoOk') : t('respIncorrecta')}</span>`;
  document.getElementById('jPts').innerHTML = ic('star') + quiz.puntos + ' ' + t('puntosWord');
  setTimeout(() => { quiz.ronda++; pintarVF(); }, 1100);
}

/* Memoria: emparejar cada pregunta con su respuesta. */
function juegoMemoria() {
  const bank = QUIZ_BANK[quiz.key].slice(0, 4);
  quiz.puntos = 0; quiz.pares = bank.length; quiz.hechos = 0; quiz.sel = [];
  const cartas = [];
  bank.forEach((q, i) => {
    cartas.push({ par: i, txt: recortar(tx(q, 'q'), 46), tipo: 'q' });
    cartas.push({ par: i, txt: recortar(tx(q, 'o')[q.a], 46), tipo: 'a' });
  });
  quiz.cartas = cartas.sort(() => Math.random() - 0.5);
  pintarMemoria();
}
function pintarMemoria() {
  document.getElementById('quizBox').innerHTML = cabeceraJuego(t('game_memoria')) + `
    <div class="card fmt-body">
      <p class="fmt-lead">${t('memoriaHelp')}</p>
      <div class="mem-grid">${quiz.cartas.map((c, i) => `
        <button class="mem-card ${c.ok ? 'ok' : ''} ${quiz.sel.includes(i) ? 'up' : ''}"
          data-action="voltear" data-i="${i}" ${c.ok ? 'disabled' : ''}>
          <span class="mem-back">${ic('sparkles')}</span>
          <span class="mem-front">${c.txt}</span>
        </button>`).join('')}</div>
    </div>`;
}
function voltear(i) {
  if (quiz.sel.length >= 2 || quiz.sel.includes(i) || quiz.cartas[i].ok) return;
  quiz.sel.push(i);
  pintarMemoria();
  if (quiz.sel.length === 2) {
    const [a, b] = quiz.sel.map((x) => quiz.cartas[x]);
    if (a.par === b.par && a.tipo !== b.tipo) {
      a.ok = b.ok = true; quiz.hechos++; quiz.puntos += 60; quiz.score++; addXP(10);
      setTimeout(() => {
        quiz.sel = [];
        if (quiz.hechos === quiz.pares) finJuego(); else pintarMemoria();
      }, 620);
    } else {
      setTimeout(() => { quiz.sel = []; pintarMemoria(); }, 900);
    }
  }
}

/* Ordena: reconstruir la secuencia correcta. */
function juegoOrdena() {
  const bank = QUIZ_BANK[quiz.key];
  quiz.puntos = 0; quiz.ronda = 0;
  quiz.series = bank.map((q) => ({ q: tx(q, 'q'), correcto: tx(q, 'o').slice() }));
  pintarOrdena();
}
function pintarOrdena() {
  const s2 = quiz.series[quiz.ronda];
  if (!s2) return finJuego();
  if (!quiz.mezcla) quiz.mezcla = s2.correcto.map((v, i) => i).sort(() => Math.random() - 0.5);
  document.getElementById('quizBox').innerHTML = cabeceraJuego(t('game_ordena')) + `
    <div class="card fmt-body">
      <p class="fmt-lead">${t('ordenaHelp')}</p>
      <div class="vf-q" style="margin-bottom:14px">${s2.q}</div>
      <div class="ord-list">${quiz.mezcla.map((idx, pos) => `
        <div class="ord-item">
          <span class="ord-n">${pos + 1}</span>
          <span>${s2.correcto[idx]}</span>
          <span class="ord-btns">
            <button data-action="mover" data-pos="${pos}" data-dir="-1" ${pos === 0 ? 'disabled' : ''}>${ic('left')}</button>
            <button data-action="mover" data-pos="${pos}" data-dir="1" ${pos === quiz.mezcla.length - 1 ? 'disabled' : ''}>${ic('right')}</button>
          </span>
        </div>`).join('')}</div>
      <button class="btn-green" style="width:100%;margin-top:14px" data-action="comprobar-orden">
        ${ic('check')}<span>${t('comprobar')}</span></button>
      <div id="ordFeed" class="vf-feed"></div>
    </div>`;
}
function mover(pos, d) {
  const m = quiz.mezcla, n = pos + d;
  if (n < 0 || n >= m.length) return;
  [m[pos], m[n]] = [m[n], m[pos]];
  pintarOrdena();
}
function comprobarOrden() {
  const bien = quiz.mezcla.every((v, i) => v === i);
  if (bien) { quiz.puntos += 70; quiz.score++; addXP(10); }
  document.getElementById('ordFeed').innerHTML =
    `<span class="${bien ? 'ok' : 'no'}">${ic(bien ? 'check' : 'x')} ${bien ? t('demoOk') : t('respIncorrecta')}</span>`;
  setTimeout(() => { quiz.ronda++; quiz.mezcla = null; pintarOrdena(); }, 1200);
}

function juegoPendiente() {
  document.getElementById('quizBox').innerHTML = cabeceraJuego(t('game_atrapa')) + `
    <div class="card fmt-body" style="text-align:center;padding:38px 24px">
      <div style="color:var(--green);margin-bottom:12px">${ic('gamepad')}</div>
      <b style="font-size:16px;display:block;margin-bottom:8px">${t('enConstruccion')}</b>
      <p style="font-size:13px;color:var(--muted);font-weight:700;line-height:1.6;max-width:420px;margin:0 auto">
        ${t('atrapaSoon')}</p>
    </div>`;
}
function finJuego() {
  quiz.done = true;
  document.getElementById('quizBox').innerHTML = `
    <div class="quiz-result">
      <div class="big" style="color:var(--green)">${ic('trophy')}</div>
      <h3>${quiz.puntos} ${t('puntosWord')}</h3>
      <p>${t('quizKeepA')}${quiz.score * 10}${t('quizKeepB')}</p>
      <button class="btn-green" data-action="exit-quiz">${t('backToQuizzes')}</button>
    </div>`;
  save();
}

/* ================== CABLEADO DE EVENTOS ================== */

function handleAction(action, el) {
  switch (action) {
    case 'elegir-materia': return elegirMateria(el.dataset.modo);
    case 'start-quiz': return startQuiz(el.dataset.key);
    case 'exit-quiz': return exitQuiz();
    case 'answer': return answer(Number(el.dataset.j));
    case 'resp-vf': return respVF(el.dataset.v === 'true');
    case 'voltear': return voltear(Number(el.dataset.i));
    case 'mover': return mover(Number(el.dataset.pos), Number(el.dataset.dir));
    case 'comprobar-orden': return comprobarOrden();
    default: return;
  }
}

/** Conecta cada clic dentro de #page-quiz vía delegación. Llamar una vez desde app.js. */
export function initQuiz() {
  document.getElementById('page-quiz')?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) handleAction(el.dataset.action, el);
  });
}
