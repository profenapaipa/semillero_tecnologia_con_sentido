/* ============================================
   ZOCALAB — Capa de datos local (localStorage)
   "El quinto elemento eres tú"

   Este archivo es la única puerta de entrada a los
   datos de la app. Ninguna página debe leer o escribir
   localStorage directamente: todo pasa por aquí.

   Toda lectura y escritura va envuelta en try/catch
   porque localStorage puede fallar (modo privado,
   cuota llena, cookies bloqueadas) y la app nunca
   debe romperse por eso.
   ============================================ */

/* ============================================
   CLAVES DE ALMACENAMIENTO
   Las dos primeras las crea pages/login.html y
   NUNCA se modifican desde aquí: solo se leen.
   ============================================ */
const ZL_CLAVES = {
  SESION:     'zocalab_sesion',      // sesión activa — solo lectura
  USUARIOS:   'zocalab_usuarios',    // cuentas registradas — solo lectura
  BOSQUE:     'zocalab_bosque',      // árboles, racha y cámara
  ESPACIO:    'zocalab_espacio',     // notas, tareas, metas y planificador
  RUTINAS:    'zocalab_rutinas',     // rutina del sol y de la luna
  CONDOR:     'zocalab_condor',      // guardián del tiempo
  MEDITACION: 'zocalab_meditacion'   // meditación y respiración
};

/* ============================================
   ESTRUCTURAS POR DEFECTO
   Si una clave no existe todavía, o si le falta un
   campo (por ejemplo porque se agregó en una versión
   nueva de la app), se completa con estos valores.
   ============================================ */
const ZL_DEFECTOS = {

  // ====== EL BOSQUE ======
  [ZL_CLAVES.BOSQUE]: {
    tipoArbol: null,        // LEGADO (versión con un solo bosque); solo se lee para migrar
    totalArboles: 0,
    diasRacha: 0,
    ultimoEstudio: null,    // fecha 'AAAA-MM-DD' del último árbol plantado
    nivelCamara: 1,         // se recalcula según el total de árboles
    arboles: [],            // [{ id, tipo, bosque, fecha, etapa }]
    decoraciones: [],       // reservado para futuras decoraciones del bosque
    fechaCambioArbol: null, // LEGADO
    temaCielo: 'amanecer',  // LEGADO (los fondos ahora son ilustraciones por bosque)
    bosqueActivo: 'rio',    // 'rio' | 'laguna' — el que se ve en la pantalla principal
    tiposPorBosque: {       // cada bosque solo admite UN tipo de árbol
      rio: null,            // 'lluvia' | 'viento'
      laguna: null          // 'sol' | 'estrella'
    },
    migrado: false          // true cuando ya se convirtió la data del bosque único
  },

  // ====== MI ESPACIO ======
  [ZL_CLAVES.ESPACIO]: {
    notas: [],        // [{ id, titulo, contenido, fecha, color, icono }]
    tareas: [],       // [{ id, texto, categoria, completada, fecha, prioridad, limite }]
    categorias: [],   // [{ id, nombre, icono, color }] — las define el usuario
    metas: [],        // [{ id, texto, cicloFecha, fechaLimite, completada }]
    planificador: {
      lunes: [], martes: [], miercoles: [], jueves: [],
      viernes: [], sabado: [], domingo: []
    },
    calendario: {},           // 'AAAA-MM-DD' -> [{ id, etiqueta, icono, color, hora }]
    ultimoRecordatorio: null  // última fecha en que se avisó de una meta próxima
  },

  // ====== RUTINAS DEL SOL Y DE LA LUNA ======
  [ZL_CLAVES.RUTINAS]: {
    sol: {
      completadaHoy: false,
      fechaUltima: null,
      historial: [],   // [{ fecha, intencion, cuerpo, aprendizaje, gratitud, meta }]
      racha: 0
    },
    luna: {
      completadaHoy: false,
      fechaUltima: null,
      historial: [],            // [{ fecha, hice[], aprendi, emocion, manana }]
      registroEmocional: [],    // [{ fecha, emocion, etiqueta }]
      racha: 0
    }
  },

  // ====== EL CÓNDOR — GUARDIÁN DEL TIEMPO ======
  [ZL_CLAVES.CONDOR]: {
    activado: true,
    intervaloMinutos: 25,
    silenciadoHasta: null,        // marca de tiempo (ms) hasta la que no avisa
    modoEnfoque: false,
    tiempoEnfoqueMinutos: 25,
    enfoqueAutomatico: false
  },

  // ====== MEDITACIÓN Y RESPIRACIÓN ======
  [ZL_CLAVES.MEDITACION]: {
    sesionesCompletadas: 0,
    ultimaSesion: null,
    favorita: null,
    historial: []   // [{ id, nombre, tipo, duracion, fecha }]
  }
};

/* ============================================
   UTILIDADES INTERNAS
   ============================================ */

// Copia profunda sencilla — evita que dos páginas compartan
// por accidente la misma referencia de un objeto por defecto.
function _zlClonar(valor) {
  try {
    return JSON.parse(JSON.stringify(valor));
  } catch (e) {
    return valor;
  }
}

// ¿Es un objeto plano? (no array, no null)
function _zlEsObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

// Fusiona lo guardado sobre los valores por defecto.
// Así, si la app gana un campo nuevo, los usuarios antiguos
// no se quedan con datos incompletos ni con undefined.
function _zlFusionar(porDefecto, guardado) {
  if (!_zlEsObjeto(porDefecto)) {
    return guardado === undefined ? porDefecto : guardado;
  }
  const resultado = _zlClonar(porDefecto);
  if (!_zlEsObjeto(guardado)) return resultado;

  Object.keys(guardado).forEach(function (llave) {
    const valorGuardado = guardado[llave];
    if (_zlEsObjeto(porDefecto[llave]) && _zlEsObjeto(valorGuardado)) {
      resultado[llave] = _zlFusionar(porDefecto[llave], valorGuardado);
    } else if (valorGuardado !== undefined) {
      resultado[llave] = valorGuardado;
    }
  });
  return resultado;
}

/* ============================================
   FUNCIONES PRINCIPALES REQUERIDAS
   ============================================ */

// ====== LEER ======
// Devuelve siempre un objeto usable: lo guardado fusionado
// con los valores por defecto, o los valores por defecto.
function leerDato(clave) {
  const porDefecto = _zlClonar(ZL_DEFECTOS[clave] || {});
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return porDefecto;
    const guardado = JSON.parse(crudo);
    return _zlFusionar(porDefecto, guardado);
  } catch (e) {
    console.error('ZocaDatos: no se pudo leer "' + clave + '", se usan valores por defecto', e);
    return porDefecto;
  }
}

// ====== GUARDAR ======
// Escribe el objeto completo. Devuelve true si lo logró.
function guardarDato(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.error('ZocaDatos: no se pudo guardar "' + clave + '"', e);
    return false;
  }
}

// ====== ACTUALIZAR UN CAMPO ======
// Acepta rutas con punto:
// actualizarDato(ZL_CLAVES.RUTINAS, 'sol.completadaHoy', true)
function actualizarDato(clave, campo, valor) {
  try {
    const datos = leerDato(clave);
    const partes = String(campo).split('.');
    let nodo = datos;

    // Recorre hasta el penúltimo nivel, creando objetos si faltan
    for (let i = 0; i < partes.length - 1; i++) {
      if (!_zlEsObjeto(nodo[partes[i]])) nodo[partes[i]] = {};
      nodo = nodo[partes[i]];
    }

    nodo[partes[partes.length - 1]] = valor;
    return guardarDato(clave, datos) ? datos : null;
  } catch (e) {
    console.error('ZocaDatos: no se pudo actualizar "' + campo + '" en "' + clave + '"', e);
    return null;
  }
}

// ====== GENERAR ID ÚNICO ======
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ====== VERIFICAR SESIÓN ======
// Protección de ruta: si no hay sesión activa, manda a login.
// Se llama al inicio de TODAS las páginas de la app.
function verificarSesion() {
  try {
    const crudo = localStorage.getItem(ZL_CLAVES.SESION);
    if (!crudo) {
      window.location.replace('login.html');
      return false;
    }
    JSON.parse(crudo); // si la sesión está corrupta, cae al catch
    return true;
  } catch (e) {
    console.error('ZocaDatos: sesión inválida, se redirige a login', e);
    window.location.replace('login.html');
    return false;
  }
}

/* ============================================
   SESIÓN Y USUARIO (solo lectura)
   ============================================ */

// Combina la sesión activa con la cuenta registrada.
// Nunca escribe en zocalab_sesion ni en zocalab_usuarios.
function obtenerUsuario() {
  try {
    const crudo = localStorage.getItem(ZL_CLAVES.SESION);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo);

    let cuenta = null;
    try {
      const usuarios = JSON.parse(localStorage.getItem(ZL_CLAVES.USUARIOS)) || [];
      cuenta = usuarios.find(function (u) { return u.id === sesion.usuarioId; }) || null;
    } catch (e) {
      cuenta = null; // la sesión sola ya alcanza para mostrar el nombre
    }

    return cuenta ? Object.assign({}, cuenta, sesion) : sesion;
  } catch (e) {
    console.error('ZocaDatos: no se pudo leer el usuario activo', e);
    return null;
  }
}

// Primer nombre, para saludos cortos
function nombreCorto() {
  const usuario = obtenerUsuario();
  if (!usuario || !usuario.nombre) return 'Zocanauta';
  return String(usuario.nombre).trim().split(/\s+/)[0];
}

// Inicial para el avatar circular del header
function inicialUsuario() {
  const nombre = nombreCorto();
  return nombre.charAt(0).toUpperCase() || 'Z';
}

// Cierra la sesión: elimina zocalab_sesion y vuelve al login.
// Los datos del bosque, notas y rutinas se conservan.
function cerrarSesion() {
  try {
    localStorage.removeItem(ZL_CLAVES.SESION);
  } catch (e) {
    console.error('ZocaDatos: no se pudo cerrar la sesión', e);
  }
  window.location.href = 'login.html';
}

/* ============================================
   FOTOS DE PERFIL MUISCAS (predefinidas)
   Las imágenes viven en assets/perfil/. Todas las
   páginas están en pages/, así que la ruta es ../assets.
   ============================================ */
const ZL_AVATARES = [
  { id: 'tunjo',    nombre: 'Tunjo y disco solar', archivo: 'tunjo.jpg' },
  { id: 'felino',   nombre: 'Felino de oro',       archivo: 'felino.jpg' },
  { id: 'tortuga',  nombre: 'Tortuga ancestral',   archivo: 'tortuga.jpg' },
  { id: 'guardian', nombre: 'Guardián de oro',     archivo: 'guardian.jpg' },
  { id: 'totem',    nombre: 'Tótem sonriente',     archivo: 'totem.jpg' },
  { id: 'corona',   nombre: 'Corona de plumas',    archivo: 'corona.jpg' },
  { id: 'ave',      nombre: 'Ave dorada',          archivo: 'ave.jpg' },
  { id: 'espiral',  nombre: 'Espiral de agua',     archivo: 'espiral.jpg' }
];

function rutaAvatar(id) {
  const avatar = ZL_AVATARES.find(function (a) { return a.id === id; });
  return avatar ? '../assets/perfil/' + avatar.archivo : null;
}

// Pinta el avatar redondo de un nodo: foto muisca si el usuario eligió
// una; si no, el emoji que tuviera; si no, la inicial de su nombre.
function pintarAvatar(nodo) {
  if (!nodo) return;
  const usuario = obtenerUsuario() || {};
  const ruta = rutaAvatar(usuario.avatarImagen);
  if (ruta) {
    nodo.textContent = '';
    nodo.style.backgroundImage = 'url("' + ruta + '")';
    nodo.classList.add('con-foto');
    nodo.setAttribute('data-avatar-id', usuario.avatarImagen);
  } else {
    nodo.style.backgroundImage = '';
    nodo.classList.remove('con-foto');
    nodo.removeAttribute('data-avatar-id');
    nodo.textContent = usuario.avatarIcono || inicialUsuario();
  }
}

/* ============================================
   FECHAS
   ============================================ */

const ZL_DIAS       = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ZL_DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ZL_MESES      = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Claves del planificador en el orden Lun→Dom que usa la vista semanal
const ZL_DIAS_CLAVE = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Fecha local en formato 'AAAA-MM-DD'. No usa toISOString para no
// desfasarse por la zona horaria de Colombia (UTC-5), que haría
// que después de las 7 p.m. "hoy" pareciera "mañana".
function hoyISO(fecha) {
  const f = fecha ? new Date(fecha) : new Date();
  const mes = String(f.getMonth() + 1).padStart(2, '0');
  const dia = String(f.getDate()).padStart(2, '0');
  return f.getFullYear() + '-' + mes + '-' + dia;
}

// ¿Esa fecha guardada corresponde al día de hoy?
function esHoy(fechaGuardada) {
  if (!fechaGuardada) return false;
  return String(fechaGuardada).slice(0, 10) === hoyISO();
}

// ¿Esa fecha corresponde a ayer? (sirve para saber si la racha sigue viva)
function esAyer(fechaGuardada) {
  if (!fechaGuardada) return false;
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  return String(fechaGuardada).slice(0, 10) === hoyISO(ayer);
}

// Días completos transcurridos entre una fecha guardada y hoy
function diasDesde(fechaGuardada) {
  if (!fechaGuardada) return Infinity;
  const partes = String(fechaGuardada).slice(0, 10).split('-');
  const entonces = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  entonces.setHours(0, 0, 0, 0);
  return Math.round((hoy - entonces) / 86400000);
}

// "Martes, 17 de septiembre"
function fechaLarga(fecha) {
  const f = fecha ? new Date(fecha) : new Date();
  return ZL_DIAS[f.getDay()] + ', ' + f.getDate() + ' de ' + ZL_MESES[f.getMonth()];
}

// "17 sep" — para fechas pequeñas en tarjetas de notas y tareas
function fechaCorta(fecha) {
  const f = fecha ? new Date(fecha) : new Date();
  return f.getDate() + ' ' + ZL_MESES[f.getMonth()].slice(0, 3);
}

/* ============================================
   SALUDO SEGÚN LA HORA REAL
   ============================================ */
function saludoSegunHora(nombre) {
  const quien = nombre || nombreCorto();
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12)  return 'Buenos días, ' + quien + ' ☀️';
  if (hora >= 12 && hora < 18) return 'Buenas tardes, ' + quien + ' 🌿';
  return 'Buenas noches, ' + quien + ' 🌙';   // 18-24 y 0-6
}

/* ============================================
   FASE LUNAR — cálculo con JS puro, sin API externa
   Se apoya en una luna nueva conocida y en la duración
   media del mes sinódico (29.53058867 días).
   ============================================ */
const ZL_CICLO_LUNAR = 29.53058867;

function faseLunar(fecha) {
  const hoy = fecha ? new Date(fecha) : new Date();
  const lunaNuevaConocida = new Date('2000-01-06T18:14:00Z');
  const diferenciaDias = (hoy - lunaNuevaConocida) / 86400000;

  // Resto normalizado entre 0 y 1. El doble módulo evita valores
  // negativos si el reloj del equipo está antes del año 2000.
  let valor = ((diferenciaDias % ZL_CICLO_LUNAR) + ZL_CICLO_LUNAR) % ZL_CICLO_LUNAR;
  valor = valor / ZL_CICLO_LUNAR;

  let fase;
  if      (valor < 0.07) fase = { icono: '🌑', nombre: 'Luna nueva',       mensaje: 'Inicia un nuevo ciclo' };
  else if (valor < 0.25) fase = { icono: '🌒', nombre: 'Creciente',        mensaje: 'Momento de construir' };
  else if (valor < 0.45) fase = { icono: '🌓', nombre: 'Cuarto creciente', mensaje: 'Avanza con fuerza' };
  else if (valor < 0.55) fase = { icono: '🌕', nombre: 'Luna llena',       mensaje: 'Celebra lo logrado' };
  else if (valor < 0.75) fase = { icono: '🌖', nombre: 'Menguante',        mensaje: 'Reflexiona y suelta' };
  else if (valor < 0.93) fase = { icono: '🌘', nombre: 'Cuarto menguante', mensaje: 'Descansa y cierra' };
  else                   fase = { icono: '🌑', nombre: 'Luna nueva',       mensaje: 'El ciclo se renueva' };

  fase.valor = valor;
  // Iluminación aproximada (0 = nueva, 1 = llena) para dibujar la luna
  fase.iluminacion = (1 - Math.cos(2 * Math.PI * valor)) / 2;
  return fase;
}

/* ============================================
   CICLO LUNAR DE 28 DÍAS — para las metas
   Los ciclos se cuentan desde una fecha base fija,
   así todos los ciclos caen siempre en la misma rejilla.
   ============================================ */
const ZL_BASE_CICLOS = new Date(2024, 0, 1); // 1 de enero de 2024

function cicloLunarActual(fecha) {
  const hoy = fecha ? new Date(fecha) : new Date();
  hoy.setHours(0, 0, 0, 0);
  const transcurridos = Math.floor((hoy - ZL_BASE_CICLOS) / 86400000);
  const numero = Math.floor(transcurridos / 28) + 1;

  const inicio = new Date(ZL_BASE_CICLOS.getTime());
  inicio.setDate(inicio.getDate() + (numero - 1) * 28);
  const fin = new Date(inicio.getTime());
  fin.setDate(fin.getDate() + 27);

  return {
    numero: numero,
    id: 'ciclo-' + numero,
    inicio: inicio,
    fin: fin,
    inicioISO: hoyISO(inicio),
    finISO: hoyISO(fin),
    diasRestantes: Math.max(0, Math.round((fin - hoy) / 86400000)),
    etiqueta: 'Ciclo lunar ' + numero
  };
}

/* ============================================
   RECORDATORIO DE METAS
   Devuelve la meta activa (no completada, con plazo)
   más urgente, para avisar al entrar a la app y que
   los objetivos a largo plazo no se olviden.
   ============================================ */
function obtenerRecordatorioMeta() {
  try {
    const espacio = leerDato(ZL_CLAVES.ESPACIO);
    const activas = (espacio.metas || []).filter(function (m) {
      return !m.completada && m.fechaLimite;
    });
    if (!activas.length) return null;

    activas.sort(function (a, b) {
      return String(a.fechaLimite).localeCompare(String(b.fechaLimite));
    });

    const meta = activas[0];
    // diasDesde() da positivo si la fecha ya pasó y negativo si es futura;
    // para "días restantes" se invierte el signo.
    const diasRestantes = -diasDesde(meta.fechaLimite);

    return { texto: meta.texto, fechaLimite: meta.fechaLimite, diasRestantes: diasRestantes };
  } catch (e) {
    console.error('ZocaDatos: no se pudo calcular el recordatorio de metas', e);
    return null;
  }
}

/* ============================================
   SINCRONIZACIÓN DEL DÍA
   Se ejecuta al cargar cualquier página: si cambió
   el día, reinicia los "completadaHoy" de las rutinas
   y recalcula las rachas.
   ============================================ */
function sincronizarDia() {
  try {
    // ====== Rutinas: nuevo día, casillas limpias ======
    const rutinas = leerDato(ZL_CLAVES.RUTINAS);
    let cambioRutinas = false;

    ['sol', 'luna'].forEach(function (momento) {
      if (rutinas[momento].completadaHoy && !esHoy(rutinas[momento].fechaUltima)) {
        rutinas[momento].completadaHoy = false;
        cambioRutinas = true;
      }
      // Si se perdió más de un día, la racha de la rutina se reinicia
      if (rutinas[momento].racha > 0 &&
          !esHoy(rutinas[momento].fechaUltima) &&
          !esAyer(rutinas[momento].fechaUltima)) {
        rutinas[momento].racha = 0;
        cambioRutinas = true;
      }
    });
    if (cambioRutinas) guardarDato(ZL_CLAVES.RUTINAS, rutinas);

    // ====== Bosque: la racha muere si se falta más de un día ======
    const bosque = leerDato(ZL_CLAVES.BOSQUE);
    if (bosque.diasRacha > 0 &&
        !esHoy(bosque.ultimoEstudio) &&
        !esAyer(bosque.ultimoEstudio)) {
      bosque.diasRacha = 0;
      guardarDato(ZL_CLAVES.BOSQUE, bosque);
    }

    // ====== Cóndor: se levanta el silencio ya vencido ======
    const condor = leerDato(ZL_CLAVES.CONDOR);
    if (condor.silenciadoHasta && Date.now() > condor.silenciadoHasta) {
      actualizarDato(ZL_CLAVES.CONDOR, 'silenciadoHasta', null);
    }
  } catch (e) {
    console.error('ZocaDatos: falló la sincronización del día', e);
  }
}

/* ============================================
   NAMESPACE PÚBLICO
   Las páginas pueden usar las funciones sueltas o
   el objeto ZocaDatos, según prefieran.
   ============================================ */
window.ZocaDatos = {
  CLAVES: ZL_CLAVES,
  DEFECTOS: ZL_DEFECTOS,
  DIAS: ZL_DIAS,
  DIAS_CORTO: ZL_DIAS_CORTO,
  DIAS_CLAVE: ZL_DIAS_CLAVE,
  MESES: ZL_MESES,
  leerDato: leerDato,
  guardarDato: guardarDato,
  actualizarDato: actualizarDato,
  generarId: generarId,
  verificarSesion: verificarSesion,
  obtenerUsuario: obtenerUsuario,
  nombreCorto: nombreCorto,
  inicialUsuario: inicialUsuario,
  AVATARES: ZL_AVATARES,
  rutaAvatar: rutaAvatar,
  pintarAvatar: pintarAvatar,
  cerrarSesion: cerrarSesion,
  hoyISO: hoyISO,
  esHoy: esHoy,
  esAyer: esAyer,
  diasDesde: diasDesde,
  fechaLarga: fechaLarga,
  fechaCorta: fechaCorta,
  saludoSegunHora: saludoSegunHora,
  faseLunar: faseLunar,
  cicloLunarActual: cicloLunarActual,
  obtenerRecordatorioMeta: obtenerRecordatorioMeta,
  sincronizarDia: sincronizarDia
};

// Al cargar el archivo se pone el día al día (esto no toca la sesión).
sincronizarDia();
