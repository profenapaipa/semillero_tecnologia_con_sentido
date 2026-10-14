/*
 * app.js — arranque de la aplicación
 * ======================================
 * Origen: el arranque de wisfo_19.backup.html estaba disperso — bloques
 * `try{ localStorage... }` de hidratación a nivel de módulo cerca de
 * cada pieza de estado, y luego una secuencia final al final mismo del
 * <script> (líneas 3250-3257):
 *   document.documentElement.dataset.dalt = dalt;
 *   applyTheme(); applyLang();
 *   if(!perfil.nombre){ renderGradoPicks(); abrir #welcome; enfocar #welName; }
 * Este archivo es esa secuencia, explícita, en un solo lugar.
 *
 * Dos cosas que este archivo hace y que el original no necesitaba:
 *
 * 1. CABLEADO DE RE-RENDERIZADO. El applyLang()/applyTheme() original
 *    llamaba directamente a ~15-20 funciones de renderizado de cada
 *    pantalla por nombre. Dividir en módulos obligó a que eso se volviera
 *    basado en eventos (ver i18n/index.js onLanguageChange,
 *    theme/theme.js onThemeChange, state/store.js onXPChange) — este
 *    archivo es donde todo se suscribe.
 *
 * 2. EL PUENTE DE WINDOW. index.html conservó un puñado de los atributos
 *    `onclick="fn(...)"` en línea del prototipo por fidelidad (ver el
 *    comentario de cabecera del propio index.html) — específicamente los
 *    que están en marcado compartido entre pantallas (disparadores de
 *    perfil/logros en la barra lateral/superior, botones de cerrar
 *    modal) donde ninguna pantalla en particular es la dueña natural del
 *    elemento mediante delegación. Los manejadores en línea solo pueden
 *    llamar funciones *globales*, pero todo aquí es un módulo ES — nada
 *    es global por defecto — así que el puente de abajo expone
 *    justamente esas funciones. El marcado *propio* generado por cada
 *    pantalla, y su marcado estático propio, usa delegación de eventos
 *    real en su lugar (busca "event delegation" en index.html para ver
 *    la sección de cada pantalla).
 *
 * Las 9 pantallas están cableadas abajo: Inicio, Lecciones, Quiz, Notas,
 * Recursos, Mudy Aslan (chat del tutor), Logros, Bienvenida, Perfil.
 */

import { hydrateState } from './state/store.js';
import { hydrateProfile, perfil, dalt, setVozURI } from './state/profile.js';
import { hydrateTheme, applyTheme } from './theme/theme.js';
import { applyLang, onLanguageChange, t } from './i18n/index.js';
import { toast } from './components/toast.js';
import { initNavigation, go } from './components/navigation.js';
import { initModalShortcuts, closeModal, closeSheet } from './components/modal.js';
import { renderInicio, initInicio } from './screens/inicio.js';
import { renderResources, initRecursos } from './screens/recursos.js';
import { renderAchievements, openLogros } from './screens/logros.js';
import { resetChat, initTutora } from './screens/tutora.js';
import { openPerfil, pintarPerfil, initPerfil } from './screens/perfil.js';
import { initBienvenida, showBienvenida } from './screens/bienvenida.js';
import { cargarVoces, probarVoz } from './services/speech.js';
import { renderRuta, initLecciones } from './screens/lecciones.js';
import { renderQuizHome, initQuiz, startQuiz } from './screens/quiz.js';
import { renderNotas, initNotas } from './screens/notas.js';
import { cargarContenido } from './services/content.js';
import { hydratePlan } from './state/plan.js';
import { renderPlanStrip, renderProHints, initPlanes } from './screens/planes.js';

function wireWindowBridge() {
  Object.assign(window, {
    go,
    t,
    toast,
    openPerfil,
    openLogros,
    closeSheet,
    closeModal,
    probarVoz,
    startQuiz,
    setVoz: (uri) => { setVozURI(uri); },
  });
}

function wireRerenderOnChange() {
  // Refleja la cascada original de applyLang() — cada pantalla vuelve a
  // renderizar su contenido traducido cuando cambia el idioma.
  onLanguageChange(() => {
    renderInicio();
    renderRuta();
    renderResources();
    renderAchievements();
    renderQuizHome();
    renderNotas();
    resetChat();
    pintarPerfil();
    cargarVoces();
  });
}

function maybeShowWelcome() {
  if (perfil.nombre) return;
  showBienvenida();
  setTimeout(() => document.getElementById('welName')?.focus(), 350);
}

export async function initApp() {
  // Antes de hidratar el estado: hydrateState() marca lecciones como
  // "hechas" buscándolas en LESSONS, así que LESSONS ya tiene que estar
  // lleno (con el contenido de Firestore) para ese momento — ver
  // services/content.js.
  await cargarContenido();

  hydrateState();
  hydrateProfile();
  hydrateTheme();
  hydratePlan();

  document.documentElement.dataset.dalt = dalt;
  applyTheme();
  applyLang();

  wireWindowBridge();
  wireRerenderOnChange();

  initNavigation();
  initModalShortcuts();
  initInicio();
  initRecursos();
  initTutora();
  initPerfil();
  initBienvenida();
  initLecciones();
  initQuiz();
  initNotas();
  initPlanes();

  renderInicio();
  renderRuta();
  renderResources();
  renderAchievements();
  renderQuizHome();
  renderNotas();
  resetChat();
  pintarPerfil();
  cargarVoces();
  renderPlanStrip();
  renderProHints();

  maybeShowWelcome();

  // Ya está todo dibujado: sacamos la pantalla de "Cargando…" de index.html.
  document.getElementById('cargaInicial')?.remove();
}
