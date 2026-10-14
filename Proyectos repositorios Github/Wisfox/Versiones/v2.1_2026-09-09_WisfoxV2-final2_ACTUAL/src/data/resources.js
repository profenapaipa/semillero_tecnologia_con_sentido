/*
 * data/resources.js — Catálogo de recursos de estudio
 * =========================================================
 * Origen: wisfo_19.backup.html líneas 1858-1865 (RESOURCES).
 * Lista estática mostrada en la pantalla de Recursos
 * (screens/recursos.js). Cada entrada es autocontenida (ícono, color de
 * fondo, título/descripción en es + override `_en`) — todavía no hay un
 * destino real al hacer clic, el openResource(i) del prototipo solo
 * muestra un toast. Decide si estos deberían enlazar a archivos/URLs
 * reales antes de construir la pantalla definitiva.
 */

export const RESOURCES = [
  {icon:'📄',bg:'#eaf1fb',t:'Formulario de Matemáticas',t_en:'Mathematics formula sheet',p:'Todas las fórmulas de álgebra, geometría y cálculo en una sola hoja de referencia.',p_en:'Every algebra, geometry and calculus formula on a single reference sheet.'},
  {icon:'🗺️',bg:'#fdf3e3',t:'Líneas de tiempo de Historia',t_en:'History timelines',p:'Mapas cronológicos interactivos desde las civilizaciones antiguas hasta la Guerra Fría.',p_en:'Interactive chronological maps from the ancient civilizations to the Cold War.'},
  {pro:true,icon:'🎧',bg:'#e6f6ee',t:'Podcasts en Inglés',t_en:'English podcasts',p:'Audios cortos por nivel para mejorar tu listening, con transcripción incluida.',p_en:'Short audios by level to improve your listening, transcript included.'},
  {icon:'🔬',bg:'#f3eefb',t:'Laboratorio virtual de Biología',t_en:'Virtual biology lab',p:'Simulaciones de mitosis, genética y ecosistemas para experimentar sin riesgo.',p_en:'Simulations of mitosis, genetics and ecosystems to experiment without risk.'},
  {icon:'📊',bg:'#fdeeee',t:'Casos prácticos de Economía',t_en:'Economics case studies',p:'Ejemplos reales de oferta y demanda, inflación y decisiones financieras.',p_en:'Real examples of supply and demand, inflation and financial decisions.'},
  {pro:true,icon:'🎬',bg:'#eaf1fb',t:'Videotutorías',t_en:'Video tutorials',p:'Clases en video paso a paso, explicadas por docentes, para repasar a tu ritmo.',p_en:'Step-by-step video classes from teachers, so you can review at your own pace.'},
  {icon:'🧠',bg:'#e8f3ec',t:'Técnicas de estudio',t_en:'Study techniques',p:'Pomodoro, repaso espaciado y mapas mentales explicados paso a paso.',p_en:'Pomodoro, spaced repetition and mind maps explained step by step.'}
];
