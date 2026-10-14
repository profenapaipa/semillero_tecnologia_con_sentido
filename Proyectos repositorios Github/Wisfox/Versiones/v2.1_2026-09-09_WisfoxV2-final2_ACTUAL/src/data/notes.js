/*
 * data/notes.js — Estilo por tipo de nota + opciones de formato de generación IA
 * ====================================================================================
 * Origen: wisfo_19.backup.html líneas 3015-3021 (NOTA_TIPO), 3063-3068
 * (IA_OPTS).
 *
 * NOTA_TIPO: ícono/color por tipo de nota (texto/doc/foto/resaltado/mapa),
 * indexado de la misma forma que el campo `.tipo` de las entradas de
 * `state.notas` en state/store.js. Usado por screens/notas.js para
 * renderizar las tarjetas de nota.
 *
 * IA_OPTS: las opciones de "¿Qué quieres generar?" en el panel de
 * asistencia IA de Notas (mental/concept/fichas/resumen). Comparte sus
 * primeras 3 claves con FORMATOS de data/lessons.js — ambos describen
 * "formas de ver/generar contenido" pero para tipos de contenido
 * distintos (una lección vs. una nota del usuario), se mantienen como
 * listas separadas por si llegan a divergir (ej. `resumen` solo tiene
 * sentido para notas).
 */

export const NOTA_TIPO = {
  texto:{icn:'notebook',bg:'#f3eefb',c:'#7c5ce6'},
  doc:{icn:'file',bg:'var(--green-light)',c:'var(--green-dark)'},
  foto:{icn:'image',bg:'#eaf1fb',c:'#4a7fd4'},
  resaltado:{icn:'pen',bg:'#fdf3e3',c:'#c98319'},
  mapa:{icn:'brain',bg:'#eef6f2',c:'#3aa8a0'}
};

export const IA_OPTS = [
  {k:'mental',  ic:'brain',   lab:'fmt_mental'},
  {k:'concept', ic:'network', lab:'fmt_concept'},
  {k:'fichas',  ic:'cards',   lab:'fmt_fichas'},
  {k:'resumen', ic:'file',    lab:'iaResumen'}
];
