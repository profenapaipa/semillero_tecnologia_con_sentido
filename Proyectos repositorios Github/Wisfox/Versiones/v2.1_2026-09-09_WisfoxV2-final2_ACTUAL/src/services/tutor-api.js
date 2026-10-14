/*
 * services/tutor-api.js — cliente del tutor IA Mudy Aslan / Wisfox
 * =====================================================================
 * Origen: reemplaza el punto de llamada a tutorReply() de
 * wisfo_19.backup.html (líneas 2500-2503, dentro de sendChat()).
 * tutorReply() en sí todavía existe — ver data/tutor-rules.js — y se usa
 * abajo como el fallback sin conexión / de desarrollo.
 *
 * ESTE ES EL ARCHIVO DONDE CONECTAR LA INTEGRACIÓN REAL CON EL LLM. Según
 * la decisión del proyecto, Mudy Aslan debería eventualmente llamar a un
 * modelo real en vez de respuestas enlatadas por coincidencia de regex.
 * Lo que hay aquí es un andamiaje, no una integración funcionando:
 *
 *   1. VITE_TUTOR_API_URL (ver .env.example) debería apuntar a TU PROPIO
 *      endpoint de backend/proxy — nunca llames a un proveedor de LLM
 *      (Anthropic, OpenAI, etc.) directamente desde código del lado del
 *      cliente con una API key desnuda; esa key quedaría embebida en el
 *      bundle de JS compilado, legible por cualquiera. El backend está
 *      fuera del alcance de este esqueleto de frontend (ver la decisión
 *      del proyecto de "solo frontend por ahora") — constrúyelo por
 *      separado y apunta esta URL a él cuando esté listo.
 *   2. La forma de la solicitud/respuesta de abajo (`{ question, history }`
 *      de entrada, `{ answer }` de salida) es una suposición provisional.
 *      Confirma el contrato real con quien construya el backend y ajusta
 *      juntos tanto el cuerpo del fetch como el parseo de la respuesta.
 *   3. Hasta que VITE_TUTOR_API_URL esté configurada, o cada vez que la
 *      solicitud falle (sin conexión, backend caído, respuesta no-2xx),
 *      esto cae de vuelta transparentemente a las respuestas enlatadas
 *      por palabra clave de data/tutor-rules.js — ver la cabecera de ese
 *      archivo para por qué vale la pena conservar ese fallback incluso
 *      después de que la integración real esté en producción.
 *
 * screens/tutora.js debería llamar a `askTutor(text)` y esperar (await)
 * el resultado — no necesita saber si la respuesta vino de la API o del
 * fallback.
 */

import { tutorReply } from '../data/tutor-rules.js';

const API_URL = import.meta.env.VITE_TUTOR_API_URL;

/**
 * @param {string} question - el mensaje de texto libre del estudiante.
 * @param {{history?: Array<{role: 'user'|'assistant', content: string}>}} [opts]
 * @returns {Promise<string>} string tipo HTML, renderizado de la misma
 *   forma que las respuestas enlatadas (ver sendChat() en
 *   screens/tutora.js) — sanitiza o cambia a texto plano si la API real
 *   puede devolver contenido arbitrario influenciado por el usuario.
 */
export async function askTutor(question, { history = [] } = {}) {
  if (!API_URL) {
    return tutorReply(question);
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
    });
    if (!res.ok) throw new Error(`tutor API responded with ${res.status}`);
    const data = await res.json();
    return data.answer; // TODO: confirmar este nombre de campo con el contrato del backend.
  } catch (err) {
    console.warn('[tutor-api] cayendo de vuelta a las respuestas enlatadas:', err);
    return tutorReply(question);
  }
}
