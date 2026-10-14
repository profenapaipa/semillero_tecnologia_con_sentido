/*
 * data/curriculum.js — Grados, malla curricular y consultas de temas
 * ========================================================================
 * Origen: wisfo_19.backup.html líneas 1907-2079 (GRADOS, MALLA, TEMAS_BASE,
 * temasDe, temaDone, temaPct, estaHecha, materiaPct).
 *
 * GRADOS: los 6 grados seleccionables (Sexto-Once).
 *
 * MALLA: la malla curricular real — por ahora solo para `ingles`, por
 * grado (6-11), 4 periodos cada uno con subtemas. Tomada del documento
 * de referencia "Proy_tec" según el comentario del código original. Las
 * demás materias caen de vuelta a TEMAS_BASE (grupos de temas planos
 * construidos a partir de lo que haya en LESSONS de data/lessons.js)
 * hasta que se escriba su propia malla con la misma forma que `ingles` aquí.
 *
 * CAMBIO DE DISEÑO respecto al prototipo: temasDe/temaDone/temaPct/
 * estaHecha/materiaPct antes leían silenciosamente los globales `grado`,
 * `lang` y `state` desde donde sea que estuvieran en alcance. Eso fue lo
 * que hizo que el original fuera un solo archivo de 3000 líneas. Aquí
 * reciben `grado`/`lang`/`state` como parámetros explícitos en su lugar,
 * así que este módulo solo depende de otros módulos de *datos*
 * (data/lessons.js, data/subjects.js) — no de state/profile.js ni de
 * state/store.js — lo cual evita una importación circular (profile.js
 * valida `grado` contra GRADOS de aquí; si este archivo también
 * importara `grado` desde profile.js, ninguno de los dos podría cargar
 * primero). Quienes llaman a estas funciones (screens/inicio.js,
 * screens/lecciones.js) ya tienen `grado`/`lang`/`state` a mano y
 * simplemente los pasan.
 */

export const GRADOS = {'6':{es:'Sexto',en:'6th'},'7':{es:'Séptimo',en:'7th'},'8':{es:'Octavo',en:'8th'},
                '9':{es:'Noveno',en:'9th'},'10':{es:'Décimo',en:'10th'},'11':{es:'Once',en:'11th'}};

import { MALLA_INGLES } from '../content/ingles/index.js';

/* La malla de inglés se genera a partir del paquete de contenido
 * (src/content/ingles/*.json, escrito desde "MALLA INGLES 2026.xlsx"), no
 * a mano. Así el orden de las lecciones de la malla y los ids que arma
 * temasDe() de abajo (`ingles-<grado>-<periodo>-<posición>`) no se pueden
 * desincronizar del contenido real. Las demás materias siguen cayendo en
 * TEMAS_BASE hasta que se escriba su propia malla con la misma forma. */
export const MALLA = {
  ingles: MALLA_INGLES,
};

// Materias sin malla todavía: los temas salen de las lecciones que ya existen.
export const TEMAS_BASE = {
  matematicas:[
    {t:'Álgebra y ecuaciones',t_en:'Algebra and equations',ids:['m1']},
    {t:'Funciones y representación',t_en:'Functions and representation',ids:['m2']},
    {t:'Introducción al cálculo',t_en:'Introduction to calculus',ids:['m3']}],
  historia:[
    {t:'Civilizaciones antiguas',t_en:'Ancient civilizations',ids:['h1']},
    {t:'Revoluciones y modernidad',t_en:'Revolutions and modernity',ids:['h2']},
    {t:'Siglo XX y guerra fría',t_en:'20th century and cold war',ids:['h3']}],
  biologia:[
    {t:'La célula',t_en:'The cell',ids:['b1']},
    {t:'Genética y herencia',t_en:'Genetics and heredity',ids:['b2']}],
  economia:[
    {t:'Mercados',t_en:'Markets',ids:['e1']},
    {t:'Indicadores macroeconómicos',t_en:'Macroeconomic indicators',ids:['e2']}]
};

import { LESSONS } from './lessons.js';
import { SUBJECTS } from './subjects.js';

/* Devuelve los temas de una materia, ya sea de la malla o de las lecciones existentes. */
export function temasDe(materia, grado, lang = 'es'){
  const out = [];
  const m = MALLA[materia] && MALLA[materia][grado];
  if(m){
    m.forEach((p,i)=>{
      out.push({
        id: materia+'-'+grado+'-'+(i+1),
        num: i+1,
        periodo: (lang==='en'?'Term ':'Periodo ')+['I','II','III','IV'][i],
        // t es el título que se muestra en español y t_en el de inglés: el
        // documento de la malla nombra las unidades en inglés, así que t_es
        // trae la traducción y t_en conserva el nombre original.
        t: p.t_es || p.t, t_en: p.t,
        unidad: p.unidad || (materia+'-'+grado+'-'+(i+1)),
        lecciones: p.sub.map((par,j)=>({
          id: materia+'-'+grado+'-'+(i+1)+'-'+(j+1),
          t: par[0], t_en: par[1], d: par[2] || '10 min', s: materia, malla: true
        }))
      });
    });
  } else {
    (TEMAS_BASE[materia]||[]).forEach((b,i)=>{
      out.push({
        id: materia+'-b'+(i+1), num: i+1,
        periodo: (lang==='en'?'Unit ':'Unidad ')+(i+1),
        t: b.t, t_en: b.t_en,
        lecciones: b.ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean)
      });
    });
  }
  return out;
}
export function temaDone(tema, state){ return tema.lecciones.length>0 && tema.lecciones.every(l=>estaHecha(l.id, state)); }
export function temaPct(tema, state){
  if(!tema.lecciones.length) return 0;
  return Math.round(tema.lecciones.filter(l=>estaHecha(l.id, state)).length / tema.lecciones.length * 100);
}
export function estaHecha(id, state){
  const l = LESSONS.find(x=>x.id===id);
  if(l) return !!l.done;
  return !!state.hechas[id];
}
export function materiaPct(k, grado, lang, state){
  const temas = temasDe(k, grado, lang);
  const todas = temas.reduce((a,t)=>a.concat(t.lecciones),[]);
  if(!todas.length) return SUBJECTS[k].progress||0;
  return Math.round(todas.filter(l=>estaHecha(l.id, state)).length / todas.length * 100);
}
