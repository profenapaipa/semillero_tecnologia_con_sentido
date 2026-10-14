/*
 * screens/tutora.js — pantalla de chat del tutor IA Mudy Aslan / Wisfox
 * ==========================================================================
 * Origen: wisfo_19.backup.html líneas 2504-2521 (resetChat, askTutor,
 * sendChat, escapeHtml — escapeHtml se movió a utils/format.js por ser
 * genérica). Portado por completo, y reconectado para llamar a
 * `askTutor()` de services/tutor-api.js (el cliente de API real/fallback)
 * en vez de llamar directamente a `tutorReply()` de data/tutor-rules.js
 * — ese es todo el sentido de la decisión de "preparar para una API real".
 *
 * NOMBRES: el original tenía una *segunda* función distinta llamada
 * `askTutor(q)` — un pequeño helper de UI que llenaba el input del chat
 * desde un chip de sugerencia y lo enviaba. Eso ahora chocaría con el
 * `askTutor()` de services/tutor-api.js. Se renombró a `askSuggestion(q)`
 * aquí para diferenciarlas; los botones de chip de sugerencia de
 * index.html llaman a esta (ver el listener delegado de initTutora()
 * abajo, que ya lo maneja sin necesitar que ese renombre se refleje en
 * el marcado).
 *
 * DOM que le pertenece: #chatLog, #chatInput, .suggestions (dentro de
 * #page-tutora).
 */

import { t } from '../i18n/index.js';
import { escapeHtml } from '../utils/format.js';
import { askTutor } from '../services/tutor-api.js';

export function resetChat() {
  const log = document.getElementById('chatLog');
  if (log) log.innerHTML = `<div class="msg bot"><span class="who">🦊 Wisfox</span>${t('chatWelcome')}</div>`;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const log = document.getElementById('chatLog');
  log.insertAdjacentHTML('beforeend', `<div class="msg me">${escapeHtml(text)}</div>`);
  input.value = '';
  log.scrollTop = log.scrollHeight;

  const answer = await askTutor(text);
  log.insertAdjacentHTML('beforeend', `<div class="msg bot"><span class="who">🦊 Wisfox</span>${answer}</div>`);
  log.scrollTop = log.scrollHeight;
}

/** Llena el input del chat desde un chip de sugerencia y lo envía (era `askTutor(q)` en el prototipo — ver la nota de NOMBRES arriba). */
function askSuggestion(q) {
  const input = document.getElementById('chatInput');
  input.value = q;
  sendChat();
}

/** Conecta el input del chat, el botón de enviar y los chips de sugerencia. Llamar una vez desde app.js. */
export function initTutora() {
  const page = document.getElementById('page-tutora');
  if (!page) return;
  document.getElementById('chatInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
  page.addEventListener('click', (e) => {
    if (e.target.closest('.chat-input .btn-green')) sendChat();
    const sug = e.target.closest('.suggestions button');
    if (sug) askSuggestion(sug.textContent);
  });
}
