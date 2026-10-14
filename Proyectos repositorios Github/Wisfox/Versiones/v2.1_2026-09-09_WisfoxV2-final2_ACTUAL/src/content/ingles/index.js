/*
 * content/ingles/index.js — carga y agrega el contenido de inglés de la malla
 * ================================================================================
 * Qué hay acá: los 24 archivos `ingles-<grado>-<periodo>.json` de esta
 * misma carpeta son el contenido de inglés escrito a partir de
 * "MALLA INGLES 2026.xlsx" (grados 6º a 11º, 4 periodos cada uno). Cada
 * archivo trae la metadata de la unidad, sus lecciones (con el texto en
 * español e inglés y sus fichas), el quiz de cada lección y el repaso
 * del periodo.
 *
 * Este módulo los junta y arma las estructuras que el resto de la app
 * necesita, sin que ninguna pantalla tenga que saber que el contenido
 * vive en JSON:
 *
 *   UNIDADES        — arreglo de las 24 unidades, ordenado por grado y periodo.
 *   MALLA_INGLES    — la malla con la forma que espera data/curriculum.js.
 *   LECCIONES       — mapa plano id -> lección (para buscar una suelta).
 *   CONTENIDO       — { es: {id: html}, en: {id: html} } para LESSON_CONTENT.
 *   FICHAS          — mapa id -> arreglo de fichas de la lección.
 *   REPASOS         — mapa id-de-unidad -> repaso del periodo.
 *   QUIZ_POR_UNIDAD — mapa id-de-unidad -> todas las preguntas de esa unidad.
 *   BANCO_MATERIA   — una selección de preguntas para el quiz general de inglés.
 *
 * IMPORTANTE — el orden importa: data/curriculum.js arma el id de cada
 * lección como `ingles-<grado>-<periodo>-<posición>` a partir del orden
 * del arreglo `sub` de la malla. Por eso MALLA_INGLES se genera desde el
 * mismo arreglo `lecciones` del JSON, en el mismo orden, y
 * scripts/validar-contenido.py verifica que el id guardado en cada
 * lección coincida con su posición. Si se reordena una lección dentro de
 * un JSON hay que corregir también su `id` y su `num`.
 *
 * El contenido de Firestore, cuando existe, se superpone encima de esto
 * en tiempo de ejecución — ver services/content.js. Este paquete es
 * entonces el respaldo que hace que la app funcione sin internet y sin
 * base de datos cargada.
 */

// Vite resuelve este glob en tiempo de compilación y deja los JSON
// incluidos en el bundle (por eso `eager: true`): no hay peticiones de
// red en tiempo de ejecución para leer el contenido de respaldo.
const modulos = import.meta.glob('./ingles-*.json', { eager: true });

export const UNIDADES = Object.values(modulos)
  .map((m) => m.default || m)
  .sort((a, b) => Number(a.grado) - Number(b.grado) || a.periodo - b.periodo);

/* MALLA_INGLES: { '6': [ {t, t_es, sub: [[es, en, duracion], ...]}, ... ], ... } */
export const MALLA_INGLES = UNIDADES.reduce((acc, u) => {
  (acc[u.grado] = acc[u.grado] || []).push({
    t: u.titulo,
    t_es: u.titulo_es || u.titulo,
    unidad: u.id,
    sub: u.lecciones.map((l) => [l.t, l.t_en, l.d]),
  });
  return acc;
}, {});

export const LECCIONES = {};
export const CONTENIDO = { es: {}, en: {} };
export const FICHAS = {};
export const REPASOS = {};
export const QUIZ_POR_UNIDAD = {};

UNIDADES.forEach((u) => {
  const preguntas = [];
  u.lecciones.forEach((l) => {
    LECCIONES[l.id] = { ...l, unidad: u.id, grado: u.grado, periodo: u.periodo };
    CONTENIDO.es[l.id] = l.content_es;
    CONTENIDO.en[l.id] = l.content_en;
    FICHAS[l.id] = l.fichas || [];
    (l.quiz || []).forEach((q) => preguntas.push({ ...q, leccion: l.id }));
  });
  REPASOS[u.id] = { ...u.repaso, unidad: u.id, grado: u.grado, periodo: u.periodo, titulo_unidad: u.titulo };
  QUIZ_POR_UNIDAD[u.id] = preguntas;
});

/* Banco general de la materia: una muestra repartida entre grados y
 * periodos, para que el quiz "por materia" de screens/quiz.js no dependa
 * de un solo grado. Se toman las dos primeras preguntas de cada unidad. */
export const BANCO_MATERIA = UNIDADES.flatMap((u) =>
  (QUIZ_POR_UNIDAD[u.id] || []).slice(0, 2).map((q) => ({ ...q, grado: u.grado, periodo: u.periodo })),
);

/** Devuelve el id de la unidad a la que pertenece una lección de la malla, o null. */
export function unidadDeLeccion(id) {
  return LECCIONES[id] ? LECCIONES[id].unidad : null;
}
