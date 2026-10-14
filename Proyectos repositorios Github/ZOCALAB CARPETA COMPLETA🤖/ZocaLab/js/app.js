/* ============================================
   ZOCALAB — JavaScript principal
   Educación Ancestral Digital
   ============================================ */

// ====== TABS ======
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ====== SELECTOR DE ROL ======
function selectRole(el) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ====== MOSTRAR / OCULTAR CONTRASEÑA ======
function togglePass(inputOrId, btn) {
  const input = typeof inputOrId === 'string'
    ? document.getElementById(inputOrId)
    : inputOrId;
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.textContent = isPass ? '🙈' : '👁️';
}

// ====== FUERZA DE CONTRASEÑA ======
function checkStrength(input) {
  const val = input.value;
  const bars = [
    document.getElementById('ps1'),
    document.getElementById('ps2'),
    document.getElementById('ps3'),
    document.getElementById('ps4')
  ];
  const label = document.getElementById('passLabel');
  if (!bars[0]) return;

  let strength = 0;
  if (val.length >= 8)  strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;

  const levels = ['weak', 'weak', 'medium', 'strong'];
  const texts  = [
    'Escribe una contraseña',
    'Contraseña débil',
    'Contraseña regular',
    'Contraseña fuerte',
    '¡Contraseña muy segura!'
  ];

  bars.forEach((bar, i) => {
    bar.className = 'pbar';
    if (i < strength) bar.classList.add(levels[strength - 1] || 'weak');
  });

  if (label) label.textContent = texts[strength] || texts[0];
}

// ====== VALIDACIÓN DE CAMPOS OBLIGATORIOS ======
// Marca en rojo los campos vacíos y quita la marca en cuanto el usuario escribe.
function markRequiredFields(fields) {
  let allFilled = true;
  fields.forEach(field => {
    if (!field) return;
    const isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
    if (isEmpty) {
      allFilled = false;
      field.classList.add('error');
      field.addEventListener('input', () => field.classList.remove('error'), { once: true });
      field.addEventListener('change', () => field.classList.remove('error'), { once: true });
    } else {
      field.classList.remove('error');
    }
  });
  return allFilled;
}

// ====== LOGIN DEMO ======
function handleLogin() {
  const email = document.getElementById('loginEmail');
  const pass  = document.getElementById('loginPass');
  const err   = document.getElementById('loginError');

  const allFilled = markRequiredFields([email, pass]);
  if (!allFilled) {
    if (err) { err.classList.add('show'); }
    setTimeout(() => err?.classList.remove('show'), 3500);
    return;
  }

  // Demo: redirigir al dashboard (página futura)
  console.log('Login con:', email.value);
  // window.location.href = 'dashboard.html';
}

// ====== REGISTRO DEMO ======
function handleRegister() {
  const fields = [
    document.getElementById('regNombre'),
    document.getElementById('regApellido'),
    document.getElementById('regEmail'),
    document.getElementById('regGrado'),
    document.getElementById('regCiudad'),
    document.getElementById('regPass'),
    document.getElementById('terms')
  ];
  const err = document.getElementById('registerError');

  const allFilled = markRequiredFields(fields);
  if (!allFilled) {
    if (err) { err.classList.add('show'); }
    setTimeout(() => err?.classList.remove('show'), 3500);
    return;
  }

  // Demo: redirigir al dashboard (página futura)
  console.log('Registro completado');
  // window.location.href = 'dashboard.html';
}

// ====== SALUDO SEGÚN LA HORA DEL DÍA ======
function obtenerSaludoPorHora() {
  const hora = new Date().getHours();
  if (hora < 12) return '¡Buenos días';
  if (hora < 18) return '¡Buenas tardes';
  return '¡Buenas noches';
}

// ====== CHIPS ======
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('dif-chip')) {
    e.target.classList.toggle('selected');
  }
});

/* ============================================
   ZOCALAB — Datos compartidos y sistema de progreso
   Usado por dashboard.html, materias.html, ciclos.html,
   leccion.html, flashcards.html y logros.html. Se centraliza
   aquí para no repetir las 12 materias en cada página.
   ============================================ */

const ZOCALAB = {

  CLAVES: {
    USUARIOS:  'zocalab_usuarios',
    SESION:    'zocalab_sesion',
    PROGRESO:  'zocalab_progreso'
  },

  // ====== LAS 12 MATERIAS ======
  MATERIAS: {
    matematicas:  { id: 'matematicas',  nombre: 'Matemáticas',       icono: '🔢', color: '#1B5E3B', descripcion: 'Números, lógica y pensamiento',         ciclosTotales: 8, categoria: 'exactas' },
    espanol:      { id: 'espanol',      nombre: 'Español',           icono: '📖', color: '#C9982A', descripcion: 'Lectura, escritura y comunicación',      ciclosTotales: 8, categoria: 'idiomas' },
    ingles:       { id: 'ingles',       nombre: 'Inglés',            icono: '🌎', color: '#2B7EA1', descripcion: 'El idioma que abre puertas',             ciclosTotales: 8, categoria: 'idiomas' },
    sociales:     { id: 'sociales',     nombre: 'Ciencias Sociales', icono: '🏺', color: '#C4522A', descripcion: 'Historia, geografía y cultura',          ciclosTotales: 6, categoria: 'humanidades' },
    quimica:      { id: 'quimica',      nombre: 'Química',           icono: '⚗️', color: '#2D9B5A', descripcion: 'La ciencia de la materia',               ciclosTotales: 6, categoria: 'ciencias' },
    fisica:       { id: 'fisica',       nombre: 'Física',            icono: '⚡', color: '#1a3a5c', descripcion: 'Las leyes del universo',                 ciclosTotales: 6, categoria: 'ciencias' },
    tecnologia:   { id: 'tecnologia',   nombre: 'Tecnología',        icono: '💻', color: '#2C2C2C', descripcion: 'El futuro en tus manos',                 ciclosTotales: 5, categoria: 'exactas' },
    artes:        { id: 'artes',        nombre: 'Artes',             icono: '🎨', color: '#8B4C70', descripcion: 'Expresa lo que sientes',                 ciclosTotales: 5, categoria: 'arte' },
    etica:        { id: 'etica',        nombre: 'Ética',             icono: '🌿', color: '#3D7A5A', descripcion: 'Valores para vivir mejor',               ciclosTotales: 4, categoria: 'humanidades' },
    filosofia:    { id: 'filosofia',    nombre: 'Filosofía',         icono: '🌙', color: '#4A3870', descripcion: 'Las grandes preguntas de la vida',       ciclosTotales: 4, categoria: 'humanidades' },
    contabilidad: { id: 'contabilidad', nombre: 'Contabilidad',      icono: '📊', color: '#7A5C1E', descripcion: 'Entiende el dinero y los negocios',      ciclosTotales: 5, categoria: 'exactas' },
    edfisica:     { id: 'edfisica',     nombre: 'Educación Física',  icono: '🏃', color: '#C4522A', descripcion: 'Cuerpo sano, mente activa',              ciclosTotales: 4, categoria: 'ciencias' }
  },

  // ====== CICLOS POR MATERIA (nombres progresivos) ======
  CICLOS: {
    matematicas: ['Los números naturales', 'Sumas y restas', 'Multiplicación', 'División', 'Fracciones', 'Decimales', 'Porcentajes', 'Álgebra básica'],
    espanol: ['Las vocales y consonantes', 'Sílabas y palabras', 'Lectura comprensiva', 'Ortografía básica', 'La oración y sus partes', 'Textos narrativos', 'Textos argumentativos', 'Redacción creativa'],
    ingles: ['Saludos y presentaciones', 'El abecedario y números', 'Vocabulario cotidiano', 'Presente simple', 'Preguntas y respuestas', 'Pasado simple', 'Conversaciones básicas', 'Comprensión de lectura'],
    sociales: ['Nuestro territorio', 'Los primeros pobladores', 'El mundo muisca', 'La Colombia colonial', 'La independencia', 'Colombia hoy'],
    quimica: ['La materia y sus estados', 'Átomos y elementos', 'La tabla periódica', 'Mezclas y sustancias', 'Reacciones químicas', 'Química en la vida diaria'],
    fisica: ['El movimiento', 'Fuerzas y leyes de Newton', 'Energía y trabajo', 'Calor y temperatura', 'Ondas y sonido', 'Electricidad básica'],
    tecnologia: ['El computador y sus partes', 'Internet y seguridad digital', 'Ofimática básica', 'Pensamiento lógico y algoritmos', 'Introducción a la programación'],
    artes: ['Color y forma', 'Dibujo y proporción', 'Historia del arte colombiano', 'Música y ritmo', 'Expresión y creatividad'],
    etica: ['Quién soy y qué valoro', 'Respeto y convivencia', 'Emociones y empatía', 'Ciudadanía y comunidad'],
    filosofia: ['¿Qué es pensar?', 'Preguntas sobre la realidad', 'Ética y grandes pensadores', 'El sentido de la vida'],
    contabilidad: ['El dinero y su valor', 'Ingresos y gastos', 'Ahorro y presupuesto', 'Cuentas básicas', 'Negocios y emprendimiento'],
    edfisica: ['Calentamiento y cuidado del cuerpo', 'Coordinación y equilibrio', 'Juegos y trabajo en equipo', 'Hábitos de vida saludable']
  },

  // ====== FLASHCARDS POR MATERIA (mínimo 8 por materia) ======
  FLASHCARDS: {
    matematicas: [
      { pregunta: '¿Cuánto es 7 × 8?', respuesta: '56' },
      { pregunta: '¿Qué es una fracción?', respuesta: 'Una parte de un entero' },
      { pregunta: '¿Cuánto es 15% de 200?', respuesta: '30' },
      { pregunta: '¿Qué es el perímetro?', respuesta: 'La suma de los lados de una figura' },
      { pregunta: '¿Cuánto es √144?', respuesta: '12' },
      { pregunta: '¿Cuánto es 9 × 9?', respuesta: '81' },
      { pregunta: '¿Qué número es par: 17 o 24?', respuesta: '24' },
      { pregunta: '¿Cuánto es 100 ÷ 4?', respuesta: '25' }
    ],
    espanol: [
      { pregunta: '¿Qué es un sustantivo?', respuesta: 'Palabra que nombra personas, animales o cosas' },
      { pregunta: '¿Cuántas vocales tiene el español?', respuesta: '5' },
      { pregunta: '¿Qué es un sinónimo?', respuesta: 'Palabra que significa lo mismo que otra' },
      { pregunta: '¿Cómo se llama quien escribe un libro?', respuesta: 'Autor o autora' },
      { pregunta: '¿Qué signo se usa al final de una pregunta?', respuesta: 'Signo de interrogación (?)' },
      { pregunta: '¿Qué es un verbo?', respuesta: 'Palabra que indica una acción' },
      { pregunta: '¿Cuál es el antónimo de "grande"?', respuesta: 'Pequeño' },
      { pregunta: '¿Qué es una rima?', respuesta: 'Sonido final parecido entre dos o más palabras' }
    ],
    ingles: [
      { pregunta: '¿Cómo se dice "hola" en inglés?', respuesta: 'Hello' },
      { pregunta: '¿Cómo se dice "gracias" en inglés?', respuesta: 'Thank you' },
      { pregunta: '¿De qué color es el cielo? (in English)', respuesta: 'Blue' },
      { pregunta: '¿Cómo se dice "perro" en inglés?', respuesta: 'Dog' },
      { pregunta: '¿Qué día viene después de Monday?', respuesta: 'Tuesday' },
      { pregunta: '¿Cómo se dice "yo soy" en inglés?', respuesta: 'I am' },
      { pregunta: '¿Cuál es el opuesto de "hot"?', respuesta: 'Cold' },
      { pregunta: '¿Cómo se dice "buenos días" en inglés?', respuesta: 'Good morning' }
    ],
    sociales: [
      { pregunta: '¿Cuál es la capital de Colombia?', respuesta: 'Bogotá' },
      { pregunta: '¿Qué pueblo habitó la sabana de Bogotá?', respuesta: 'Los muiscas' },
      { pregunta: '¿En qué año se independizó Colombia?', respuesta: '1810' },
      { pregunta: '¿Qué océanos bañan las costas de Colombia?', respuesta: 'El Pacífico y el Atlántico' },
      { pregunta: '¿Qué laguna es sagrada para los muiscas?', respuesta: 'La Laguna de Guatavita' },
      { pregunta: '¿Cuál es la moneda de Colombia?', respuesta: 'El peso colombiano' },
      { pregunta: '¿Qué cordillera atraviesa Colombia?', respuesta: 'La cordillera de los Andes' },
      { pregunta: '¿Qué es la Leyenda de El Dorado?', respuesta: 'Un rito muisca con oro en Guatavita' }
    ],
    quimica: [
      { pregunta: '¿Cuáles son los estados de la materia?', respuesta: 'Sólido, líquido y gaseoso' },
      { pregunta: '¿Qué es un átomo?', respuesta: 'La unidad más pequeña de la materia' },
      { pregunta: '¿Qué símbolo tiene el oxígeno?', respuesta: 'O' },
      { pregunta: '¿Qué es una mezcla homogénea?', respuesta: 'Una mezcla donde no se distinguen sus componentes' },
      { pregunta: '¿Qué gas respiramos para vivir?', respuesta: 'Oxígeno' },
      { pregunta: '¿Cuál es la fórmula química del agua?', respuesta: 'H2O' },
      { pregunta: '¿Qué estudia la química?', respuesta: 'La composición y transformación de la materia' },
      { pregunta: '¿Qué es una reacción química?', respuesta: 'Un proceso donde una sustancia se transforma en otra' }
    ],
    fisica: [
      { pregunta: '¿Qué mide la velocidad?', respuesta: 'La distancia recorrida en un tiempo' },
      { pregunta: '¿Quién formuló las leyes del movimiento?', respuesta: 'Isaac Newton' },
      { pregunta: '¿Qué es la gravedad?', respuesta: 'La fuerza que atrae los cuerpos hacia la Tierra' },
      { pregunta: '¿Qué es la energía cinética?', respuesta: 'La energía del movimiento' },
      { pregunta: '¿Cómo se llama la unidad de fuerza?', respuesta: 'Newton' },
      { pregunta: '¿Qué es el sonido?', respuesta: 'Una onda que viaja por el aire' },
      { pregunta: '¿Qué es la temperatura?', respuesta: 'La medida del calor de un cuerpo' },
      { pregunta: '¿Qué necesita la electricidad para fluir?', respuesta: 'Un circuito cerrado' }
    ],
    tecnologia: [
      { pregunta: '¿Qué significa CPU?', respuesta: 'Unidad Central de Procesamiento' },
      { pregunta: '¿Qué es internet?', respuesta: 'Una red mundial de computadores conectados' },
      { pregunta: '¿Qué es una contraseña segura?', respuesta: 'Una clave larga y difícil de adivinar' },
      { pregunta: '¿Qué es un algoritmo?', respuesta: 'Una serie de pasos para resolver un problema' },
      { pregunta: '¿Qué es el hardware?', respuesta: 'Las partes físicas de un computador' },
      { pregunta: '¿Qué es el software?', respuesta: 'Los programas que usa un computador' },
      { pregunta: '¿Qué es un byte?', respuesta: 'Una unidad de información digital' },
      { pregunta: '¿Qué es programar?', respuesta: 'Escribir instrucciones para que un computador las siga' }
    ],
    artes: [
      { pregunta: '¿Cuáles son los colores primarios?', respuesta: 'Rojo, azul y amarillo' },
      { pregunta: '¿Qué instrumento de cuerda se toca con arco?', respuesta: 'El violín' },
      { pregunta: '¿Qué es una obra abstracta?', respuesta: 'Una obra que no representa la realidad tal cual' },
      { pregunta: '¿Qué es el ritmo en la música?', respuesta: 'El patrón de tiempo de los sonidos' },
      { pregunta: '¿Qué técnica usa puntos de color pequeños?', respuesta: 'El puntillismo' },
      { pregunta: '¿Qué es una escultura?', respuesta: 'Una obra de arte en tres dimensiones' },
      { pregunta: '¿Qué color se obtiene al mezclar azul y amarillo?', respuesta: 'Verde' },
      { pregunta: '¿Qué es un autorretrato?', respuesta: 'Una obra en la que el artista se representa a sí mismo' }
    ],
    etica: [
      { pregunta: '¿Qué es la empatía?', respuesta: 'La capacidad de entender lo que siente otra persona' },
      { pregunta: '¿Qué es un valor?', respuesta: 'Un principio que guía nuestras decisiones' },
      { pregunta: '¿Qué es la tolerancia?', respuesta: 'Respetar las diferencias de los demás' },
      { pregunta: '¿Qué es la honestidad?', respuesta: 'Decir siempre la verdad' },
      { pregunta: '¿Qué es la responsabilidad?', respuesta: 'Cumplir con lo que se debe hacer' },
      { pregunta: '¿Qué es la solidaridad?', respuesta: 'Ayudar a otros sin esperar nada a cambio' },
      { pregunta: '¿Qué es un derecho?', respuesta: 'Algo que toda persona merece tener o recibir' },
      { pregunta: '¿Qué es un deber?', respuesta: 'Una obligación que tenemos con los demás' }
    ],
    filosofia: [
      { pregunta: '¿Qué es filosofar?', respuesta: 'Hacerse preguntas profundas sobre la vida' },
      { pregunta: '¿Quién fue Sócrates?', respuesta: 'Un filósofo griego que enseñaba preguntando' },
      { pregunta: '¿Qué es la lógica?', respuesta: 'El estudio del razonamiento correcto' },
      { pregunta: '¿Qué es la ética?', respuesta: 'El estudio de lo que está bien o mal' },
      { pregunta: '¿Qué es una falacia?', respuesta: 'Un error en un razonamiento' },
      { pregunta: '¿Qué pregunta la metafísica?', respuesta: 'Qué es la realidad' },
      { pregunta: '¿Qué es el pensamiento crítico?', respuesta: 'Analizar antes de aceptar una idea' },
      { pregunta: '¿Qué es la sabiduría?', respuesta: 'El buen uso del conocimiento' }
    ],
    contabilidad: [
      { pregunta: '¿Qué es un ingreso?', respuesta: 'Dinero que entra' },
      { pregunta: '¿Qué es un gasto?', respuesta: 'Dinero que sale' },
      { pregunta: '¿Qué es el ahorro?', respuesta: 'Guardar parte del dinero para el futuro' },
      { pregunta: '¿Qué es un presupuesto?', respuesta: 'Un plan de cómo usar el dinero' },
      { pregunta: '¿Qué es una factura?', respuesta: 'Un documento que registra una compra o venta' },
      { pregunta: '¿Qué es una deuda?', respuesta: 'Dinero que se debe a alguien' },
      { pregunta: '¿Qué es una inversión?', respuesta: 'Usar dinero para generar más dinero' },
      { pregunta: '¿Qué es el interés?', respuesta: 'El costo o ganancia de usar dinero prestado' }
    ],
    edfisica: [
      { pregunta: '¿Por qué es importante calentar antes de hacer ejercicio?', respuesta: 'Para preparar los músculos y evitar lesiones' },
      { pregunta: '¿Qué es la coordinación?', respuesta: 'La capacidad de mover el cuerpo de forma armónica' },
      { pregunta: '¿Cuántos jugadores tiene un equipo de fútbol en la cancha?', respuesta: '11' },
      { pregunta: '¿Qué es el equilibrio?', respuesta: 'Mantener una postura estable' },
      { pregunta: '¿Por qué es importante hidratarse al hacer deporte?', respuesta: 'Para reponer el agua que se pierde al sudar' },
      { pregunta: '¿Qué es el trabajo en equipo?', respuesta: 'Colaborar con otros para lograr una meta' },
      { pregunta: '¿Cuántas horas se recomienda dormir para rendir bien?', respuesta: 'Entre 8 y 10 horas' },
      { pregunta: '¿Qué es la resistencia física?', respuesta: 'La capacidad de mantener un esfuerzo por tiempo prolongado' }
    ]
  },

  // ====== LOGROS (24 en total) ======
  LOGROS: {
    racha: [
      { id: 'brote',  nombre: 'Brote',  icono: '🌱', descripcion: '3 días seguidos aprendiendo',  meta: 3 },
      { id: 'savia',  nombre: 'Savia',  icono: '🌿', descripcion: '7 días seguidos aprendiendo',  meta: 7 },
      { id: 'raiz',   nombre: 'Raíz',   icono: '🌳', descripcion: '15 días seguidos aprendiendo', meta: 15 },
      { id: 'arbol',  nombre: 'Árbol',  icono: '🌲', descripcion: '30 días seguidos aprendiendo', meta: 30 }
    ],
    lecciones: [
      { id: 'primera-luz',   nombre: 'Primera Luz',   icono: '✨', descripcion: 'Completa tu primera lección', meta: 1 },
      { id: 'explorador',    nombre: 'Explorador',    icono: '🧭', descripcion: 'Completa 10 lecciones',       meta: 10 },
      { id: 'caminante',     nombre: 'Caminante',     icono: '🥾', descripcion: 'Completa 25 lecciones',       meta: 25 },
      { id: 'maestro-ciclo', nombre: 'Maestro Ciclo', icono: '🎓', descripcion: 'Completa 50 lecciones',       meta: 50 }
    ],
    // Una insignia hexagonal única por materia, con nombre inspirado en la cultura muisca
    materias: [
      { id: 'materia-matematicas',  materiaId: 'matematicas',  nombre: 'Suna',       icono: '🔢', descripcion: 'Completa toda la materia de Matemáticas' },
      { id: 'materia-espanol',      materiaId: 'espanol',      nombre: 'Fisqua',     icono: '📖', descripcion: 'Completa toda la materia de Español' },
      { id: 'materia-ingles',       materiaId: 'ingles',       nombre: 'Xie',        icono: '🌎', descripcion: 'Completa toda la materia de Inglés' },
      { id: 'materia-sociales',     materiaId: 'sociales',     nombre: 'Bacatá',     icono: '🏺', descripcion: 'Completa toda la materia de Ciencias Sociales' },
      { id: 'materia-quimica',      materiaId: 'quimica',      nombre: 'Cuza',       icono: '⚗️', descripcion: 'Completa toda la materia de Química' },
      { id: 'materia-fisica',       materiaId: 'fisica',       nombre: 'Nemqueteba', icono: '⚡', descripcion: 'Completa toda la materia de Física' },
      { id: 'materia-tecnologia',   materiaId: 'tecnologia',   nombre: 'Zhue',       icono: '💻', descripcion: 'Completa toda la materia de Tecnología' },
      { id: 'materia-artes',        materiaId: 'artes',        nombre: 'Bochica',    icono: '🎨', descripcion: 'Completa toda la materia de Artes' },
      { id: 'materia-etica',        materiaId: 'etica',        nombre: 'Sie',        icono: '🌿', descripcion: 'Completa toda la materia de Ética' },
      { id: 'materia-filosofia',    materiaId: 'filosofia',    nombre: 'Huitaca',    icono: '🌙', descripcion: 'Completa toda la materia de Filosofía' },
      { id: 'materia-contabilidad', materiaId: 'contabilidad', nombre: 'Tunjo',      icono: '📊', descripcion: 'Completa toda la materia de Contabilidad' },
      { id: 'materia-edfisica',     materiaId: 'edfisica',     nombre: 'Guecha',     icono: '🏃', descripcion: 'Completa toda la materia de Educación Física' }
    ],
    velocidad: [
      { id: 'rayo-muisca', nombre: 'Rayo Muisca', icono: '⚡', descripcion: 'Completa una lección en menos de 3 minutos' },
      { id: 'mente-agil',  nombre: 'Mente Ágil',  icono: '🧠', descripcion: 'Completa 5 lecciones en un solo día' }
    ],
    perfeccion: [
      { id: 'tres-soles',     nombre: 'Tres Soles',     icono: '☀️', descripcion: 'Obtén 3 estrellas en 10 lecciones' },
      { id: 'ciclo-perfecto', nombre: 'Ciclo Perfecto', icono: '💠', descripcion: 'Completa un ciclo entero sin errores' }
    ]
  },

  // ====== NIVELES POR XP ======
  NIVELES: [
    { id: 1, nombre: 'Muysca',       desc: 'el que comienza', min: 0,    max: 500 },
    { id: 2, nombre: 'Chyquy',       desc: 'el que aprende',  min: 501,  max: 1500 },
    { id: 3, nombre: 'Zipaquirá',    desc: 'el que avanza',   min: 1501, max: 3000 },
    { id: 4, nombre: 'Zipa',         desc: 'el que guía',     min: 3001, max: 5000 },
    { id: 5, nombre: 'Zaque',        desc: 'el que sabe',     min: 5001, max: 8000 },
    { id: 6, nombre: 'Chiminigagua', desc: 'el iluminado',    min: 8001, max: Infinity }
  ],

  // ====== PROTECCIÓN DE RUTA ======
  // Verifica que haya sesión activa en localStorage; si no, redirige a login.
  // Debe llamarse en TODAS las páginas del módulo de estudio.
  verificarSesion() {
    try {
      if (!localStorage.getItem(this.CLAVES.SESION)) {
        window.location.replace('login.html');
        return false;
      }
      return true;
    } catch (e) {
      window.location.replace('login.html');
      return false;
    }
  },

  // Combina la sesión activa con los datos guardados del usuario
  obtenerUsuarioActivo() {
    try {
      const sesionRaw = localStorage.getItem(this.CLAVES.SESION);
      if (!sesionRaw) return null;
      const sesion = JSON.parse(sesionRaw);
      const usuarios = JSON.parse(localStorage.getItem(this.CLAVES.USUARIOS)) || [];
      const usuario = usuarios.find(u => u.id === sesion.usuarioId);
      return usuario ? Object.assign({}, usuario, sesion) : sesion;
    } catch (e) {
      console.error('ZOCALAB: no se pudo obtener el usuario activo', e);
      return null;
    }
  },

  cerrarSesion() {
    try {
      localStorage.removeItem(this.CLAVES.SESION);
    } catch (e) {
      console.error('ZOCALAB: no se pudo cerrar la sesión', e);
    }
    window.location.href = 'login.html';
  },

  // ====== SISTEMA DE PROGRESO ======
  obtenerProgreso() {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.CLAVES.PROGRESO));
      if (guardado) return guardado;
    } catch (e) {
      console.error('ZOCALAB: no se pudo leer el progreso, se reinicia', e);
    }
    const materiasIniciales = {};
    Object.keys(this.MATERIAS).forEach(id => {
      materiasIniciales[id] = { ciclosCompletados: 0, estrellas: 0, leccionesTresEstrellas: 0, estrellasPorCiclo: {} };
    });
    return {
      xp: 0,
      nivel: 1,
      rachaDias: 0,
      ultimoEstudio: null,
      logros: [],
      materias: materiasIniciales,
      flashcardsRevisadas: 0,
      leccionesCompletadas: 0,
      leccionesHoy: { fecha: null, cantidad: 0 },
      retoDiario: { fecha: null, completado: false },
      ultimaMateria: null,
      ultimoCiclo: null
    };
  },

  guardarProgreso(progreso) {
    try {
      localStorage.setItem(this.CLAVES.PROGRESO, JSON.stringify(progreso));
      return true;
    } catch (e) {
      console.error('ZOCALAB: no se pudo guardar el progreso', e);
      return false;
    }
  },

  obtenerNivelPorXP(xp) {
    return this.NIVELES.find(n => xp >= n.min && xp <= n.max) || this.NIVELES[this.NIVELES.length - 1];
  },

  agregarXP(cantidad) {
    const progreso = this.obtenerProgreso();
    const nivelAnterior = this.obtenerNivelPorXP(progreso.xp).id;
    progreso.xp += cantidad;
    const nivelNuevo = this.obtenerNivelPorXP(progreso.xp);
    progreso.nivel = nivelNuevo.id;
    this.guardarProgreso(progreso);
    return { progreso, subioDeNivel: nivelNuevo.id > nivelAnterior, nivel: nivelNuevo };
  },

  // Actualiza la racha comparando la fecha de hoy con la última vez que se
  // estudió. Debe llamarse una sola vez por sesión de estudio (por ejemplo,
  // al completar una lección), nunca en cada carga de página.
  actualizarRacha() {
    const progreso = this.obtenerProgreso();
    const hoy = new Date().toISOString().slice(0, 10);
    if (progreso.ultimoEstudio === hoy) return { progreso, cambio: false };

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().slice(0, 10);

    progreso.rachaDias = (progreso.ultimoEstudio === ayerStr) ? progreso.rachaDias + 1 : 1;
    progreso.ultimoEstudio = hoy;
    this.guardarProgreso(progreso);

    const resultado = this.agregarXP(25); // bono diario por mantener la racha
    return { progreso: resultado.progreso, cambio: true };
  },

  desbloquearLogro(idLogro) {
    const progreso = this.obtenerProgreso();
    if (progreso.logros.some(l => l.id === idLogro)) return { nuevo: false, progreso };
    progreso.logros.push({ id: idLogro, fecha: new Date().toISOString().slice(0, 10) });
    this.guardarProgreso(progreso);
    const resultado = this.agregarXP(50);
    return { nuevo: true, progreso: resultado.progreso };
  },

  // Busca la definición completa (nombre/ícono/descripción) de un logro por su id
  _buscarDefinicionLogro(id) {
    for (const categoria of Object.values(this.LOGROS)) {
      const encontrado = categoria.find(l => l.id === id);
      if (encontrado) return encontrado;
    }
    return null;
  },

  // Revisa todas las categorías y desbloquea automáticamente los logros que
  // ya se cumplen. "contexto" permite avisar eventos puntuales (lección
  // rápida, ciclo sin errores) que no se derivan solo del progreso guardado.
  verificarLogros(contexto = {}) {
    const progreso = this.obtenerProgreso();
    const yaTiene = id => progreso.logros.some(l => l.id === id);
    const nuevos = [];

    this.LOGROS.racha.forEach(l => { if (!yaTiene(l.id) && progreso.rachaDias >= l.meta) nuevos.push(l); });
    this.LOGROS.lecciones.forEach(l => { if (!yaTiene(l.id) && progreso.leccionesCompletadas >= l.meta) nuevos.push(l); });

    this.LOGROS.materias.forEach(l => {
      const m = progreso.materias[l.materiaId];
      const totalCiclos = this.MATERIAS[l.materiaId] ? this.MATERIAS[l.materiaId].ciclosTotales : 0;
      if (!yaTiene(l.id) && m && totalCiclos && m.ciclosCompletados >= totalCiclos) nuevos.push(l);
    });

    if (contexto.leccionRapida && !yaTiene('rayo-muisca')) {
      nuevos.push(this.LOGROS.velocidad.find(x => x.id === 'rayo-muisca'));
    }
    const hoy = new Date().toISOString().slice(0, 10);
    if (!yaTiene('mente-agil') && progreso.leccionesHoy && progreso.leccionesHoy.fecha === hoy && progreso.leccionesHoy.cantidad >= 5) {
      nuevos.push(this.LOGROS.velocidad.find(x => x.id === 'mente-agil'));
    }

    if (contexto.cicloSinErrores && !yaTiene('ciclo-perfecto')) {
      nuevos.push(this.LOGROS.perfeccion.find(x => x.id === 'ciclo-perfecto'));
    }
    if (!yaTiene('tres-soles')) {
      let total = 0;
      Object.values(progreso.materias).forEach(m => { total += m.leccionesTresEstrellas || 0; });
      if (total >= 10) nuevos.push(this.LOGROS.perfeccion.find(x => x.id === 'tres-soles'));
    }

    nuevos.forEach(l => this.desbloquearLogro(l.id));
    return nuevos;
  },

  // Registra la finalización de una lección/ciclo y desbloquea logros si aplica.
  // Devuelve el progreso actualizado y la lista de logros nuevos (para mostrar toasts).
  registrarLeccionCompletada({ materiaId, cicloIndice, estrellas, segundos, erroresCero }) {
    const progreso = this.obtenerProgreso();
    const hoy = new Date().toISOString().slice(0, 10);

    progreso.leccionesCompletadas += 1;
    progreso.ultimaMateria = materiaId;
    progreso.ultimoCiclo = cicloIndice;

    if (!progreso.materias[materiaId]) {
      progreso.materias[materiaId] = { ciclosCompletados: 0, estrellas: 0, leccionesTresEstrellas: 0, estrellasPorCiclo: {} };
    }
    const m = progreso.materias[materiaId];
    m.estrellasPorCiclo = m.estrellasPorCiclo || {};
    m.ciclosCompletados = Math.max(m.ciclosCompletados, cicloIndice + 1);
    m.estrellas += estrellas;
    if (estrellas === 3) m.leccionesTresEstrellas = (m.leccionesTresEstrellas || 0) + 1;
    m.estrellasPorCiclo[cicloIndice] = Math.max(m.estrellasPorCiclo[cicloIndice] || 0, estrellas);

    if (progreso.leccionesHoy && progreso.leccionesHoy.fecha === hoy) {
      progreso.leccionesHoy.cantidad += 1;
    } else {
      progreso.leccionesHoy = { fecha: hoy, cantidad: 1 };
    }

    this.guardarProgreso(progreso);
    this.actualizarRacha();

    const xpPorEstrella = { 1: 40, 2: 70, 3: 100 };
    this.agregarXP(xpPorEstrella[estrellas] || 40);

    const nuevosLogros = this.verificarLogros({
      leccionRapida: segundos != null && segundos < 180,
      cicloSinErrores: !!erroresCero
    });

    return { progreso: this.obtenerProgreso(), nuevosLogros };
  },

  registrarFlashcardDominada() {
    const progreso = this.obtenerProgreso();
    progreso.flashcardsRevisadas += 1;
    this.guardarProgreso(progreso);
    this.agregarXP(10);
    return this.verificarLogros({});
  },

  obtenerEstadoRetoDiario() {
    const progreso = this.obtenerProgreso();
    const hoy = new Date().toISOString().slice(0, 10);
    return !!(progreso.retoDiario && progreso.retoDiario.fecha === hoy && progreso.retoDiario.completado);
  },

  completarRetoDiario() {
    const progreso = this.obtenerProgreso();
    const hoy = new Date().toISOString().slice(0, 10);
    progreso.retoDiario = { fecha: hoy, completado: true };
    this.guardarProgreso(progreso);
    this.agregarXP(40);
  }
};

window.ZOCALAB = ZOCALAB;
