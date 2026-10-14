/*
 * seed-runner.js — sube lecciones y quizzes a Firestore, corriendo en el navegador
 * ======================================================================================
 * Ver seed.html para el porqué de este archivo. Misma lógica que
 * scripts/seed-firestore.js, pero usando la conexión de Firestore ya
 * configurada de services/firebase.js en vez de crear una nueva — acá
 * corre dentro del navegador, así que el SDK de Firebase se comporta
 * como está pensado (a diferencia de correrlo en una terminal de Node).
 */

import { db } from './services/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import { LESSONS, LESSON_CONTENT } from './data/lessons.js';
import { QUIZ_BANK } from './data/quizzes.js';

const log = document.getElementById('log');

function linea(txt) {
  const p = document.createElement('p');
  p.textContent = txt;
  p.style.margin = '2px 0';
  log.appendChild(p);
  window.scrollTo(0, document.body.scrollHeight);
}

async function subirLecciones() {
  for (const l of LESSONS) {
    await setDoc(doc(db, 'lessons', l.id), {
      s: l.s,
      t: l.t,
      t_en: l.t_en,
      d: l.d,
      done: l.done || false,
      content_es: (LESSON_CONTENT.es && LESSON_CONTENT.es[l.id]) || '',
      content_en: (LESSON_CONTENT.en && LESSON_CONTENT.en[l.id]) || '',
    });
    linea('✓ Lección subida: ' + l.id + ' - ' + l.t);
  }
}

async function subirQuizzes() {
  for (const materia of Object.keys(QUIZ_BANK)) {
    await setDoc(doc(db, 'quizzes', materia), { preguntas: QUIZ_BANK[materia] });
    linea('✓ Quiz subido: ' + materia + ' (' + QUIZ_BANK[materia].length + ' preguntas)');
  }
}

(async () => {
  try {
    linea('Subiendo lecciones…');
    await subirLecciones();
    linea('Subiendo quizzes…');
    await subirQuizzes();
    linea('');
    linea('¡LISTO! Todo el contenido quedó en Firestore.');
    linea('Ya podés cerrar esta pestaña y abrir la app normal.');
  } catch (e) {
    linea('');
    linea('ERROR: ' + (e.message || e));
  }
})();
