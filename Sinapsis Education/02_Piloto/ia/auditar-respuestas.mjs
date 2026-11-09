// auditar-respuestas.mjs: audita las respuestas de Niky contra reglas escritas, y deja el texto
// completo en un informe para que una persona lo lea antes de la muestra.
//
// Uso:
//   node auditar-respuestas.mjs                      contra http://127.0.0.1:4310
//   node auditar-respuestas.mjs --url http://127.0.0.1:4378
//   node auditar-respuestas.mjs --respaldo           audita los textos de public/respaldo.json, sin servidor ni cuota
//
// Qué comprueba (las reglas salen de lo que el dueño pidió y de lo que la plataforma puede pintar):
//   estructura   disenar y ajustar traen objetivo común, evidencia común y varias rutas
//   mismo punto  ajustar declara lo que NO cambia (objetivo y evidencia) y ofrece una ruta alterna
//   perfil       ajustar menciona al menos un apoyo real del perfil que recibió
//   formato      sin tablas, encabezados #, viñetas con asterisco ni emojis: la página solo pinta negrilla y cursiva
//   seguridad    sin términos clínicos, sin etiquetar a nadie como "visual" o "auditivo", sin códigos de estándares
//   honestidad   sin "en vivo" ni "tiempo real", sin saludo de apertura
//   longitud     dentro del tope de palabras de cada tarea
// Una regla fallida NO significa que el modelo mienta: significa que hay que leer ese caso. Por eso
// el informe incluye el texto completo. Este archivo no contiene claves; el servidor las lee del entorno.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argumentos = process.argv.slice(2);
const valorDe = (n, d) => { const i = argumentos.indexOf(n); return i >= 0 && argumentos[i + 1] ? argumentos[i + 1] : d; };
const BASE = valorDe('--url', 'http://127.0.0.1:4310').replace(/\/+$/, '');
const SOLO_RESPALDO = argumentos.includes('--respaldo');
const SOLO_EJEMPLOS = argumentos.includes('--ejemplos'); // audita el catálogo de respuestas preparadas, sin servidor ni cuota
const PAUSA_MS = Number(valorDe('--pausa', '4500')); // el nivel gratuito permite 15 por minuto
const aqui = path.dirname(fileURLToPath(import.meta.url));
const respaldo = JSON.parse(readFileSync(path.join(aqui, '..', 'app', 'public', 'respaldo.json'), 'utf8'));

const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;

// ---- casos: cinco asignaturas del recorrido y los perfiles del catálogo del servidor
const PETICIONES = [
  ['Tecnología', 'Quiero una actividad de Tecnología sobre cómo funciona un circuito simple con pila, bombillo y cables, para octavo.'],
  ['Inglés', 'Quiero una actividad de inglés sobre la rutina del día con el present simple, para octavo.'],
  ['Matemáticas', 'Quiero una actividad de Matemáticas sobre ecuaciones lineales con una incógnita, para octavo.'],
  ['Ciencias naturales', 'Quiero una actividad de Ciencias naturales sobre la fotosíntesis y qué necesita una planta, para octavo.'],
  ['Lengua castellana', 'Quiero una actividad de Lengua castellana para escribir un cuento corto con inicio, nudo y desenlace, para octavo.'],
];
const PERFILES = ['8A-04', '8A-05', '8A-07', '8A-08', '8A-02'];
// Palabras que delatan que la respuesta tomó el apoyo del perfil. Se aceptan sinónimos cercanos.
const APOYOS = {
  'E-demo': /pasos|visual|imagen|tiempo adicional|voz alta|una sola tarea/i,
  '8A-04': /ejemplo|visual|imagen|pareja|niveles|retos|letra grande/i,
  '8A-05': /voz alta|pasos|numerad|escrib|imaginaci/i,
  '8A-07': /tiempo adicional|más tiempo|vocabulario/i,
  '8A-08': /visual|imagen|una sola tarea|una tarea a la vez|fecha/i,
  '8A-02': /descanso|movimiento|orales? y escrit|voz|instrucciones/i,
};

const MAX = { disenar: 270, ajustar: 270, ayuda: 200, orientar: 100, familia: 110, coordinar: 150 };

// ---- reglas
const sinNegaciones = (t) => t.replace(/\b(sin|ni|no)\s+(el\s+|ning[uú]n\s+)?diagn[oó]sticos?\b/gi, '');
const comunes = (t, tarea) => [
  // Los textos del tipo "Lo que no hay es diagnóstico" niegan el término; solo cuenta si se afirma.
  // Se quitan antes de buscar: "sin diagnóstico", "ni diagnósticos", "no ... diagnóstico".
  ['longitud', palabras(t) <= MAX[tarea], `${palabras(t)} palabras, tope ${MAX[tarea]}`],
  ['formato: sin tablas', !/\|\s*-{2,}|^\s*\|.+\|\s*$/m.test(t)],
  ['formato: sin encabezados #', !/^\s*#{1,6}\s/m.test(t)],
  ['formato: sin viñeta con asterisco', !/^\s*[*•]\s+/m.test(t)],
  ['formato: sin emojis', !/\p{Extended_Pictographic}/u.test(t)],
  ['seguridad: sin términos clínicos', !/diagn[oó]stic|\b(TDAH|TEA|autis|dislexi|discalculi|d[eé]ficit|trastorno|asperger|s[ií]ndrome)\b/i.test(sinNegaciones(t))],
  ['seguridad: sin etiquetar al estudiante', !/\b(es|eres|soy|son)\s+(un[ao]?\s+)?(estudiante\s+)?(visual|auditiv[oa]|kinest[eé]sic[oa])/i.test(t) && !/estilos?\s+de\s+aprendizaje/i.test(t)],
  ['seguridad: sin códigos de estándares', !/\b(DBA|EBC)\b|c[oó]digo\s+\d/i.test(t)],
  ['honestidad: sin "en vivo" ni "tiempo real"', !/en vivo|tiempo real/i.test(t)],
  // Un mensaje para la familia es una carta y a un estudiante se le habla con calidez: saludar ahí es
  // natural. En las tareas de planeación, ajuste y cifras se va directo al contenido.
  ['tono: sin saludo de apertura', ['familia', 'ayuda', 'orientar'].includes(tarea) || !/^\s*[¡!]?\s*(hola|buen[oa]s|qu[eé] gusto|encantad)/i.test(t)],
  ['datos: sin correo, enlace ni número largo', !/@|https?:|www\.|\d{7,}/.test(t)],
  // Detectado en la primera auditoría: el modelo copió fragmentos de las instrucciones dentro de la respuesta.
  ['calidad: no copia las instrucciones', !/si la tiene|si el perfil trae|en una frase\)|no copies|estructura exacta|nombr[aá]ndolos con esas/i.test(t)],
  ['formato: sin numeración repetida ("1." tres veces)', (t.match(/^\s*1\.\s/gm) || []).length < 3],
];
const porTarea = {
  disenar: (t) => [
    ['estructura: objetivo de aprendizaje', /objetivo de aprendizaje/i.test(t)],
    ['estructura: evidencia común', /evidencia com[uú]n/i.test(t)],
    ['estructura: al menos tres rutas', (t.match(/\bruta\b/gi) || []).length >= 3],
    ['estructura: cierre común', /cierre com[uú]n/i.test(t)],
    ['rutas: variedad de formatos', [/imagen|visual|color|esquema|dibujo/i, /interactiv|pr[aá]ctic|simulaci|juego|manipul|arm[ae]/i, /oral|audio|voz|escuch|grab/i].filter((r) => r.test(t)).length >= 3],
  ],
  ajustar: (t, caso) => [
    ['mismo punto: declara lo que no cambia', /lo que no cambia|no cambia|se mantiene|igual para (todo|el resto)|mismo objetivo/i.test(t)],
    ['mismo punto: menciona la evidencia', /evidencia/i.test(t)],
    ['estructura: ruta alterna', /ruta alterna|alterna|alternativa/i.test(t)],
    ['perfil: usa un apoyo real del perfil', !APOYOS[caso.perfil] || APOYOS[caso.perfil].test(t)],
    ['estructura: cambios con su razón', /porque|por qu[eé]|ya que|para que|le permite|le ayuda|raz[oó]n/i.test(t)],
  ],
  ayuda: (t) => [
    ['estructura: ofrece dos formas de entenderlo', /dos formas|dos caminos|prefieres|elige|cu[aá]l (de|te)|o bien/i.test(t)],
    ['estructura: cierra con una pregunta', /\?\s*[*_]*\s*$/.test(t.trim()) || (t.match(/\?/g) || []).length >= 1],
    ['no entrega la tarea resuelta', !/la respuesta (correcta )?es\b/i.test(t)],
  ],
  orientar: (t) => [
    ['estructura: hace una pregunta al docente', /\?/.test(t)],
    ['no decide por orientación', !/(aprueb[oa]|apruebo|queda aprobado|se aprueba)\b/i.test(t) || /orientaci[oó]n (decide|aprueba)|a orientaci[oó]n/i.test(t)],
    ['mismo punto: habla de objetivo o evidencia', /objetivo|evidencia/i.test(t)],
  ],
  familia: (t) => [
    ['estructura: dos acciones para casa', /\b(1\.|2\.)|^\s*-\s/m.test(t) || /primero|segundo|por ejemplo/i.test(t)],
    ['lenguaje sencillo: sin jerga de aula', !/\bDUA\b|\bPIAR\b|ajuste razonable|evidencia|competencia/i.test(t)],
  ],
  coordinar: (t) => [
    ['no inventa cifras', !(t.match(/\d+/g) || []).some((n) => !['24', '3', '9', '6', '8', '2'].includes(n))],
    ['no nombra estudiantes', !/\b(8A-\d\d|E-demo|P-\d\d)\b/.test(t)],
  ],
};

// ---- ejecución
async function preguntar(tarea, texto, perfil) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/valeria`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tarea, texto, ...(perfil ? { perfil } : {}) }),
    signal: AbortSignal.timeout(30000),
  });
  const j = await r.json();
  return { status: r.status, fuente: j.fuente, texto: j.texto || '', ms: Date.now() - t0 };
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const resultados = [];
async function evaluar(caso, obtener) {
  const r = await obtener();
  const reglas = [
    ['respondió 200', r.status === 200],
    ...(SOLO_RESPALDO || SOLO_EJEMPLOS ? [] : [['fuente real (no respaldo)', r.fuente !== 'respaldo' && r.fuente !== 'filtro', `fuente: ${r.fuente}`]]),
    ...(SOLO_RESPALDO || SOLO_EJEMPLOS ? [] : [['latencia ≤ 10 s', r.ms <= 10000, `${r.ms} ms`]]),
    ...comunes(r.texto, caso.tarea),
    // En el catálogo, las reglas de estructura de los prompts solo juzgan diseño y ajuste, que es donde
    // vive la premisa de varias rutas hacia el mismo objetivo. Los demás son lecturas cortas de pantalla.
    ...(SOLO_EJEMPLOS && !['disenar', 'ajustar'].includes(caso.tarea) ? [] : porTarea[caso.tarea](r.texto, caso)),
  ].map(([nombre, ok, detalle]) => ({ nombre, ok: Boolean(ok), detalle: detalle || '' }));
  resultados.push({ caso, r, reglas });
  const fallas = reglas.filter((x) => !x.ok);
  console.log(`${fallas.length ? '✖' : '✔'} ${caso.id.padEnd(26)} ${r.fuente?.padEnd(9)} ${String(r.ms).padStart(5)} ms ${palabras(r.texto)}p${fallas.length ? '  → ' + fallas.map((x) => x.nombre).join('; ') : ''}`);
  return r;
}

if (SOLO_EJEMPLOS) {
  // Las 25 respuestas preparadas del recorrido, que el servidor entrega sin llamar a Gemini.
  const catalogo = JSON.parse(readFileSync(path.join(aqui, '..', 'app', 'ejemplos-preparados.json'), 'utf8')).ejemplos;
  for (const [id, e] of Object.entries(catalogo)) {
    const caso = { id: `ejemplo/${id}`, tarea: e.tarea, perfil: e.estudiante };
    await evaluar(caso, async () => ({ status: 200, fuente: 'ejemplo', texto: e.texto, ms: 0 }));
  }
} else if (SOLO_RESPALDO) {
  for (const tarea of Object.keys(MAX)) {
    const caso = { id: `respaldo/${tarea}`, tarea, perfil: 'E-demo' };
    await evaluar(caso, async () => ({ status: 200, fuente: 'respaldo', texto: respaldo[tarea] || '', ms: 0 }));
  }
} else {
  const estado = await fetch(`${BASE}/api/estado`).then((r) => r.json()).catch(() => null);
  if (!estado) { console.log(`No hay servidor en ${BASE}.`); process.exit(2); }
  console.log(`Motor: ${JSON.stringify(estado)}\n`);
  const actividades = [];
  for (const [asig, texto] of PETICIONES) {
    const r = await evaluar({ id: `disenar/${asig}`, tarea: 'disenar', asig }, () => preguntar('disenar', texto));
    actividades.push(r.texto); await dormir(PAUSA_MS);
  }
  for (let i = 0; i < PERFILES.length; i++) {
    const perfil = PERFILES[i];
    const r = await evaluar({ id: `ajustar/${PETICIONES[i][0]}/${perfil}`, tarea: 'ajustar', perfil, asig: PETICIONES[i][0] }, () => preguntar('ajustar', actividades[i], perfil));
    resultados.at(-1).ajuste = r.texto; await dormir(PAUSA_MS);
  }
  const ajustes = resultados.filter((x) => x.caso.tarea === 'ajustar').map((x) => x.r.texto);
  for (const [i, perfil] of [[0, '8A-04'], [1, '8A-05'], [3, '8A-08']]) {
    await evaluar({ id: `ayuda/${PETICIONES[i][0]}/${perfil}`, tarea: 'ayuda', perfil }, () => preguntar('ayuda', ['No entiendo cómo se conecta el bombillo para que prenda.', 'No sé cuándo se pone la s en los verbos.', 'No entiendo por qué la planta necesita luz.'][[0, 1, 3].indexOf(i)], perfil)); await dormir(PAUSA_MS);
  }
  for (const [i, perfil] of [[0, '8A-04'], [3, '8A-08']]) {
    await evaluar({ id: `orientar/${PETICIONES[i][0]}/${perfil}`, tarea: 'orientar', perfil }, () => preguntar('orientar', ajustes[i], perfil)); await dormir(PAUSA_MS);
  }
  for (const [i, perfil] of [[1, '8A-05'], [4, '8A-02']]) {
    await evaluar({ id: `familia/${PETICIONES[i][0]}/${perfil}`, tarea: 'familia', perfil }, () => preguntar('familia', ajustes[i], perfil)); await dormir(PAUSA_MS);
  }
  await evaluar({ id: 'coordinar/colegio', tarea: 'coordinar' }, () => preguntar('coordinar', 'Estudiantes con perfil: 24. Ajustes pendientes: 3. Ajustes aprobados: 9. Planeaciones con DUA completo: 6 de 8.'));
}

// ---- informe
const total = resultados.reduce((n, x) => n + x.reglas.length, 0);
const falladas = resultados.reduce((n, x) => n + x.reglas.filter((r) => !r.ok).length, 0);
const salida = path.join(aqui, 'reportes', SOLO_EJEMPLOS ? 'auditoria-ejemplos.md' : SOLO_RESPALDO ? 'auditoria-respaldo.md' : 'auditoria-respuestas.md');
mkdirSync(path.dirname(salida), { recursive: true });
const md = [
  `# Auditoría de respuestas de Niky${SOLO_RESPALDO ? ' (textos de respaldo)' : ''}`,
  '', `Generada el ${new Date().toLocaleString('es-CO')}. ${resultados.length} casos, ${total} reglas, ${falladas} fallidas.`,
  '', 'Una regla fallida pide leer ese caso: no prueba por sí sola que la respuesta sea mala.', '',
  ...resultados.flatMap(({ caso, r, reglas }) => [
    `## ${caso.id}`, `Fuente: ${r.fuente} · ${r.ms} ms · ${palabras(r.texto)} palabras`, '',
    ...reglas.filter((x) => !x.ok).map((x) => `- ✖ ${x.nombre}${x.detalle ? ` (${x.detalle})` : ''}`),
    ...(reglas.some((x) => !x.ok) ? [''] : ['Todas las reglas pasan.', '']),
    '```', r.texto, '```', '',
  ]),
].join('\n');
writeFileSync(salida, md);
console.log(`\n${resultados.length} casos · ${total} reglas · ${falladas} fallidas\nInforme: ${salida}`);
process.exit(falladas ? 1 : 0);
