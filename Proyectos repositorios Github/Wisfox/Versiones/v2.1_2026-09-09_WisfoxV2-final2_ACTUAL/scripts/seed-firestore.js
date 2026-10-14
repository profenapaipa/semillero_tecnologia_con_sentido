/*
 * scripts/seed-firestore.js — sube el contenido de lecciones y quizzes a Firestore
 * =====================================================================================
 * Qué hace: toma el contenido que hoy vive en src/data/lessons.js y
 * src/data/quizzes.js (el que se escribió a mano en el código) y lo
 * copia a la base de datos Firestore, en dos colecciones: "lessons" y
 * "quizzes".
 *
 * Se corre UNA sola vez, desde la terminal, con:
 *   node scripts/seed-firestore.js
 *
 * A partir de ahí, la app (ver src/services/content.js) lee las
 * lecciones y quizzes desde Firestore en vez de desde estos archivos.
 * Para agregar, editar o borrar contenido de ahí en adelante, hacelo
 * directamente en la consola de Firebase (Firestore Database >
 * colecciones "lessons" / "quizzes") — no hace falta tocar código ni
 * volver a correr este script (a menos que quieras "resetear" el
 * contenido de la base de datos al contenido original del código).
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import { LESSONS, LESSON_CONTENT } from '../src/data/lessons.js';
import { QUIZ_BANK } from '../src/data/quizzes.js';

// Misma configuración que src/services/firebase.js (sin analytics, que
// solo funciona en el navegador, no en este script de terminal).
const firebaseConfig = {
  apiKey: 'AIzaSyD6_tcIUF3GuOXd2bffRzL3h5muNud7v8M',
  authDomain: 'wisfox-c74e9.firebaseapp.com',
  projectId: 'wisfox-c74e9',
  storageBucket: 'wisfox-c74e9.firebasestorage.app',
  messagingSenderId: '130220216146',
  appId: '1:130220216146:web:34d07b3ee58eecb28db48b',
};

const app = initializeApp(firebaseConfig);
// "experimentalAutoDetectLongPolling" evita el error "NOT_FOUND" en el
// stream de escritura que aparece en algunas redes/routers/antivirus.
// El tercer argumento ('default') es el ID EXACTO de la base de datos
// tal cual se creó en la consola de Firebase — no es el identificador
// especial "(default)" que Firebase usa si no se le indica nada, así
// que hay que pasarlo a mano.
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, 'default');

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
    console.log('  ✓ Lección subida:', l.id, '-', l.t);
  }
}

async function subirQuizzes() {
  for (const materia of Object.keys(QUIZ_BANK)) {
    await setDoc(doc(db, 'quizzes', materia), { preguntas: QUIZ_BANK[materia] });
    console.log('  ✓ Quiz subido:', materia, '(' + QUIZ_BANK[materia].length + ' preguntas)');
  }
}

async function main() {
  console.log('Subiendo lecciones a Firestore...');
  await subirLecciones();
  console.log('\nSubiendo quizzes a Firestore...');
  await subirQuizzes();
  console.log('\n¡Listo! Todo el contenido quedó en Firestore.');
  console.log('Ahora abrí la app (npm run dev) — va a cargar las lecciones y quizzes desde ahí.');
  process.exit(0);
}

main().catch((e) => {
  console.error('\nHubo un error subiendo el contenido:', e.message || e);
  process.exit(1);
});
