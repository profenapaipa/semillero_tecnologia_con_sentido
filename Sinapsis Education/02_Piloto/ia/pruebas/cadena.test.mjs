// Prueba de la cadena de Niky: OpenClaw -> Gemini directo -> respaldo.
//
// Corre con:   node --test "Sinapsis Education/02_Piloto/ia/pruebas/"
//
// Por qué un OpenClaw simulado: la cadena se puede verificar sin gateway, sin clave y sin red.
// El simulador imita solo lo que la documentación de OpenClaw 2026.11.1 promete de
// /v1/chat/completions (token Bearer, modelo "openclaw/<agente>", respuesta en
// choices[0].message.content). Lo que NO prueba es el modelo real: para eso está
// probar-en-vivo.mjs, que se corre a mano con el gateway encendido.
//
// Las claves que usa son inventadas y nunca salen de este archivo.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = path.join(AQUI, '..', '..', 'app', 'server.js');
const RESPALDO = JSON.parse(readFileSync(path.join(AQUI, '..', '..', 'app', 'public', 'respaldo.json'), 'utf8'));
const TOKEN = 'token-de-prueba-no-es-real-7f3a';
const CLAVE_GEMINI = 'clave-gemini-de-prueba-no-es-real';

// ---------------------------------------------------------------- simulador
// Un solo servidor que hace de OpenClaw (/v1/...) y de Gemini (/v1beta/...). Cada prueba cambia "modo".
const visto = { openclaw: [], gemini: [] };
const modo = { openclaw: 'ok', gemini: 'ok', demoraMs: 0 };
let simulador;
let urlSimulador;

function leer(req) {
  return new Promise((resolve) => {
    let crudo = '';
    req.on('data', (t) => (crudo += t));
    req.on('end', () => resolve(crudo));
  });
}

before(async () => {
  simulador = http.createServer(async (req, res) => {
    const cuerpo = await leer(req);
    const json = (estado, objeto) => {
      res.writeHead(estado, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(objeto));
    };
    if (req.url === '/v1/models') {
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return json(401, { error: { message: 'no autorizado' } });
      return json(200, { data: [{ id: 'openclaw/default' }, { id: 'openclaw/niky' }] });
    }
    if (req.url === '/v1/chat/completions') {
      visto.openclaw.push({ cabeceras: req.headers, cuerpo: JSON.parse(cuerpo || '{}') });
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return json(401, { error: { message: 'no autorizado' } });
      if (modo.openclaw === 'error') return json(500, { error: { message: 'falla simulada' } });
      if (modo.openclaw === 'vacio') return json(200, { choices: [{ message: { content: '   ' } }] });
      if (modo.openclaw === 'lento') return setTimeout(() => json(200, { choices: [{ message: { content: 'tarde' } }] }), modo.demoraMs);
      return json(200, { choices: [{ message: { content: 'RESPUESTA_OPENCLAW' } }] });
    }
    if (req.url.startsWith('/v1beta/models/')) {
      visto.gemini.push({ cabeceras: req.headers, cuerpo: JSON.parse(cuerpo || '{}') });
      if (modo.gemini === 'error') return json(429, { error: 'cuota' });
      if (modo.gemini === 'cuelga-una-vez' && visto.gemini.length === 1) return; // no responde: el servidor debe cortar y reintentar
      if (modo.gemini === 'cinco-cientos') return json(503, { error: 'saturado' });
      return json(200, { candidates: [{ content: { parts: [{ text: 'RESPUESTA_GEMINI' }] } }] });
    }
    return json(404, {});
  });
  await new Promise((r) => simulador.listen(0, '127.0.0.1', r));
  urlSimulador = `http://127.0.0.1:${simulador.address().port}`;
});

after(() => simulador.close());

// ---------------------------------------------------------------- servidor bajo prueba
let siguientePuerto = 43100 + Math.floor(Math.random() * 400);

async function arrancar(extra = {}) {
  const puerto = siguientePuerto++;
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(OPENCLAW_|GEMINI_|PUBLICO$)/.test(k)) delete env[k];
  Object.assign(env, { PORT: String(puerto) }, extra);
  const proceso = spawn(process.execPath, [SERVIDOR], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let salida = '';
  proceso.stdout.on('data', (t) => (salida += t));
  proceso.stderr.on('data', (t) => (salida += t));
  await new Promise((resolve, reject) => {
    const reloj = setTimeout(() => reject(new Error('El servidor no arrancó:\n' + salida)), 8000);
    const mirar = setInterval(() => {
      if (salida.includes('Cadena de respuesta')) { clearTimeout(reloj); clearInterval(mirar); resolve(); }
    }, 25);
  });
  const base = `http://127.0.0.1:${puerto}`;
  return {
    base,
    salida: () => salida,
    parar: () => proceso.kill(),
    estado: async () => (await fetch(`${base}/api/estado`)).json(),
    preguntar: async (tarea, texto) => {
      const r = await fetch(`${base}/api/valeria`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tarea, texto }) });
      return { status: r.status, json: await r.json() };
    },
  };
}

function reiniciar(nuevoModo = {}) {
  visto.openclaw.length = 0;
  visto.gemini.length = 0;
  Object.assign(modo, { openclaw: 'ok', gemini: 'ok', demoraMs: 0 }, nuevoModo);
}

const CONECTADO = () => ({ OPENCLAW_URL: urlSimulador, OPENCLAW_GATEWAY_TOKEN: TOKEN });

// ---------------------------------------------------------------- pruebas
test('OpenClaw responde: fuente "openclaw" y cada petición sale limpia', async () => {
  reiniciar();
  const s = await arrancar(CONECTADO());
  try {
    assert.deepEqual(await s.estado(), { ia: true, modelo: 'openclaw/niky', motor: 'openclaw' });
    const a = await s.preguntar('ayuda', 'no entiendo cuando va la s');
    const b = await s.preguntar('disenar', 'una actividad de rutinas');
    assert.equal(a.status, 200);
    assert.deepEqual(a.json, { fuente: 'openclaw', texto: 'RESPUESTA_OPENCLAW' });
    assert.equal(b.json.fuente, 'openclaw');
    assert.equal(visto.openclaw.length, 2);
    for (const llamada of visto.openclaw) {
      assert.equal(llamada.cuerpo.model, 'openclaw/niky');
      // Sesión limpia: sin "user", sin cabecera de sesión y sin historial.
      assert.equal('user' in llamada.cuerpo, false, 'enviar "user" haría compartir sesión entre peticiones');
      assert.equal(llamada.cabeceras['x-openclaw-session-key'], undefined);
      assert.equal(llamada.cuerpo.messages.length, 2);
      assert.equal(llamada.cuerpo.messages[0].role, 'system');
      assert.match(llamada.cuerpo.messages[0].content, /Niky/);
      assert.match(llamada.cuerpo.messages[0].content, /no tienes herramientas/);
    }
    assert.match(visto.openclaw[0].cuerpo.messages[1].content, /no entiendo cuando va la s/);
    assert.doesNotMatch(visto.openclaw[1].cuerpo.messages[1].content, /no entiendo cuando va la s/, 'la segunda petición no debe arrastrar la primera');
  } finally { s.parar(); }
});

test('las tres tareas nuevas por rol llegan al modelo con su propio encargo', async () => {
  reiniciar();
  const s = await arrancar(CONECTADO());
  try {
    for (const [tarea, pista] of [['orientar', /Orientación escolar revisa/], ['familia', /mensaje corto para la familia/], ['coordinar', /tres líneas/]]) {
      const r = await s.preguntar(tarea, 'texto de ejemplo');
      assert.equal(r.json.fuente, 'openclaw', tarea);
      assert.match(visto.openclaw.at(-1).cuerpo.messages[1].content, pista, tarea);
    }
  } finally { s.parar(); }
});

test('el servidor recorta el texto según la tarea', async () => {
  reiniciar();
  const s = await arrancar(CONECTADO());
  try {
    await s.preguntar('disenar', 'a'.repeat(900));
    await s.preguntar('ajustar', 'b'.repeat(4000));
    await s.preguntar('coordinar', 'c'.repeat(4000));
    const largo = (letra) => (visto.openclaw.find((l) => l.cuerpo.messages[1].content.includes(letra.repeat(50))).cuerpo.messages[1].content.match(new RegExp(`${letra}{50,}`))[0].length);
    assert.equal(largo('a'), 300);
    assert.equal(largo('b'), 2500);
    assert.equal(largo('c'), 1200);
  } finally { s.parar(); }
});

test('OpenClaw falla y no hay Gemini: respaldo, y la siguiente pregunta no espera de nuevo', async () => {
  reiniciar({ openclaw: 'error' });
  const s = await arrancar(CONECTADO());
  try {
    const a = await s.preguntar('ayuda', 'hola');
    assert.deepEqual(a.json, { fuente: 'respaldo', texto: RESPALDO.ayuda });
    const intentos = visto.openclaw.length;
    const b = await s.preguntar('ayuda', 'hola otra vez');
    assert.equal(b.json.fuente, 'respaldo');
    assert.equal(visto.openclaw.length, intentos, 'tras un fallo se pausa OpenClaw en lugar de insistir');
    assert.deepEqual(await s.estado(), { ia: false, modelo: null, motor: 'respaldo' });
  } finally { s.parar(); }
});

test('OpenClaw responde vacío: cuenta como fallo', async () => {
  reiniciar({ openclaw: 'vacio' });
  const s = await arrancar(CONECTADO());
  try {
    assert.equal((await s.preguntar('ayuda', 'hola')).json.fuente, 'respaldo');
  } finally { s.parar(); }
});

test('OpenClaw tarda de más y hay Gemini: responde Gemini sin pasar del tiempo de espera', async () => {
  reiniciar({ openclaw: 'lento', demoraMs: 3000 });
  const s = await arrancar({ ...CONECTADO(), OPENCLAW_ESPERA_MS: '400', GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    const t0 = Date.now();
    const r = await s.preguntar('ayuda', 'hola');
    assert.deepEqual(r.json, { fuente: 'gemini', texto: 'RESPUESTA_GEMINI' });
    assert.ok(Date.now() - t0 < 2000, 'debió cortar OpenClaw a los 400 ms');
    assert.equal(visto.gemini[0].cabeceras['x-goog-api-key'], CLAVE_GEMINI);
    assert.deepEqual(await s.estado(), { ia: true, modelo: 'gemini-3.5-flash-lite', motor: 'gemini' });
  } finally { s.parar(); }
});

test('Gemini se cuelga una vez: se corta y el segundo intento responde; un 429 no se reintenta', async () => {
  reiniciar({ gemini: 'cuelga-una-vez' });
  const s = await arrancar({ GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    const t0 = Date.now();
    const r = await s.preguntar('ayuda', 'hola');
    assert.deepEqual(r.json, { fuente: 'gemini', texto: 'RESPUESTA_GEMINI' });
    assert.equal(visto.gemini.length, 2, 'una llamada colgada más un reintento');
    assert.ok(Date.now() - t0 < 9000, 'el intento colgado se corta a los 6 s');
  } finally { s.parar(); }
  reiniciar({ gemini: 'error' }); // 429
  const c = await arrancar({ GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    assert.equal((await c.preguntar('ayuda', 'hola')).json.fuente, 'respaldo');
    assert.equal(visto.gemini.length, 1, 'un 429 no se repite: gastaría cuota y volvería a fallar');
  } finally { c.parar(); }
  reiniciar({ gemini: 'cinco-cientos' });
  const e = await arrancar({ GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    assert.equal((await e.preguntar('ayuda', 'hola')).json.fuente, 'respaldo');
    assert.equal(visto.gemini.length, 2, 'un 5xx de Google sí se reintenta una vez');
  } finally { e.parar(); }
});

test('el perfil solo se acepta de una lista cerrada y llega a la petición', async () => {
  reiniciar();
  const s = await arrancar(CONECTADO());
  try {
    await s.preguntar('ayuda', 'hola');
    assert.match(visto.openclaw.at(-1).cuerpo.messages[1].content, /E-demo/);
    const llamar = (perfil) => fetch(`${s.base}/api/valeria`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tarea: 'ajustar', texto: 'actividad de prueba', perfil }) });
    await llamar('8A-05');
    assert.match(visto.openclaw.at(-1).cuerpo.messages[1].content, /8A-05/);
    assert.match(visto.openclaw.at(-1).cuerpo.messages[1].content, /Escribe con mucha imaginación|escribe con mucha imaginación/i);
    for (const intruso of ['Maria Perez 1020304050', '__proto__', 'constructor', '8A-99', { x: 1 }]) {
      await llamar(intruso);
      const enviado = visto.openclaw.at(-1).cuerpo.messages[1].content;
      assert.match(enviado, /E-demo/, `un perfil que no está en la lista vuelve al de demostración: ${JSON.stringify(intruso)}`);
      assert.doesNotMatch(enviado, /Maria|1020304050/);
    }
  } finally { s.parar(); }
});

// El catálogo se genera desde el guion de la muestra (ia/sincronizar-ejemplos.mjs) y no se publica con el
// código: sin ese archivo la prueba se salta en lugar de fallar.
const CATALOGO = path.join(AQUI, '..', '..', 'app', 'ejemplos-preparados.json');
test('un ejemplo preparado responde al instante, sin tocar ningún modelo ni la cuota, y aunque todo esté caído', { skip: existsSync(CATALOGO) ? false : 'falta app/ejemplos-preparados.json (corre ia/sincronizar-ejemplos.mjs)' }, async () => {
  const catalogo = JSON.parse(readFileSync(path.join(AQUI, '..', '..', 'app', 'ejemplos-preparados.json'), 'utf8')).ejemplos;
  const ids = Object.keys(catalogo);
  assert.equal(ids.length, 25, 'el catálogo trae los 25 ejemplos del guion');
  reiniciar({ openclaw: 'error', gemini: 'error' }); // con todo caído, el recorrido debe seguir funcionando
  const s = await arrancar({ ...CONECTADO(), GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    const llamar = (cuerpo) => fetch(`${s.base}/api/valeria`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }).then(async (r) => ({ status: r.status, json: await r.json() }));
    for (const id of ids) {
      const r = await llamar({ tarea: catalogo[id].tarea, ejemplo: id });
      assert.equal(r.status, 200, id);
      assert.equal(r.json.fuente, 'ejemplo', `${id}: debe rotularse "ejemplo", nunca como en vivo`);
      assert.equal(r.json.texto, catalogo[id].texto, id);
    }
    assert.equal(visto.openclaw.length + visto.gemini.length, 0, 'los 25 ejemplos no hicieron ninguna llamada a un modelo');
    // sin texto: el ejemplo no lo necesita, pero una petición normal sin texto sigue siendo un error
    assert.equal((await llamar({ tarea: 'ayuda', ejemplo: 'estudiante-1' })).json.fuente, 'ejemplo');
    assert.equal((await llamar({ tarea: 'ayuda' })).status, 400);
    // la tarea debe coincidir: un código de "ajustar" no puede contestar una petición de "ayuda"
    const ajuste = ids.find((id) => catalogo[id].tarea === 'ajustar');
    const cruzada = await llamar({ tarea: 'ayuda', texto: 'hola', ejemplo: ajuste });
    assert.notEqual(cruzada.json.texto, catalogo[ajuste].texto, 'una tarea distinta no recibe el ejemplo');
    // códigos que no existen se ignoran y siguen el camino normal (aquí cae al respaldo porque todo está caído)
    for (const falso of ['no-existe', '__proto__', 'constructor', 7, null, { a: 1 }]) {
      const r = await llamar({ tarea: 'ayuda', texto: 'hola', ejemplo: falso });
      assert.equal(r.json.fuente, 'respaldo', `código inválido ${JSON.stringify(falso)}`);
    }
  } finally { s.parar(); }
});

test('OpenClaw y Gemini fallan: respaldo', async () => {
  reiniciar({ openclaw: 'error', gemini: 'error' });
  const s = await arrancar({ ...CONECTADO(), GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    assert.equal((await s.preguntar('orientar', 'hola')).json.fuente, 'respaldo');
  } finally { s.parar(); }
});

test('sin token ni clave: respaldo y /api/estado lo dice', async () => {
  reiniciar();
  const s = await arrancar();
  try {
    assert.deepEqual(await s.estado(), { ia: false, modelo: null, motor: 'respaldo' });
    assert.deepEqual((await s.preguntar('disenar', 'hola')).json, { fuente: 'respaldo', texto: RESPALDO.disenar });
    assert.equal(visto.openclaw.length, 0);
  } finally { s.parar(); }
});

test('una URL de OpenClaw que no es local se ignora: el token no sale del equipo', async () => {
  reiniciar();
  const s = await arrancar({ OPENCLAW_URL: 'http://ejemplo.invalid:18789', OPENCLAW_GATEWAY_TOKEN: TOKEN });
  try {
    assert.match(s.salida(), /no es local/);
    assert.equal((await s.preguntar('ayuda', 'hola')).json.fuente, 'respaldo');
  } finally { s.parar(); }
});

test('tareas que no existen se rechazan, incluidas las heredadas de Object', async () => {
  reiniciar();
  const s = await arrancar(CONECTADO());
  try {
    for (const tarea of ['borrar', 'constructor', '__proto__', 'toString', undefined]) {
      assert.equal((await s.preguntar(tarea, 'hola')).status, 400, String(tarea));
    }
    assert.equal((await s.preguntar('ayuda', '   ')).status, 400);
    assert.equal(visto.openclaw.length, 0);
  } finally { s.parar(); }
});

test('el filtro frena datos personales antes de cualquier modelo y deja pasar las cifras normales', async () => {
  reiniciar();
  const s = await arrancar({ ...CONECTADO(), GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    const bloqueados = [
      'mi correo es alguien@ejemplo.com',
      'llámame al 3001234567',
      'mi celular es 300 123 4567',
      'mi cédula es 1.020.304.050',
      'mira www.ejemplo.co',
      'entra a https://ejemplo.co/x',
    ];
    for (const texto of bloqueados) {
      const r = await s.preguntar('ayuda', texto);
      assert.equal(r.status, 200, texto);
      assert.equal(r.json.fuente, 'filtro', texto);
      assert.match(r.json.texto, /Por seguridad no proceso/, texto);
    }
    assert.equal(visto.openclaw.length, 0, 'un texto con datos personales no debe llegar a OpenClaw');
    assert.equal(visto.gemini.length, 0, 'ni a Gemini');
    const normales = [
      'Estudiantes con perfil: 24. Ajustes pendientes: 3. Aprobados: 9. Planeaciones con DUA completo: 6 de 8.',
      'La actividad dura 20 minutos y el tiempo adicional es del 50 %, de 12 a 18 minutos.',
      'La entrega es el 9 de noviembre de 2026.',
    ];
    for (const texto of normales) {
      assert.equal((await s.preguntar('coordinar', texto)).json.fuente, 'openclaw', texto);
    }
  } finally { s.parar(); }
});

test('ninguna clave aparece en lo que imprime el servidor', async () => {
  reiniciar({ openclaw: 'error', gemini: 'error' });
  const s = await arrancar({ ...CONECTADO(), GEMINI_API_KEY: CLAVE_GEMINI, GEMINI_BASE: urlSimulador });
  try {
    await s.preguntar('ayuda', 'hola');
    assert.doesNotMatch(s.salida(), new RegExp(TOKEN));
    assert.doesNotMatch(s.salida(), new RegExp(CLAVE_GEMINI));
  } finally { s.parar(); }
});

test('toda tarea tiene un texto de respaldo propio', () => {
  for (const tarea of ['disenar', 'ajustar', 'ayuda', 'orientar', 'familia', 'coordinar']) {
    assert.ok(typeof RESPALDO[tarea] === 'string' && RESPALDO[tarea].length > 60, tarea);
    assert.doesNotMatch(RESPALDO[tarea], /diagn[oó]stic/i, `${tarea}: el respaldo no debe nombrar diagnósticos`);
  }
});

test('una ruta mal codificada no tumba el servidor; PUBLICO sirve otra carpeta y el respaldo sigue siendo el de aquí', async () => {
  reiniciar();
  const otra = mkdtempSync(path.join(tmpdir(), 'niky-publico-'));
  writeFileSync(path.join(otra, 'index.html'), '<title>otra carpeta</title>');
  writeFileSync(path.join(otra, 'a.webmanifest'), '{}');
  const s = await arrancar({ PUBLICO: otra });
  try {
    assert.equal((await fetch(`${s.base}/%E0%A4%A`)).status, 400);
    const raiz = await fetch(`${s.base}/`);
    assert.match(await raiz.text(), /otra carpeta/);
    assert.match(raiz.headers.get('etag') || '', /^"/);
    assert.match((await fetch(`${s.base}/a.webmanifest`)).headers.get('content-type'), /manifest\+json/);
    assert.equal((await fetch(`${s.base}/../server.js`)).status, 404);
    assert.equal((await s.preguntar('familia', 'hola')).json.texto, RESPALDO.familia);
  } finally { s.parar(); }
});
