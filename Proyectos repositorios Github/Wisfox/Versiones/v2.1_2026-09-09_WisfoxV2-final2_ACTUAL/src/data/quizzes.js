/*
 * data/quizzes.js — Banco de preguntas de quiz + catálogo de minijuegos
 * ===========================================================================
 * Origen: wisfo_19.backup.html líneas 1867-1893 (QUIZ_BANK), 2525-2530
 * (MINIJUEGOS), 2625 (LIMITE).
 *
 * QUIZ_BANK: preguntas de opción múltiple por materia (`a` es el índice
 * de la opción correcta dentro de `o`/`o_en`). Usado por el flujo de
 * quiz "modo estándar" — ver screens/quiz.js.
 *
 * MINIJUEGOS: catálogo de los minijuegos del "modo juego". Solo 'vf'
 * (verdadero o falso), 'memoria' y 'ordena' están realmente
 * implementados — 'atrapa' intencionalmente cae en una pantalla de
 * relleno "próximamente" (ver juegoPendiente() en screens/quiz.js,
 * t('atrapaSoon')). Eso es por diseño en el código fuente, no un bug —
 * impleméntalo o quita la tarjeta.
 *
 * LIMITE: segundos permitidos por pregunta en el quiz cronometrado
 * "modo estándar".
 */

export const QUIZ_BANK = {
  matematicas:[
    {q:'¿Cuál es la solución de 2x + 3 = 11?',q_en:'What is the solution to 2x + 3 = 11?',o:['x = 3','x = 4','x = 5','x = 7'],o_en:['x = 3','x = 4','x = 5','x = 7'],a:1},
    {q:'La derivada de f(x) = x² es…',q_en:'The derivative of f(x) = x² is…',o:['x','2x','x²','2'],o_en:['x','2x','x²','2'],a:1},
    {q:'En f(x) = mx + b, ¿qué representa m?',q_en:'In f(x) = mx + b, what does m represent?',o:['El corte con el eje y','La pendiente','El dominio','El máximo'],o_en:['The y-intercept','The slope','The domain','The maximum'],a:1}
  ],
  historia:[
    {q:'¿En qué año inició la Revolución Francesa?',q_en:'In what year did the French Revolution begin?',o:['1776','1789','1810','1848'],o_en:['1776','1789','1810','1848'],a:1},
    {q:'La Gran Pirámide de Guiza fue construida para…',q_en:'The Great Pyramid of Giza was built as…',o:['Un templo','Una biblioteca','La tumba de un faraón','Un mercado'],o_en:['A temple','A library','The tomb of a pharaoh','A market'],a:2},
    {q:'¿Qué símbolo dividió Berlín durante la Guerra Fría?',q_en:'What symbol divided Berlin during the Cold War?',o:['Un río','Un muro','Una frontera natural','Un puente'],o_en:['A river','A wall','A natural border','A bridge'],a:1}
  ],
  ingles:[
    {q:'"I ___ visited London twice." ¿Qué falta?',q_en:'"I ___ visited London twice." What is missing?',o:['have','has','did','was'],o_en:['have','has','did','was'],a:0},
    {q:'¿Qué significa "give up"?',q_en:'What does "give up" mean?',o:['Regalar','Rendirse','Subir','Despertar'],o_en:['To give away','To quit','To go up','To wake up'],a:1},
    {q:'"Yesterday I ___ to the cinema."',q_en:'"Yesterday I ___ to the cinema."',o:['have gone','go','went','gone'],o_en:['have gone','go','went','gone'],a:2}
  ],
  biologia:[
    {q:'¿Qué organelo produce la energía de la célula?',q_en:'Which organelle produces the energy of the cell?',o:['Núcleo','Ribosoma','Mitocondria','Membrana'],o_en:['Nucleus','Ribosome','Mitochondrion','Membrane'],a:2},
    {q:'El ADN se encuentra principalmente en…',q_en:'DNA is found mainly in…',o:['La membrana','El núcleo','El citoplasma','La pared celular'],o_en:['The membrane','The nucleus','The cytoplasm','The cell wall'],a:1},
    {q:'¿Qué célula NO tiene núcleo definido?',q_en:'Which cell does NOT have a defined nucleus?',o:['Eucariota','Procariota','Neurona','Muscular'],o_en:['Eukaryotic','Prokaryotic','Neuron','Muscle'],a:1}
  ],
  economia:[
    {q:'Si la demanda sube y la oferta se mantiene, el precio…',q_en:'If demand rises and supply stays the same, the price…',o:['Baja','Sube','No cambia','Desaparece'],o_en:['Falls','Rises','Stays the same','Disappears'],a:1},
    {q:'¿Qué mide el PIB?',q_en:'What does GDP measure?',o:['La población','La producción de un país','Los impuestos','Las exportaciones'],o_en:['The population','The output of a country','Taxes','Exports'],a:1},
    {q:'Dos trimestres seguidos de caída del PIB indican…',q_en:'Two consecutive quarters of falling GDP indicate…',o:['Expansión','Inflación','Recesión','Deflación'],o_en:['Expansion','Inflation','Recession','Deflation'],a:2}
  ]
};

export const MINIJUEGOS = [
  {k:'atrapa',  ic:'fox',      color:'#e8a13c', estrellas:2},
  {k:'memoria', ic:'brain',    color:'#7c5ce6', estrellas:2},
  {k:'ordena',  ic:'list',     color:'#4a7fd4', estrellas:3},
  {k:'vf',      ic:'check',    color:'#3d9960', estrellas:2}
];

export const LIMITE = 30;              /* segundos por pregunta */
