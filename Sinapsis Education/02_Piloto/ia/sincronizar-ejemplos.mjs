// sincronizar-ejemplos.mjs: copia las respuestas preparadas de Niky desde el guion de la muestra al
// catálogo que lee el servidor.
//
// Uso:   node sincronizar-ejemplos.mjs
//
// Por qué existe: el guion (07_Feria_CCB/recorrido_por_rol.json) es la ÚNICA fuente de los textos
// del recorrido guiado y lo edita la sesión de contenido. El servidor necesita una copia propia
// para responder esos ejemplos al instante, sin llamar a Gemini y sin gastar la cuota gratuita
// (15 por minuto, 500 por día) que se reserva para las preguntas libres. Esta copia se genera, no se
// edita a mano: si se corrige un texto, se corrige en el guion y se vuelve a correr este archivo.
//
// Qué guarda por ejemplo: id (por ejemplo "docente-1"), tarea, estudiante (código), título y el texto
// de la respuesta. Nada más: ni la situación ni las decisiones, que son de la página.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const ORIGEN = path.join(aqui, '..', '..', '07_Feria_CCB', 'recorrido_por_rol.json');
const DESTINO = path.join(aqui, '..', 'app', 'ejemplos-preparados.json');
const TAREAS = ['disenar', 'ajustar', 'ayuda', 'orientar', 'familia', 'coordinar'];

const guion = JSON.parse(readFileSync(ORIGEN, 'utf8'));
const lista = Array.isArray(guion.ejemplos) ? guion.ejemplos : Object.values(guion.ejemplos).flat();

const catalogo = {};
const problemas = [];
for (const e of lista) {
  if (!e.id || !e.niky?.respuesta) { problemas.push(`${e.id || '(sin id)'}: falta id o respuesta de Niky`); continue; }
  if (!TAREAS.includes(e.niky.tarea)) { problemas.push(`${e.id}: tarea "${e.niky.tarea}" fuera del contrato`); continue; }
  if (catalogo[e.id]) { problemas.push(`${e.id}: id repetido`); continue; }
  catalogo[e.id] = { tarea: e.niky.tarea, estudiante: e.estudiante || null, titulo: e.titulo || '', texto: e.niky.respuesta };
}

writeFileSync(DESTINO, JSON.stringify({ origen: 'Sinapsis Education/07_Feria_CCB/recorrido_por_rol.json', estadoDelGuion: guion.estado, ejemplos: catalogo }, null, 2) + '\n');
console.log(`${Object.keys(catalogo).length} ejemplos copiados a app/ejemplos-preparados.json (guion: ${guion.estado}).`);
if (problemas.length) { console.log('Problemas:\n- ' + problemas.join('\n- ')); process.exit(1); }
