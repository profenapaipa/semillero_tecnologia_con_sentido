/*
 * data/lessons.js — Catálogo de lecciones, contenido de lecciones y tipos de formato
 * ========================================================================================
 * Origen: wisfo_19.backup.html líneas 1789-1833, 2179-2184
 *         (LESSONS, LESSON_CONTENT, FORMATOS).
 *
 * LESSONS: lista plana de lecciones individuales (una por {id, materia,
 * título, duración, done}). `done` es el estado de completado *semilla*
 * — el progreso real por usuario se superpone en tiempo de ejecución
 * mediante state/store.js, que marca lecciones como hechas a partir de
 * `state.doneLessons` al cargar (ver `hydrate()` en state/store.js).
 *
 * LESSON_CONTENT: el cuerpo HTML extenso de cada lección (por id),
 * separado es/en. Se renderiza dentro de la vista de formato "texto" —
 * ver vistaTexto() en screens/lecciones.js. NOTA: esto es HTML crudo
 * inyectado vía innerHTML en el prototipo original; si el contenido de
 * las lecciones alguna vez viene de entrada de usuario o de una API en
 * vez de este catálogo estático, sanitízalo antes de renderizarlo.
 *
 * FORMATOS: las 4 formas en que se puede ver el contenido de una lección
 * (texto / mapa mental / mapa conceptual / fichas). Alimenta las
 * tarjetas selectoras de formato dentro de un tema (ver
 * screens/lecciones.js) y reutiliza las mismas 4 claves que IA_OPTS de
 * data/notes.js para la función "convertir nota a...".
 *
 * ELIMINADO: el prototipo también tenía un const `ROUTES` (texto de
 * tarjetas de ruta escrito a mano) que ninguna función de renderizado
 * llegó a referenciar — `renderRuta()` construye sus tarjetas a partir
 * de SUBJECTS + data/curriculum.js en su lugar. Se eliminó por decisión
 * del proyecto en vez de dejarlo como dato muerto; ver
 * wisfo_19.backup.html líneas 1835-1856 si alguna vez vale la pena
 * rescatar esa redacción.
 */

export const LESSONS = [
  {id:'m1',s:'matematicas',t:'Ecuaciones de primer grado',t_en:'First-degree equations',d:'15 min',done:true},
  {id:'m2',s:'matematicas',t:'Funciones y gráficas',t_en:'Functions and graphs',d:'20 min',done:true},
  {id:'m3',s:'matematicas',t:'Introducción a las derivadas',t_en:'Introduction to derivatives',d:'25 min',done:false},
  {id:'h1',s:'historia',t:'El Antiguo Egipto y sus pirámides',t_en:'Ancient Egypt and its pyramids',d:'18 min',done:true},
  {id:'h2',s:'historia',t:'La Revolución Francesa',t_en:'The French Revolution',d:'22 min',done:true},
  {id:'h3',s:'historia',t:'La Guerra Fría',t_en:'The Cold War',d:'20 min',done:false},
  {id:'i1',s:'ingles',t:'Present Perfect vs Past Simple',t_en:'Present Perfect vs Past Simple',d:'15 min',done:true},
  {id:'i2',s:'ingles',t:'Phrasal verbs esenciales',t_en:'Essential phrasal verbs',d:'12 min',done:false},
  {id:'b1',s:'biologia',t:'La célula: estructura y función',t_en:'The cell: structure and function',d:'20 min',done:true},
  {id:'b2',s:'biologia',t:'ADN y herencia genética',t_en:'DNA and genetic inheritance',d:'25 min',done:false},
  {id:'e1',s:'economia',t:'Oferta y demanda',t_en:'Supply and demand',d:'15 min',done:false},
  {id:'e2',s:'economia',t:'¿Qué es el PIB?',t_en:'What is GDP?',d:'12 min',done:false}
];

export const LESSON_CONTENT = {
 es:{
  m1:`<h4>¿Qué es una ecuación de primer grado?</h4><p>Es una igualdad con una incógnita elevada a la potencia 1, por ejemplo: <b>2x + 3 = 11</b>. El objetivo es despejar la incógnita.</p><h4>Pasos para resolverla</h4><ul><li>Agrupa los términos con x a un lado: 2x = 11 − 3</li><li>Simplifica: 2x = 8</li><li>Despeja: x = 8 ÷ 2 = <b>4</b></li></ul><h4>Comprueba</h4><p>Sustituye: 2(4) + 3 = 11 ✔️. ¡Siempre verifica tu resultado!</p>`,
  m2:`<h4>Funciones</h4><p>Una función relaciona cada valor de entrada (x) con un único valor de salida (y). Se escribe <b>f(x)</b>.</p><h4>La gráfica</h4><p>La función lineal f(x) = mx + b dibuja una recta: <b>m</b> es la pendiente (inclinación) y <b>b</b> el punto donde corta el eje y.</p><ul><li>Si m &gt; 0, la recta sube.</li><li>Si m &lt; 0, la recta baja.</li></ul>`,
  m3:`<h4>La idea clave</h4><p>La derivada mide <b>cuán rápido cambia</b> una función en un punto: es la pendiente de la recta tangente.</p><h4>Reglas básicas</h4><ul><li>Derivada de xⁿ → n·xⁿ⁻¹</li><li>Derivada de una constante → 0</li><li>Ejemplo: f(x) = x² → f'(x) = 2x</li></ul><p>En x = 3, la función x² cambia a razón de 6 unidades: f'(3) = 6.</p>`,
  h1:`<h4>El Nilo, fuente de vida</h4><p>La civilización egipcia floreció hace más de 5000 años gracias a las crecidas del río Nilo, que fertilizaban los campos.</p><h4>Las pirámides</h4><p>Eran tumbas monumentales para los faraones. La Gran Pirámide de Guiza (≈2560 a.C.) fue la estructura más alta del mundo durante casi 4000 años.</p><ul><li>Escritura: jeroglíficos</li><li>Creencia central: la vida después de la muerte</li></ul>`,
  h2:`<h4>Contexto (1789)</h4><p>Francia vivía una crisis: hambre, impuestos injustos y una monarquía absoluta. El pueblo exigió cambios.</p><h4>Momentos clave</h4><ul><li>Toma de la Bastilla (14 de julio de 1789)</li><li>Declaración de los Derechos del Hombre</li><li>Fin de la monarquía y ascenso de Napoleón</li></ul><p>Su legado: las ideas de <b>libertad, igualdad y fraternidad</b> que inspiraron al mundo moderno.</p>`,
  h3:`<h4>Un mundo dividido (1947–1991)</h4><p>Tras la IIGM, EE. UU. y la URSS compitieron por la influencia mundial sin enfrentarse directamente.</p><ul><li>Carrera espacial y carrera armamentista</li><li>Muro de Berlín (1961–1989)</li><li>Crisis de los misiles de Cuba (1962)</li></ul><p>Terminó con la caída del bloque soviético en 1991.</p>`,
  i1:`<h4>Present Perfect</h4><p>Acciones con conexión al presente: <i>I have visited París</i> (en algún momento, importa la experiencia).</p><h4>Past Simple</h4><p>Acciones terminadas en un momento concreto: <i>I visited París in 2023</i>.</p><ul><li>Pista: palabras como <b>ever, never, already</b> → Present Perfect</li><li>Pista: <b>yesterday, last year, in 2020</b> → Past Simple</li></ul>`,
  i2:`<h4>¿Qué son?</h4><p>Verbos + partícula que cambian de significado: <i>give up</i> (rendirse) no es lo mismo que <i>give</i> (dar).</p><h4>Los 5 esenciales</h4><ul><li><b>turn on / off</b> – encender / apagar</li><li><b>look for</b> – buscar</li><li><b>find out</b> – descubrir</li><li><b>give up</b> – rendirse</li><li><b>carry on</b> – continuar</li></ul>`,
  b1:`<h4>La unidad de la vida</h4><p>Todos los seres vivos están formados por células. Pueden ser procariotas (sin núcleo, como bacterias) o eucariotas (con núcleo).</p><h4>Partes principales</h4><ul><li><b>Membrana</b>: controla qué entra y sale</li><li><b>Núcleo</b>: guarda el ADN</li><li><b>Mitocondrias</b>: producen energía</li></ul>`,
  b2:`<h4>El ADN</h4><p>Es la molécula que contiene las instrucciones de la vida, organizada en genes dentro de los cromosomas.</p><h4>Herencia</h4><p>Recibes la mitad de tus cromosomas de cada progenitor. Los <b>alelos dominantes</b> se expresan sobre los recesivos (leyes de Mendel).</p>`,
  e1:`<h4>La ley fundamental del mercado</h4><p>El <b>precio</b> de un bien surge del equilibrio entre cuánto quieren comprar los consumidores (demanda) y cuánto ofrecen los productores (oferta).</p><ul><li>Si sube la demanda → sube el precio</li><li>Si sube la oferta → baja el precio</li></ul>`,
  e2:`<h4>Producto Interno Bruto</h4><p>El PIB mide el valor de todos los bienes y servicios producidos en un país durante un periodo.</p><ul><li>PIB creciente → economía en expansión</li><li>Dos trimestres seguidos de caída → recesión</li></ul><p>El PIB per cápita (PIB ÷ población) aproxima el nivel de vida.</p>`
 },
 en:{
  m1:`<h4>What is a first-degree equation?</h4><p>It is an equality with one unknown raised to the power of 1, for example: <b>2x + 3 = 11</b>. The goal is to isolate the unknown.</p><h4>Steps to solve it</h4><ul><li>Group the terms with x on one side: 2x = 11 − 3</li><li>Simplify: 2x = 8</li><li>Isolate: x = 8 ÷ 2 = <b>4</b></li></ul><h4>Check it</h4><p>Substitute: 2(4) + 3 = 11 ✔️. Always verify your result!</p>`,
  m2:`<h4>Functions</h4><p>A function links each input value (x) with a single output value (y). It is written <b>f(x)</b>.</p><h4>The graph</h4><p>The linear function f(x) = mx + b draws a straight line: <b>m</b> is the slope (the tilt) and <b>b</b> is the point where it crosses the y axis.</p><ul><li>If m &gt; 0, the line goes up.</li><li>If m &lt; 0, the line goes down.</li></ul>`,
  m3:`<h4>The key idea</h4><p>The derivative measures <b>how fast a function changes</b> at a point: it is the slope of the tangent line.</p><h4>Basic rules</h4><ul><li>Derivative of xⁿ → n·xⁿ⁻¹</li><li>Derivative of a constant → 0</li><li>Example: f(x) = x² → f'(x) = 2x</li></ul><p>At x = 3, the function x² changes at a rate of 6 units: f'(3) = 6.</p>`,
  h1:`<h4>The Nile, source of life</h4><p>Egyptian civilization flourished more than 5000 years ago thanks to the floods of the Nile river, which fertilized the fields.</p><h4>The pyramids</h4><p>They were monumental tombs for the pharaohs. The Great Pyramid of Giza (≈2560 BC) was the tallest structure in the world for almost 4000 years.</p><ul><li>Writing: hieroglyphs</li><li>Central belief: life after death</li></ul>`,
  h2:`<h4>Context (1789)</h4><p>France was in crisis: hunger, unfair taxes and an absolute monarchy. The people demanded change.</p><h4>Key moments</h4><ul><li>Storming of the Bastille (14 July 1789)</li><li>Declaration of the Rights of Man</li><li>End of the monarchy and the rise of Napoleon</li></ul><p>Its legacy: the ideas of <b>liberty, equality and fraternity</b> that inspired the modern world.</p>`,
  h3:`<h4>A divided world (1947–1991)</h4><p>After WWII, the USA and the USSR competed for global influence without confronting each other directly.</p><ul><li>Space race and arms race</li><li>Berlin Wall (1961–1989)</li><li>Cuban missile crisis (1962)</li></ul><p>It ended with the fall of the Soviet bloc in 1991.</p>`,
  i1:`<h4>Present Perfect</h4><p>Actions connected to the present: <i>I have visited Paris</i> (at some point, the experience is what matters).</p><h4>Past Simple</h4><p>Actions finished at a specific moment: <i>I visited Paris in 2023</i>.</p><ul><li>Clue: words like <b>ever, never, already</b> → Present Perfect</li><li>Clue: <b>yesterday, last year, in 2020</b> → Past Simple</li></ul>`,
  i2:`<h4>What are they?</h4><p>Verbs + a particle that change meaning: <i>give up</i> (to quit) is not the same as <i>give</i> (to hand over).</p><h4>The 5 essentials</h4><ul><li><b>turn on / off</b> – to switch on / off</li><li><b>look for</b> – to search</li><li><b>find out</b> – to discover</li><li><b>give up</b> – to quit</li><li><b>carry on</b> – to continue</li></ul>`,
  b1:`<h4>The unit of life</h4><p>Every living being is made of cells. They can be prokaryotic (no nucleus, like bacteria) or eukaryotic (with a nucleus).</p><h4>Main parts</h4><ul><li><b>Membrane</b>: controls what goes in and out</li><li><b>Nucleus</b>: stores the DNA</li><li><b>Mitochondria</b>: produce energy</li></ul>`,
  b2:`<h4>DNA</h4><p>It is the molecule that holds the instructions of life, organized into genes inside the chromosomes.</p><h4>Inheritance</h4><p>You receive half of your chromosomes from each parent. <b>Dominant alleles</b> are expressed over recessive ones (Mendel's laws).</p>`,
  e1:`<h4>The fundamental law of the market</h4><p>The <b>price</b> of a good comes from the balance between how much consumers want to buy (demand) and how much producers offer (supply).</p><ul><li>If demand rises → the price rises</li><li>If supply rises → the price falls</li></ul>`,
  e2:`<h4>Gross Domestic Product</h4><p>GDP measures the value of all the goods and services produced in a country during a period.</p><ul><li>Rising GDP → economy expanding</li><li>Two consecutive quarters of decline → recession</li></ul><p>GDP per capita (GDP ÷ population) approximates the standard of living.</p>`
 }
};

export const FORMATOS = [
  {k:'texto',   ic:'file',    bg:'#e6f6ee', c:'#2e7d4f'},
  {k:'mental',  ic:'brain',   bg:'#f3eefb', c:'#7c5ce6'},
  {k:'concept', ic:'network', bg:'#eaf1fb', c:'#4a7fd4'},
  {k:'fichas',  ic:'cards',   bg:'#fdf3e3', c:'#c98319'}
];
