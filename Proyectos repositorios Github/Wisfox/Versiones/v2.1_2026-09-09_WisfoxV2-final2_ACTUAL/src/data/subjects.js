/*
 * data/subjects.js — Catálogo de materias + contenido de mapas mentales
 * ===========================================================================
 * Origen: wisfo_19.backup.html líneas 1749-1787 (SUBJECTS, MINDMAPS).
 *
 * SUBJECTS: las 5 materias mostradas como nodos en el mapa orbital de
 * Inicio (components/orbit.js). `pos` es una posición {x,y} en
 * porcentaje sobre la órbita; `progress` es un valor de respaldo usado
 * solo cuando materiaPct() de data/curriculum.js no tiene lecciones a
 * partir de las cuales calcular un porcentaje real.
 *
 * MINDMAPS: contenido de mapa mental predefinido (tema -> ramas ->
 * ítems) usado por el formato de lección "mapa mental" — ver
 * vistaMental() en screens/lecciones.js y los estilos de etiqueta SVG
 * `mm-*` en refinements.css. Indexado por id de materia, coincidiendo
 * con las claves de SUBJECTS.
 */

export const SUBJECTS = {
  matematicas:{ik:'calc',name:'Matemáticas',name_en:'Mathematics',icon:'🧮',color:'#7cb342',ring:'rgba(124,179,66,.25)',progress:62,pos:{x:54,y:9}},
  economia:{ik:'chart',name:'Economía',name_en:'Economics',icon:'📈',color:'#e8746a',ring:'rgba(232,116,106,.22)',progress:15,pos:{x:17,y:30}},
  ingles:{ik:'globe',name:'Inglés',name_en:'English',icon:'🌍',color:'#3aa8a0',ring:'rgba(58,168,160,.22)',progress:45,pos:{x:84,y:34}},
  historia:{ik:'landmark',name:'Historia',name_en:'History',icon:'🏛️',color:'#e8a13c',ring:'rgba(232,161,60,.25)',progress:78,pos:{x:30,y:84}},
  biologia:{ik:'dna',name:'Biología',name_en:'Biology',icon:'🧬',color:'#4c9a5f',ring:'rgba(76,154,95,.22)',progress:30,pos:{x:72,y:82}}
};

export const MINDMAPS = {
  historia:[
    {name:'Civilizaciones Antiguas',name_en:'Ancient Civilizations',icon:'🔺',items:[['🏜️','Egipto (Pirámides)','Egypt (Pyramids)'],['🏺','Mesopotamia','Mesopotamia'],['🏟️','Roma (Imperio)','Rome (Empire)'],['🏛️','Grecia (Filosofía)','Greece (Philosophy)']]},
    {name:'Revoluciones',name_en:'Revolutions',icon:'⚙️',items:[['🇫🇷','Francesa','French'],['🏭','Industrial','Industrial'],['🗽','Americana','American']]},
    {name:'Conflictos Globales',name_en:'Global Conflicts',icon:'🌐',items:[['⚔️','IGM','WWI'],['💥','IIGM','WWII'],['🧊','Guerra Fría','Cold War']]},
    {name:'Cultura y Arte',name_en:'Culture and Art',icon:'🎨',items:[['👑','Renacimiento','Renaissance'],['🖼️','Barroco','Baroque']]},
    {name:'Biografías Clave',name_en:'Key Biographies',icon:'👤',items:[['👑','Napoleón','Napoleon'],['🧠','Einstein','Einstein'],['⚗️','Marie Curie','Marie Curie']]}
  ],
  matematicas:[
    {name:'Álgebra',name_en:'Algebra',icon:'➗',items:[['🧩','Ecuaciones','Equations'],['📐','Polinomios','Polynomials'],['📊','Funciones','Functions']]},
    {name:'Geometría',name_en:'Geometry',icon:'📐',items:[['🔺','Triángulos','Triangles'],['⭕','Círculos','Circles'],['📦','Volúmenes','Volumes']]},
    {name:'Cálculo',name_en:'Calculus',icon:'∫',items:[['➡️','Límites','Limits'],['📉','Derivadas','Derivatives'],['📈','Integrales','Integrals']]},
    {name:'Estadística',name_en:'Statistics',icon:'🎲',items:[['🎯','Probabilidad','Probability'],['📊','Media y mediana','Mean and median']]}
  ],
  economia:[
    {name:'Microeconomía',name_en:'Microeconomics',icon:'🛒',items:[['⚖️','Oferta y demanda','Supply and demand'],['📏','Elasticidad','Elasticity']]},
    {name:'Macroeconomía',name_en:'Macroeconomics',icon:'🌍',items:[['💰','PIB','GDP'],['📈','Inflación','Inflation'],['👷','Desempleo','Unemployment']]},
    {name:'Finanzas',name_en:'Finance',icon:'🏦',items:[['🐷','Ahorro','Saving'],['📊','Inversión','Investment'],['💳','Crédito','Credit']]}
  ],
  ingles:[
    {name:'Grammar',name_en:'Grammar',icon:'📘',items:[['⏰','Tenses','Tenses'],['🔀','Conditionals','Conditionals'],['🗣️','Reported speech','Reported speech']]},
    {name:'Vocabulary',name_en:'Vocabulary',icon:'🔤',items:[['🧩','Phrasal verbs','Phrasal verbs'],['💬','Idioms','Idioms']]},
    {name:'Skills',name_en:'Skills',icon:'🎧',items:[['👂','Listening','Listening'],['🗣️','Speaking','Speaking'],['✍️','Writing','Writing']]}
  ],
  biologia:[
    {name:'La Célula',name_en:'The Cell',icon:'🦠',items:[['🔬','Estructura','Structure'],['➗','Mitosis','Mitosis']]},
    {name:'Genética',name_en:'Genetics',icon:'🧬',items:[['🧬','ADN','DNA'],['👨‍👩‍👧','Herencia','Inheritance']]},
    {name:'Ecología',name_en:'Ecology',icon:'🌿',items:[['🌎','Ecosistemas','Ecosystems'],['🦁','Cadenas tróficas','Food chains']]},
    {name:'Cuerpo Humano',name_en:'The Human Body',icon:'🫀',items:[['🫁','Sistemas','Systems'],['🧠','Órganos','Organs']]}
  ]
};
