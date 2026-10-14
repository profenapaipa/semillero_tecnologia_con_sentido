/*
 * screens/planes.js — planes de pago (Freemium / Pro) y avisos de opciones premium
 * ====================================================================================
 * Esta pantalla NO agrega una página ni toca la navegación: solo aporta
 *   1. la franja pequeña arriba de la hoja de Perfil (#planStrip) con el
 *      plan actual y un enlace "Ver planes";
 *   2. la hoja #planesSheet, con los dos planes lado a lado (como la página
 *      de planes de Claude), a la que llevan todos los avisos;
 *   3. las coronitas (`proTag()` / `crown()`) que marcan cada opción Pro
 *      ya existente en la app y abren esa misma hoja al tocarlas.
 *
 * DOM que le pertenece: #planStrip (dentro de #panePerfil) y #planesSheet /
 * #planesBody (ver index.html). Las etiquetas `.pro-tag` de las demás
 * pantallas las inserta renderProHints() — el marcado estático de
 * index.html no se modifica.
 *
 * Nada aquí bloquea funciones: solo informa y enlaza. El estado del plan
 * vive en state/plan.js.
 */

import { t, getLang, onLanguageChange } from '../i18n/index.js';
import { ic } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { isPro, setPlan, onPlanChange, getPais, setPais } from '../state/plan.js';
import { PAISES, TRAMOS_COLEGIOS, formatoMonto } from '../data/precios.js';

const FREE_FEATURES = ['fFree1', 'fFree2', 'fFree3', 'fFree4'];
const PRO_FEATURES = ['fPro1', 'fPro2', 'fPro3', 'fPro4', 'fPro5'];

// Vista de la hoja de planes (solo de sesión): canal de venta y periodo de cobro.
let canal = 'individual';
let periodo = 'mensual';

const monto = (pais, n) => `${pais.moneda}${formatoMonto(n)}`;

/** Coronita suelta (ícono dorado), para marcar una opción Pro dentro de un título. */
export function crown() {
  return `<span class="crown" aria-hidden="true">${ic('crown', 'ic-fill')}</span>`;
}

/** Aviso en forma de botoncito con corona + etiqueta; al tocarlo abre la hoja de planes. */
function proTag(labelKey) {
  return `<button type="button" class="pro-tag" data-open-planes title="${t('proTagTitle')}">${crown()}<span>${t(labelKey)}</span></button>`;
}

/** Etiqueta para el encabezado de una lección (profundidad). Se usa desde screens/lecciones.js. */
export function proDepthTag() {
  return proTag('proTagDepth');
}

export function openPlanes() {
  renderPlanes();
  document.getElementById('planesSheet')?.classList.add('open');
}

/** Franja pequeña arriba de la sección Perfil: plan actual + enlace a los planes. */
export function renderPlanStrip() {
  const box = document.getElementById('planStrip');
  if (!box) return;
  const pro = isPro();
  box.className = `plan-strip ${pro ? 'pro' : ''}`;
  box.innerHTML = `
    <span class="ps-ic">${ic('crown', 'ic-fill')}</span>
    <span class="ps-txt"><b>${t(pro ? 'planStripPro' : 'planStripFree')}</b><small>${t(pro ? 'planStripHintPro' : 'planStripHintFree')}</small></span>
    <button type="button" class="ps-btn" data-open-planes>${t('planSeeBtn')}</button>`;
}

function featureList(keys, pro) {
  return `<ul class="plan-list">${keys.map((k) =>
    `<li>${ic('check')}<span>${t(k)}</span>${pro ? crown() : ''}</li>`).join('')}</ul>`;
}

/** Selector de país + conmutadores de canal (individual/colegios) y de periodo (mensual/anual). */
function controles() {
  const lang = getLang();
  const paises = Object.entries(PAISES).map(([k, p]) =>
    `<option value="${k}" ${k === getPais() ? 'selected' : ''}>${lang === 'en' ? p.en : p.es}</option>`).join('');
  const sw = (attr, actual, opciones) => opciones.map(([v, key]) =>
    `<button type="button" data-${attr}="${v}" class="${v === actual ? 'on' : ''}">${t(key)}</button>`).join('');
  return `
    <div class="plan-ctrl">
      <label>${t('planCountry')}<select class="inp" data-plan-pais>${paises}</select></label>
      <div class="optrow">${sw('plan-canal', canal, [['individual', 'planIndividual'], ['colegios', 'planSchools']])}</div>
      ${canal === 'individual' ? `<div class="optrow">${sw('plan-periodo', periodo, [['mensual', 'planMonthly'], ['anual', 'planAnnual']])}</div>` : ''}
    </div>`;
}

/** Precio de Pro en el país elegido, mensual o anual (con el % de ahorro del anual). */
function precioPro(pais) {
  const anual = periodo === 'anual';
  return `<div class="plan-price">${monto(pais, anual ? pais.anual : pais.mensual)}<small>${t(anual ? 'perYear' : 'perMonth')}</small></div>
    ${anual ? `<div class="plan-save">${t('planSave')} ${pais.ahorro}%</div>` : ''}`;
}

/** Tabla de licencias institucionales: precio por estudiante al año según el tramo. */
function tablaColegios(pais) {
  return `
    <p class="page-sub">${t('schoolsLead')}</p>
    <table class="plan-table">
      <thead><tr><th>${t('schoolsTier')}</th><th>${t('schoolsPrice')}</th></tr></thead>
      <tbody>${TRAMOS_COLEGIOS.map((tr, i) => `<tr><td>${tr}</td><td><b>${monto(pais, pais.colegios[i])}</b></td></tr>`).join('')}</tbody>
    </table>
    <p class="plan-note">${t('schoolsNote')}</p>`;
}

/** Contenido de la hoja de planes: dos tarjetas (Freemium / Pro) o, en el canal colegios, la tabla institucional. */
function renderPlanes() {
  const body = document.getElementById('planesBody');
  if (!body) return;
  const pro = isPro();
  const pais = PAISES[getPais()];
  const cuerpo = canal === 'colegios' ? tablaColegios(pais) : `
    <div class="plan-grid">
      <div class="plan-card ${pro ? '' : 'current'}">
        <h4>${t('planFree')}</h4>
        <div class="plan-price">${t('planFreePrice')}</div>
        <p class="plan-desc">${t('planFreeDesc')}</p>
        <button type="button" class="plan-btn ghost" ${pro ? 'data-plan-set="free"' : 'disabled'}>${t(pro ? 'planBackFree' : 'planCurrent')}</button>
        <div class="plan-inc">${t('planIncludesFree')}</div>
        ${featureList(FREE_FEATURES, false)}
      </div>
      <div class="plan-card pro ${pro ? 'current' : ''}">
        <h4>${crown()}${t('planPro')}</h4>
        ${precioPro(pais)}
        <p class="plan-desc">${t('planProDesc')}</p>
        <button type="button" class="plan-btn" ${pro ? 'disabled' : 'data-plan-set="pro"'}>${t(pro ? 'planActive' : 'planUpgrade')}</button>
        <div class="plan-inc">${t('planIncludesPro')}</div>
        ${featureList(PRO_FEATURES, true)}
      </div>
    </div>`;
  body.innerHTML = `<p class="page-sub">${t('planSub')}</p>${controles()}${cuerpo}`;
}

/**
 * Inserta (o refresca) la coronita de cada opción Pro que vive en una
 * pantalla ya existente, sin tocar el marcado estático: IA avanzada
 * (Mudy Aslan), rutas personalizadas (Lecciones) y mayor profundidad
 * en evaluaciones (Quiz). Es idempotente: quita la etiqueta anterior
 * antes de agregar la nueva, porque applyLang() reescribe el texto de
 * los párrafos [data-i18n] y se la lleva por delante.
 */
export function renderProHints() {
  const targets = [
    ['#page-tutora .page-sub', 'proTagAI'],
    ['#vistaRuta .page-sub', 'proTagRoutes'],
    ['#page-quiz .page-sub', 'proTagDepth'],
  ];
  targets.forEach(([sel, key]) => {
    const p = document.querySelector(sel);
    if (!p) return;
    p.querySelectorAll('.pro-tag').forEach((n) => n.remove());
    p.insertAdjacentHTML('beforeend', ' ' + proTag(key));
  });
}

/** Conecta los enlaces a los planes (delegación global) y los re-renderizados por idioma/plan. Llamar una vez desde app.js. */
export function initPlanes() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-planes]')) {
      openPlanes();
      return;
    }
    const c = e.target.closest('[data-plan-canal]');
    if (c) { canal = c.dataset.planCanal; renderPlanes(); return; }
    const pe = e.target.closest('[data-plan-periodo]');
    if (pe) { periodo = pe.dataset.planPeriodo; renderPlanes(); return; }
    const btn = e.target.closest('[data-plan-set]');
    if (btn) {
      const next = btn.dataset.planSet;
      setPlan(next);
      toast(t(next === 'pro' ? 'planActivated' : 'planDeactivated'));
    }
  });

  document.getElementById('planesBody')?.addEventListener('change', (e) => {
    if (e.target.matches('[data-plan-pais]')) setPais(e.target.value);
  });

  const refresh = () => {
    renderPlanStrip();
    renderProHints();
    if (document.getElementById('planesSheet')?.classList.contains('open')) renderPlanes();
  };
  onLanguageChange(refresh);
  onPlanChange(refresh);
}
