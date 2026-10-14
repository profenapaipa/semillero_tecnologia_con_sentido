/*
 * services/firebase.js — configuración e inicialización de Firebase
 * =====================================================================
 * Este archivo conecta la app con el proyecto de Firebase "wisfox-c74e9".
 * Se generó siguiendo la configuración que da la consola de Firebase
 * (Configuración del proyecto > tus apps > SDK setup).
 *
 * IMPORTANTE: el "apiKey" de abajo NO es un secreto — Firebase está
 * diseñado para que esta configuración viaje en el navegador del
 * usuario. La seguridad real se controla desde las "Reglas" (Rules) de
 * cada producto de Firebase que uses (Firestore, Storage, etc.) en la
 * consola, no ocultando esta clave.
 *
 * Para usar Firebase en cualquier otro archivo del proyecto, importá
 * lo que necesites desde acá, por ejemplo:
 *   import { app, db } from './services/firebase.js';
 *
 * "db" es la conexión a Firestore (la base de datos) — se usa para
 * guardar y leer información, por ejemplo el progreso de un usuario.
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD6_tcIUF3GuOXd2bffRzL3h5muNud7v8M',
  authDomain: 'wisfox-c74e9.firebaseapp.com',
  projectId: 'wisfox-c74e9',
  storageBucket: 'wisfox-c74e9.firebasestorage.app',
  messagingSenderId: '130220216146',
  appId: '1:130220216146:web:34d07b3ee58eecb28db48b',
  measurementId: 'G-S20D7N45S7',
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
// "experimentalAutoDetectLongPolling" evita el error "NOT_FOUND" en el
// stream de escritura que aparece en algunas redes/routers/antivirus que
// no dejan pasar bien la conexión que Firestore usa por defecto.
// El tercer argumento ('default') es el ID EXACTO de la base de datos
// tal cual se creó en la consola de Firebase — no es el identificador
// especial "(default)" que Firebase usa si no se le indica nada, así
// que hay que pasarlo a mano.
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, 'default');
