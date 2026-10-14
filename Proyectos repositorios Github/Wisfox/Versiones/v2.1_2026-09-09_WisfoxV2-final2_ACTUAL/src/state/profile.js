/*
 * state/profile.js — perfil de usuario, grado, accesibilidad y preferencias de voz
 * ======================================================================================
 * Origen: wisfo_19.backup.html líneas 2083-2090 (perfil/grado/dalt/vozURI
 * + hidratación) y líneas 2098-2104 (savePerfil), más los mutadores
 * setGrado/setGradoWel/setAvatar (líneas 2952-2965) y aplicarDalt/setVoz
 * (líneas 2899-2941) — esas piezas ligadas a la UI se recortaron aquí a
 * simples cambios de estado; volver a renderizar después de llamarlas es
 * responsabilidad de quien las llama (screens/perfil.js), mismo patrón
 * que theme/theme.js.
 *
 * perfil.avatar: un emoji de AVATARES en data/profile-options.js, usado
 * a menos que perfil.foto (una URL data: de una foto subida) esté
 * definida.
 * dalt: uno de los DALTS de data/profile-options.js — leído por
 * theme/theme.js para establecer `html[data-dalt]`, que overlays.css usa
 * para la paleta segura para daltónicos (ver la sección DALTONISMO de
 * ese archivo).
 * vozURI: el voiceURI de la voz de SpeechSynthesis elegida — ver
 * services/speech.js.
 */

import { getJSON, setJSON, getStr, setStr } from '../services/storage.js';
import { GRADOS } from '../data/curriculum.js';

export let perfil = { nombre: '', avatar: '🦊', foto: '' };
export let grado = '9';
export let dalt = 'ninguno';
export let vozURI = '';

export function hydrateProfile() {
  const p = getJSON('wisfoxPerfil');
  if (p) perfil = Object.assign(perfil, p);
  const g = getStr('wisfoxGrado');
  if (g && GRADOS[g]) grado = g;
  const d = getStr('wisfoxDalt');
  if (d) dalt = d;
  const v = getStr('wisfoxVoz');
  if (v) vozURI = v;
}

export function saveProfile() {
  setJSON('wisfoxPerfil', perfil);
  setStr('wisfoxGrado', grado);
  setStr('wisfoxDalt', dalt);
  setStr('wisfoxVoz', vozURI);
}

export function setGrado(g) {
  grado = g;
  saveProfile();
}

export function setDalt(d) {
  dalt = d;
  saveProfile();
}

export function setVozURI(uri) {
  vozURI = uri;
  saveProfile();
}

export function setAvatar(emoji) {
  perfil.avatar = emoji;
  perfil.foto = '';
  saveProfile();
}

export function setFoto(dataUrl) {
  perfil.foto = dataUrl;
  saveProfile();
}

export function setNombre(nombre) {
  perfil.nombre = nombre;
  saveProfile();
}
