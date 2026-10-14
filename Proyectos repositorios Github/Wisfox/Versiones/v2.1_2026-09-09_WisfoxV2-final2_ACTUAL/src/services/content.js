/*
 * services/content.js — carga el contenido desde Firestore
 * =====================================================================
 * Origen: antes LESSONS/LESSON_CONTENT (data/lessons.js) y QUIZ_BANK
 * (data/quizzes.js) eran contenido fijo, escrito a mano en el código.
 * Este módulo los reemplaza en tiempo de ejecución con lo que haya en
 * Firestore, así el contenido se puede editar desde la consola de
 * Firebase sin tocar código.
 *
 * CÓMO FUNCIONA: LESSONS/LESSON_CONTENT/QUIZ_BANK siguen siendo los
 * mismos arreglos/objetos de siempre (mismas referencias, mismo `export
 * const`) — este módulo los VACÍA y los vuelve a llenar con lo que
 * llega de Firestore, en vez de reemplazarlos por otros nuevos. Así
 * todo el resto de la app (screens/lecciones.js, screens/quiz.js, etc.)
 * sigue funcionando exactamente igual, sin enterarse de que el dato
 * ahora viene de la base de datos. Lo mismo aplica a los mapas del
 * paquete de inglés (content/ingles/index.js).
 *
 * DE DÓNDE SALE CADA COSA
 *   lessons          -> LESSONS + LESSON_CONTENT (las lecciones sueltas
 *                       de demostración de las otras materias).
 *   quizzes          -> QUIZ_BANK (el banco por materia).
 *   ingles_lecciones -> LESSON_CONTENT + FICHAS del contenido de la
 *                       malla de inglés (una lección por documento).
 *   ingles_unidades  -> REPASOS (el repaso de cada periodo).
 *   ingles_quizzes   -> QUIZ_POR_UNIDAD (el quiz de cada periodo).
 *
 * cargarContenido() se llama una vez, al arrancar la app (ver app.js),
 * ANTES de hydrateState() — porque hydrateState() marca lecciones como
 * "hechas" buscándolas dentro de LESSONS, así que LESSONS ya tiene que
 * estar lleno para ese momento.
 *
 * SI FIRESTORE ESTÁ VACÍO O FALLA LA CONEXIÓN: no se toca nada y la app
 * sigue funcionando con el contenido de respaldo que ya trae el código
 * (data/lessons.js, data/quizzes.js y el paquete src/content/ingles) —
 * así nunca se rompe por completo si no hay internet o la base de datos
 * todavía no tiene contenido cargado. Ver scripts/seed-firestore.js y
 * scripts/seed-ingles.js para la primera carga.
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase.js';
import { LESSONS, LESSON_CONTENT } from '../data/lessons.js';
import { QUIZ_BANK } from '../data/quizzes.js';
import { CONTENIDO, FICHAS, REPASOS, QUIZ_POR_UNIDAD, BANCO_MATERIA } from '../content/ingles/index.js';

/* Cuántas preguntas de la malla de inglés entran en el quiz "por
 * materia" de screens/quiz.js. El banco completo tiene cientos, y el
 * quiz cronometrado las recorre todas, así que se toma una muestra. */
const PREGUNTAS_QUIZ_MATERIA = 8;

function muestra(arr, n) {
  return arr.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

/* ================== respaldo local ================== */

/** Vuelca el paquete de src/content/ingles en las estructuras que leen las pantallas. Se corre siempre, antes de consultar Firestore. */
function sembrarInglesLocal() {
  Object.assign(LESSON_CONTENT.es, CONTENIDO.es);
  Object.assign(LESSON_CONTENT.en, CONTENIDO.en);
  if (BANCO_MATERIA.length) {
    QUIZ_BANK.ingles = muestra(BANCO_MATERIA, PREGUNTAS_QUIZ_MATERIA);
  }
}

/* ================== Firestore ================== */

async function cargarLecciones() {
  const snap = await getDocs(collection(db, 'lessons'));
  if (snap.empty) return; // no hay nada en la base todavía: se deja el contenido de respaldo.

  LESSONS.length = 0;
  snap.forEach((docSnap) => {
    const ld = docSnap.data();
    LESSONS.push({ id: docSnap.id, s: ld.s, t: ld.t, t_en: ld.t_en, d: ld.d, done: !!ld.done });
    if (ld.content_es) LESSON_CONTENT.es[docSnap.id] = ld.content_es;
    if (ld.content_en) LESSON_CONTENT.en[docSnap.id] = ld.content_en;
  });
}

async function cargarQuizzes() {
  const snap = await getDocs(collection(db, 'quizzes'));
  if (snap.empty) return; // no hay nada en la base todavía: se deja el contenido de respaldo.

  snap.forEach((docSnap) => {
    const preguntas = docSnap.data().preguntas;
    if (Array.isArray(preguntas) && preguntas.length) QUIZ_BANK[docSnap.id] = preguntas;
  });
}

/* Las lecciones de la malla de inglés no van a la colección "lessons":
 * esa la usa estaHecha() de data/curriculum.js para decidir si una
 * lección lleva su estado de completado en LESSONS o en state.hechas, y
 * meter ahí 180 documentos cambiaría dónde queda guardado el progreso ya
 * existente de los estudiantes. Viven en su propia colección. */
async function cargarInglesLecciones() {
  const snap = await getDocs(collection(db, 'ingles_lecciones'));
  if (snap.empty) return;

  snap.forEach((docSnap) => {
    const l = docSnap.data();
    if (l.content_es) LESSON_CONTENT.es[docSnap.id] = l.content_es;
    if (l.content_en) LESSON_CONTENT.en[docSnap.id] = l.content_en;
    if (Array.isArray(l.fichas)) FICHAS[docSnap.id] = l.fichas;
  });
}

async function cargarInglesUnidades() {
  const snap = await getDocs(collection(db, 'ingles_unidades'));
  if (snap.empty) return;

  snap.forEach((docSnap) => {
    const u = docSnap.data();
    if (u.repaso) REPASOS[docSnap.id] = { ...REPASOS[docSnap.id], ...u.repaso };
  });
}

async function cargarInglesQuizzes() {
  const snap = await getDocs(collection(db, 'ingles_quizzes'));
  if (snap.empty) return;

  snap.forEach((docSnap) => {
    const preguntas = docSnap.data().preguntas;
    if (Array.isArray(preguntas) && preguntas.length) QUIZ_POR_UNIDAD[docSnap.id] = preguntas;
  });
}

/** Deja listo todo el contenido: primero el respaldo local, luego lo que haya en Firestore encima. Llamar una vez desde app.js antes de hidratar el estado. */
export async function cargarContenido() {
  sembrarInglesLocal();
  try {
    await Promise.all([
      cargarLecciones(),
      cargarQuizzes(),
      cargarInglesLecciones(),
      cargarInglesUnidades(),
      cargarInglesQuizzes(),
    ]);
  } catch (e) {
    // Sin internet, sin permisos, o la base de datos todavía no existe:
    // seguimos con el contenido de respaldo en vez de romper la app.
    console.warn('No se pudo cargar el contenido desde Firestore, se usa el contenido local de respaldo.', e);
  }
}
