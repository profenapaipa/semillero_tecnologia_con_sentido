/*
 * screens/notas.js — pantalla de Notas (notas subidas/escritas/foto + panel de asistencia IA)
 * ==================================================================================================
 * Origen: wisfo_19.backup.html líneas 3022-3179 (setVistaNotas,
 * renderNotas, renderIA, setIAFormato, conceptosDe, pintarPreview,
 * generarIA, guardarGenerado, nuevaNota, abrirNota, guardarNota,
 * borrarNota, subirDocumento, tomarFoto, agregarNota, nuevoResaltado) más
 * los listeners `change` de #fileNota/#fotoNota (líneas originales
 * 3232-3245). `leerArchivo()` en sí vive en utils/dom.js — compartida
 * con la subida de foto de avatar en screens/perfil.js.
 *
 * DOM que le pertenece (ver index.html #page-notas):
 *   #notasGrid, #notaBuscar/#notaOrden/#vGrid/#vList, el panel de
 *   asistencia "ia-rail" (#iaOpts/#iaFile/#iaTabs/#iaCanvas),
 *   #fileNota/#fotoNota (inputs de archivo ocultos), y la edición de
 *   notas reutiliza el overlay compartido
 *   #lessonModal/#lessonModalBody (también usado por
 *   screens/lecciones.js — el listener delegado de cada pantalla solo
 *   actúa sobre sus propios valores `data-action`, así que compartir el
 *   contenedor es seguro).
 *
 * BUG CORREGIDO (no reproducido): el abrirNota() original leía
 * `(NOTA_TIPO[n.tipo]||NOTA_TIPO.texto).ic` para el ícono de la cabecera
 * del modal, pero las entradas de NOTA_TIPO en data/notes.js solo tienen
 * un campo `icn`, no `ic` — esa búsqueda siempre daba `undefined`, así
 * que la cabecera literalmente renderizaba el texto "undefined" antes
 * del título de la nota. Corregido aquí para usar `ic(entry.icn)`,
 * igual que la búsqueda de ícono ya usada correctamente en
 * renderNotas() dos líneas arriba en el original.
 *
 * CAMBIO respecto al original: cada `onclick`/`oninput`/`onchange` en el
 * marcado estático de Notas de index.html y en el marcado generado aquí
 * se convirtió en `data-action` + un listener delegado (ver
 * initNotas()) — mismo razonamiento que screens/lecciones.js y screens/quiz.js.
 */

import { NOTA_TIPO, IA_OPTS } from '../data/notes.js';
import { t, tx, getLang } from '../i18n/index.js';
import { escapeHtml, recortar } from '../utils/format.js';
import { ic } from '../components/icons.js';
import { closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { leerArchivo } from '../utils/dom.js';
import { state, save } from '../state/store.js';

let vistaNotas = 'grid';
let iaFormato = 'mental';
let iaNota = null;
let iaTab = 'mental';

/* ================== LISTA ================== */

function setVistaNotas(v) {
  vistaNotas = v;
  document.getElementById('vGrid').classList.toggle('on', v === 'grid');
  document.getElementById('vList').classList.toggle('on', v === 'list');
  renderNotas();
}

export function renderNotas() {
  const g = document.getElementById('notasGrid');
  if (!g) return;
  g.classList.toggle('lista', vistaNotas === 'list');

  const bq = (document.getElementById('notaBuscar') || {}).value || '';
  const orden = (document.getElementById('notaOrden') || {}).value || 'recientes';
  let lista = state.notas.map((n, i) => ({ n, i }));
  if (bq.trim()) {
    const q = bq.trim().toLowerCase();
    lista = lista.filter((x) => (x.n.titulo + ' ' + (x.n.cuerpo || '')).toLowerCase().includes(q));
  }
  if (orden === 'antiguas') lista.reverse();
  else if (orden === 'titulo') lista.sort((a, b) => a.n.titulo.localeCompare(b.n.titulo, 'es'));

  const tarjetas = lista.map(({ n, i }) => {
    const k = NOTA_TIPO[n.tipo] || NOTA_TIPO.texto;
    return `<div class="card nota" data-action="abrir-nota" data-id="${i}">
      <button class="del" data-action="borrar-nota" data-id="${i}" title="${t('delete')}">${ic('x')}</button>
      <div class="nic" style="background:${k.bg};color:${k.c || 'var(--green-dark)'}">${ic(k.icn || 'file')}</div>
      <b>${escapeHtml(n.titulo)}</b>
      <small>${n.fecha}</small>
      <span class="kind" style="background:${k.bg}">${t('tipo_' + n.tipo) || n.tipo}</span>
    </div>`;
  }).join('');

  g.innerHTML = tarjetas + `<button class="card nota nota-add" data-action="nueva-nota">
    ${ic('plus')}<span>${t('notaNueva')}</span></button>`;
  renderIA();
}

/* ---------- Panel del asistente ---------- */

function renderIA() {
  const box = document.getElementById('iaOpts');
  if (!box) return;
  box.innerHTML = IA_OPTS.map((o) =>
    `<button class="ia-opt ${o.k === iaFormato ? 'on' : ''}" data-action="set-ia-formato" data-formato="${o.k}">
      ${ic(o.ic)}<span>${t(o.lab)}</span></button>`).join('');

  if (iaNota === null || !state.notas[iaNota]) iaNota = state.notas.length ? 0 : null;
  const n = iaNota !== null ? state.notas[iaNota] : null;
  document.getElementById('iaFile').innerHTML = n
    ? `${ic('notebook')}<span>${escapeHtml(n.titulo)}</span>
       <button data-action="clear-ia-nota" title="${t('delete')}">${ic('x')}</button>`
    : `${ic('notebook')}<span>${t('iaNoFile')}</span>`;

  const tabs = document.getElementById('iaTabs');
  tabs.innerHTML = [['mental', 'fmt_mental'], ['fichas', 'fmt_fichas']].map(([k, lab]) =>
    `<button class="${k === iaTab ? 'on' : ''}" data-action="set-ia-tab" data-tab="${k}">${t(lab)}</button>`).join('');
  pintarPreview();
}

function setIAFormato(k) {
  iaFormato = k;
  if (k === 'mental' || k === 'fichas') iaTab = k;
  renderIA();
}

/* Divide el cuerpo de la nota en conceptos aprovechables. */
function conceptosDe(nota) {
  if (!nota) return [];
  const txt = (nota.cuerpo || '').replace(/<[^>]+>/g, ' ');
  return txt.split(/[\n·•\-•]|(?<=[.;:])\s/)
    .map((x) => x.trim()).filter((x) => x.length > 3).slice(0, 6);
}

function pintarPreview() {
  const c = document.getElementById('iaCanvas');
  if (!c) return;
  const n = iaNota !== null ? state.notas[iaNota] : null;
  const ideas = conceptosDe(n);
  if (!n || !ideas.length) { c.innerHTML = `<p class="ia-empty">${t('iaEmpty')}</p>`; return; }

  if (iaTab === 'fichas') {
    c.innerHTML = ideas.slice(0, 3).map((x, i) =>
      `<div class="ia-ficha"><span>${String(i + 1).padStart(2, '0')}</span><p>${escapeHtml(recortar(x, 52))}</p></div>`).join('');
    return;
  }
  const W = 280, H = 150, cx = W / 2, cy = H / 2;
  const hojas = ideas.slice(0, 4);
  let ramas = '', nodos = '';
  hojas.forEach((x, i) => {
    const ang = -Math.PI / 2 + (i / hojas.length) * Math.PI * 2;
    const px = cx + Math.cos(ang) * 98, py = cy + Math.sin(ang) * 52;
    ramas += `<path d="M ${cx} ${cy} Q ${(cx + px) / 2} ${(cy + py) / 2} ${px} ${py}" fill="none"
      stroke="var(--green)" stroke-width="1.4" opacity=".5"/>`;
    nodos += `<g><rect x="${px - 42}" y="${py - 11}" width="84" height="22" rx="9"
        fill="var(--card)" stroke="var(--green)" stroke-opacity=".45"/>
      <text x="${px}" y="${py + 3.5}" class="ia-mt">${escapeHtml(recortar(x, 13))}</text></g>`;
  });
  c.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${ramas}
    <ellipse cx="${cx}" cy="${cy}" rx="46" ry="19" fill="var(--green)"/>
    <text x="${cx}" y="${cy + 4}" class="ia-mc">${escapeHtml(recortar(n.titulo, 14))}</text>
    ${nodos}</svg>`;
}

function generarIA() {
  if (iaNota === null || !state.notas[iaNota]) { toast(t('iaPickNote')); return; }
  iaTab = iaFormato === 'fichas' ? 'fichas' : 'mental';
  renderIA();
  toast(t('iaGen') + ': ' + t(IA_OPTS.find((o) => o.k === iaFormato).lab));
}

function guardarGenerado() {
  const n = iaNota !== null ? state.notas[iaNota] : null;
  if (!n) { toast(t('iaPickNote')); return; }
  const ideas = conceptosDe(n);
  agregarNota({
    tipo: 'mapa',
    titulo: t('fmt_' + (iaTab === 'fichas' ? 'fichas' : 'mental')) + ': ' + n.titulo,
    cuerpo: ideas.join('\n'),
  });
  toast(t('iaSaved'));
}

/* ================== CRUD ================== */

function nuevaNota() {
  state.notas.unshift({
    tipo: 'texto',
    titulo: t('notaNuevaTitle'),
    cuerpo: '',
    fecha: new Date().toLocaleDateString(getLang() === 'en' ? 'en-US' : 'es-CO'),
  });
  save();
  renderNotas();
  abrirNota(0);
}

function abrirNota(i) {
  const n = state.notas[i];
  if (!n) return;
  const tipo = NOTA_TIPO[n.tipo] || NOTA_TIPO.texto;
  document.getElementById('lessonModalBody').innerHTML = `
    <h2>${ic(tipo.icn || 'file')} <span contenteditable="true" id="notaTit"
      style="outline:none;border-bottom:2px dashed var(--border)">${escapeHtml(n.titulo)}</span></h2>
    <div class="lm-meta">${n.fecha} · ${n.tipo}</div>
    ${n.img ? `<img src="${n.img}" alt="" style="max-width:100%;border-radius:12px;margin:10px 0">` : ''}
    <textarea class="inp" id="notaCuerpo" rows="9" data-i18n-ph="notaPh"
      placeholder="${t('notaPh')}" style="margin-top:10px;resize:vertical">${escapeHtml(n.cuerpo || '')}</textarea>
    <div class="lm-foot">
      <button class="link-btn" data-action="close-notes-modal">${t('close')}</button>
      <button class="btn-green" data-action="guardar-nota" data-id="${i}">💾 ${t('notaSaved').replace('📓 ', '')}</button>
    </div>`;
  document.getElementById('lessonModal').classList.add('open');
}

function guardarNota(i) {
  const n = state.notas[i];
  if (!n) return;
  n.titulo = document.getElementById('notaTit').textContent.trim() || t('notaNuevaTitle');
  n.cuerpo = document.getElementById('notaCuerpo').value;
  save();
  closeModal('lessonModal');
  renderNotas();
  toast(t('notaSaved'));
}

function borrarNota(i) {
  state.notas.splice(i, 1);
  save();
  renderNotas();
  toast(t('notaBorrada'));
}

function subirDocumento() {
  document.getElementById('fileNota').click();
}

function tomarFoto() {
  document.getElementById('fotoNota').click();
}

function agregarNota(n) {
  state.notas.unshift(Object.assign({ fecha: new Date().toLocaleDateString(getLang() === 'en' ? 'en-US' : 'es-CO') }, n));
  save();
  renderNotas();
}

/**
 * Crea una nota tipo "resaltado" a partir de texto arbitrario — todavía
 * no se llama desde ningún lado en el prototipo (ej. una acción "guardar
 * como nota" sobre contenido de lección sería una llamadora natural). Se
 * deja disponible para cuando eso se diseñe, según la intención del original.
 */
export function nuevoResaltado(texto, origen) {
  agregarNota({ tipo: 'resaltado', titulo: origen, cuerpo: texto });
  toast(t('notaSaved'));
}

/* ================== CABLEADO DE EVENTOS ================== */

function handleAction(action, el) {
  const id = el.dataset.id !== undefined ? Number(el.dataset.id) : undefined;
  switch (action) {
    case 'subir-documento': return subirDocumento();
    case 'tomar-foto': return tomarFoto();
    case 'nueva-nota': return nuevaNota();
    case 'abrir-nota': return abrirNota(id);
    case 'borrar-nota': return borrarNota(id);
    case 'guardar-nota': return guardarNota(id);
    case 'close-notes-modal': return closeModal('lessonModal');
    case 'vista-notas': return setVistaNotas(el.dataset.vista);
    case 'set-ia-formato': return setIAFormato(el.dataset.formato);
    case 'set-ia-tab': iaTab = el.dataset.tab; return renderIA();
    case 'clear-ia-nota': iaNota = null; return renderIA();
    case 'generar-ia': return generarIA();
    case 'guardar-generado': return guardarGenerado();
    default: return;
  }
}

/** Conecta cada clic/input/change dentro de #page-notas, más el #lessonModal compartido y los inputs de archivo ocultos. Llamar una vez desde app.js. */
export function initNotas() {
  const page = document.getElementById('page-notas');
  page?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    // El stopPropagation equivale al botón borrarNota del original
    // (`event.stopPropagation()`), que evita que el clic también
    // burbujee hacia el manejador "abrir-nota" de la tarjeta .nota padre.
    if (el?.dataset.action === 'borrar-nota') e.stopPropagation();
    if (el) handleAction(el.dataset.action, el);
  });
  page?.addEventListener('input', (e) => {
    if (e.target.id === 'notaBuscar') renderNotas();
  });
  page?.addEventListener('change', (e) => {
    if (e.target.id === 'notaOrden') renderNotas();
  });

  document.getElementById('lessonModal')?.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el) handleAction(el.dataset.action, el);
  });

  document.getElementById('fileNota')?.addEventListener('change', function () {
    leerArchivo(this, (f, data) => {
      const esImg = f.type.startsWith('image/');
      agregarNota({
        tipo: esImg ? 'foto' : 'doc',
        titulo: f.name,
        cuerpo: esImg ? '' : String(data).slice(0, 4000),
        img: esImg ? data : '',
      });
      toast(t('notaSubida') + f.name);
    });
  });
  document.getElementById('fotoNota')?.addEventListener('change', function () {
    leerArchivo(this, (f, data) => {
      agregarNota({ tipo: 'foto', titulo: f.name || 'foto.jpg', cuerpo: '', img: data });
      toast(t('fotoGuardada'));
    });
  });
}
