/*
 * services/speech.js — texto-a-voz vía la Web Speech API
 * ============================================================
 * Origen: wisfo_19.backup.html líneas 2886-2929 (estado voces/hablando,
 * cargarVoces, setVoz, probarVoz, hablar, pararVoz, pintarBotonVoz;
 * leerLeccion se dejó afuera a propósito — lee directamente el DOM del
 * modal de lección actualmente abierto, así que pertenece a
 * screens/lecciones.js, que debería llamar a `hablar()` de aquí de la
 * misma forma en que leerFormato() lo hacía en el prototipo para el
 * visor de formato).
 *
 * `setVoz` del original ahora es `setVozURI` de state/profile.js — eran
 * líneas idénticas de una sola línea (`vozURI = uri; savePerfil()`), así
 * que no hay un export separado para ella aquí; importa setVozURI directamente.
 *
 * pintarBotonVoz() apunta a un único botón `#btnLeer` por id, compartido
 * por el disparador de "leer en voz alta" que esté activo en pantalla
 * (modal de lección o una vista de formato de lección) — solo uno puede
 * hablar razonablemente a la vez ya que speechSynthesis en sí es una
 * única cola global.
 */

import { t } from '../i18n/index.js';
import { toast } from '../components/toast.js';
import { vozURI } from '../state/profile.js';
import { getLang } from '../i18n/index.js';

let voces = [];
let hablando = false;

export function isHablando() {
  return hablando;
}

/** Llena el <select> #voicePick (si existe) con las voces del sistema disponibles, primero las del idioma actual. */
export function cargarVoces() {
  if (!('speechSynthesis' in window)) return;
  voces = speechSynthesis.getVoices();
  const sel = document.getElementById('voicePick');
  if (!sel) return;
  if (!voces.length) { sel.innerHTML = `<option>${t('voiceNone')}</option>`; return; }
  const lang = getLang();
  const pref = voces.filter((v) => v.lang.toLowerCase().startsWith(lang === 'en' ? 'en' : 'es'));
  const lista = pref.length ? pref.concat(voces.filter((v) => !pref.includes(v))) : voces;
  sel.innerHTML = `<option value="">${t('voiceAuto')}</option>` +
    lista.map((v) => `<option value="${v.voiceURI}" ${v.voiceURI === vozURI ? 'selected' : ''}>${v.name} · ${v.lang}</option>`).join('');
}

if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = cargarVoces;

export function probarVoz() {
  hablar(t('testPhrase'));
}

export function hablar(texto) {
  if (!('speechSynthesis' in window)) { toast(t('voiceNone')); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  const v = voces.find((x) => x.voiceURI === vozURI);
  if (v) u.voice = v;
  u.lang = v ? v.lang : (getLang() === 'en' ? 'en-US' : 'es-ES');
  u.rate = 0.95;
  u.onend = u.onerror = () => { hablando = false; pintarBotonVoz(); };
  hablando = true;
  pintarBotonVoz();
  speechSynthesis.speak(u);
}

export function pararVoz() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  hablando = false;
  pintarBotonVoz();
}

export function pintarBotonVoz() {
  const b = document.getElementById('btnLeer');
  if (!b) return;
  b.classList.toggle('on', hablando);
  const span = b.querySelector('span');
  if (span) span.textContent = hablando ? t('stopListen') : t('listen');
}
