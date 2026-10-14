/*
 * screens/perfil.js — hoja de Perfil y configuración (+ selectores de tema/idioma)
 * ======================================================================================
 * Origen: wisfo_19.backup.html líneas 2936-2994 (renderDaltList,
 * aplicarDalt, renderGradoPicks, setGradoWel, setGrado, renderEmojiPick,
 * setAvatar, guardarPerfil, pintarPerfil, openPerfil, closeSheet,
 * openLogros), más renderThemeList (ubicación original en
 * theme/theme.js, líneas 1730-1742) y renderLangList (ubicación original
 * en i18n/index.js, líneas 1638-1645) — ambas reubicadas aquí según las
 * notas TODO de esos archivos, ya que son UI de la hoja de
 * configuración, no código del motor.
 *
 * DOM que le pertenece: todo lo que está dentro de #perfilSheet (ver
 * index.html) — pestañas #panePerfil/#paneConfig, #emojiPick,
 * #gradoPick, #modoSwitch, #themeList, #langList, #daltList, #voicePick
 * — más #welGrados, que vive en la pantalla separada de bienvenida
 * #welcome pero reutiliza renderGradoPicks() (ver screens/bienvenida.js).
 *
 * closeSheet/openLogros son solo reexportaciones de conveniencia desde
 * components/modal.js y screens/logros.js — este archivo no las vuelve
 * a definir.
 *
 * setGrado() también llama a renderQuizHome() de screens/quiz.js,
 * igual que el original — aunque esa pantalla en realidad no lee
 * `grado` en ningún lado; solo va de acompañante en el patrón
 * "refrescar todo" del original.
 */

import { t, tx, getLang, LANGS, setLang, onLanguageChange } from '../i18n/index.js';
import { PALETAS } from '../theme/palettes.js';
import { paleta, modo, applyTheme, setModo, onThemeChange } from '../theme/theme.js';
import { GRADOS } from '../data/curriculum.js';
import { AVATARES, DALTS, DALT_KEY } from '../data/profile-options.js';
import { perfil, grado, dalt, setGrado as setGradoState, setDalt as setDaltState, setAvatar as setAvatarState, setNombre, setFoto } from '../state/profile.js';
import { cargarVoces } from '../services/speech.js';
import { renderQuizHome } from './quiz.js';
import { toast } from '../components/toast.js';
import { leerArchivo } from '../utils/dom.js';
import { ic } from '../components/icons.js';
import { renderOrbit } from '../components/orbit.js';
import { setFilter, volverARuta } from './lecciones.js';

export function renderThemeList() {
  const box = document.getElementById('themeList');
  if (box) {
    box.innerHTML = Object.entries(PALETAS).map(([k, p]) => `
      <button class="pal-opt ${k === paleta ? 'active' : ''}" data-paleta="${k}"
        title="${tx(p, 'name')}" aria-label="${tx(p, 'name')}">
        <span class="pal-dot" style="background:${p.accent}"></span>
        <span class="pal-name">${tx(p, 'name')}</span>
        ${k === paleta ? ic('check', 'pal-ck') : ''}
      </button>`).join('');
  }
  const sw = document.getElementById('modoSwitch');
  if (sw) {
    sw.innerHTML = [['claro', 'sun', 'modoClaro'], ['oscuro', 'moon', 'modoOscuro']]
      .map(([m, i, key]) => `<button data-modo="${m}" class="${m === modo ? 'on' : ''}">${ic(i)}<span>${t(key)}</span></button>`).join('');
  }
}

export function renderLangList() {
  const box = document.getElementById('langList');
  if (!box) return;
  const lang = getLang();
  box.innerHTML = Object.entries(LANGS).map(([k, l]) => `
    <button class="theme-opt ${k === lang ? 'active' : ''}" data-lang="${k}">
      <span class="langcode">${l.code}</span>
      ${l.name}
      ${k === lang ? '<span class="check">✓</span>' : ''}
    </button>`).join('');
}

export function renderDaltList() {
  const box = document.getElementById('daltList');
  if (box) box.innerHTML = DALTS.map((v) => `<button data-dalt="${v}" class="${v === dalt ? 'on' : ''}">${t(DALT_KEY[v])}</button>`).join('');
}

function aplicarDalt(v) {
  setDaltState(v);
  document.documentElement.dataset.dalt = v;
  renderDaltList();
  renderOrbit(setFilter);
}

export function renderGradoPicks() {
  const lang = getLang();
  const html = (attr) => Object.keys(GRADOS).map((g) =>
    `<button data-${attr}="${g}" class="${g === grado ? 'on' : ''}">${lang === 'en' ? GRADOS[g].en : GRADOS[g].es}</button>`).join('');
  const a = document.getElementById('gradoPick'); if (a) a.innerHTML = html('grado');
  const b = document.getElementById('welGrados'); if (b) b.innerHTML = html('grado-wel');
}

/** Selector de grado dentro de la pantalla de bienvenida — solo actualiza el estado local, sin persistencia/toast (equivale al setGradoWel original). */
export function setGradoWel(g) {
  setGradoState(g);
  renderGradoPicks();
}

/** Selector de grado dentro de Configuración — persiste, refresca, y confirma con un toast (equivale al setGrado original). */
export function setGrado(g) {
  setGradoState(g);
  renderGradoPicks();
  renderOrbit(setFilter);
  // volverARuta() borra cualquier tema abierto y muestra la lista de
  // rutas, ya que un cambio de grado invalida el tema de la malla que
  // estuviera abierto — equivale al temaAbierto=null + reset de vista
  // del setGrado() original. También nos llama a renderRuta().
  volverARuta();
  renderQuizHome();
  toast(t('perfilSaved'));
}

export function renderEmojiPick() {
  const box = document.getElementById('emojiPick');
  if (box) {
    box.innerHTML = AVATARES.map((a) =>
      `<button data-avatar="${a}" class="${!perfil.foto && a === perfil.avatar ? 'on' : ''}">${a}</button>`).join('');
  }
}

function setAvatar(a) {
  setAvatarState(a);
  pintarPerfil();
  renderEmojiPick();
}

function guardarPerfil() {
  const i = document.getElementById('inpName');
  if (i) setNombre(i.value.trim());
  pintarPerfil();
}

export function pintarPerfil() {
  const cara = perfil.foto ? `<img src="${perfil.foto}" alt="">` : perfil.avatar;
  ['avatarSide', 'avatarMobile', 'avatarTop', 'avatarBig'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = cara;
  });
  const nombre = perfil.nombre || t('explorer');
  const ns = document.getElementById('userNameSide');
  if (ns) ns.textContent = nombre;
  const gl = document.getElementById('greetLine');
  if (gl) gl.innerHTML = t('greetHi') + nombre + '! 👋';
}

export function openPerfil(tab) {
  document.getElementById('perfilSheet')?.classList.add('open');
  const esP = tab !== 'config';
  document.getElementById('panePerfil').style.display = esP ? '' : 'none';
  document.getElementById('paneConfig').style.display = esP ? 'none' : '';
  document.getElementById('tabPerfil').classList.toggle('on', esP);
  document.getElementById('tabConfig').classList.toggle('on', !esP);
  document.getElementById('perfilHead').textContent = t(esP ? 'perfilTitle' : 'configTitle');
  document.getElementById('inpName').value = perfil.nombre;
  renderEmojiPick();
  renderGradoPicks();
  renderDaltList();
  renderThemeList();
  renderLangList();
  cargarVoces();
}

/** Conecta cada clic/cambio dentro de #perfilSheet vía delegación. Llamar una vez desde app.js. */
export function initPerfil() {
  const sheet = document.getElementById('perfilSheet');
  if (!sheet) return;
  sheet.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'tabPerfil') openPerfil('perfil');
    else if (t.id === 'tabConfig') openPerfil('config');
    else if (t.dataset.paleta) applyTheme(t.dataset.paleta);
    else if (t.dataset.modo) setModo(t.dataset.modo);
    else if (t.dataset.lang) setLang(t.dataset.lang);
    else if (t.dataset.dalt) aplicarDalt(t.dataset.dalt);
    else if (t.dataset.grado) setGrado(t.dataset.grado);
    else if (t.dataset.avatar) setAvatar(t.dataset.avatar);
  });
  document.getElementById('inpName')?.addEventListener('input', guardarPerfil);
  document.getElementById('fileAvatar')?.addEventListener('change', function () {
    // Origen: wisfo_19.backup.html líneas 3246-3248 — faltaba en el
    // portado inicial de este archivo (nada conectaba todavía el
    // `change` de #fileAvatar), se completó aquí junto con los
    // listeners equivalentes #fileNota/#fotoNota de screens/notas.js.
    leerArchivo(this, (f, data) => {
      setFoto(data);
      pintarPerfil();
      renderEmojiPick();
    });
  });

  // Refleja las cascadas originales de applyLang()/applyTheme(), que
  // volvían a renderizar estos mismos selectores como parte de una lista
  // de llamadas mucho más larga — ver las cabeceras de i18n/index.js y
  // theme/theme.js para por qué eso ahora es basado en eventos en vez de
  // estar fijo ahí.
  onThemeChange(renderThemeList);
  onLanguageChange(() => { renderLangList(); renderGradoPicks(); renderDaltList(); });
}
