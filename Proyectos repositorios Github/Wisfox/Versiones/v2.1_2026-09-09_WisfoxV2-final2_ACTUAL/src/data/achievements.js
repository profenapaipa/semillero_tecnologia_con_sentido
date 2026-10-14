/*
 * data/achievements.js — Catálogo de logros / insignias
 * ===========================================================
 * Origen: wisfo_19.backup.html líneas 1895-1904 (ACHIEVEMENTS).
 * `un` es la bandera semilla de "desbloqueado". Igual que la bandera
 * `done` de LESSONS, esto es dato semilla estático — el estado real de
 * desbloqueo debería mudarse a state/store.js una vez que se implemente
 * la lógica de desbloqueo de logros (nada en el prototipo cambia `un` en
 * tiempo de ejecución; renderAchievements() solo lo lee tal cual). Ver
 * screens/logros.js.
 */

export const ACHIEVEMENTS = [
  {i:'🔥',t:'Racha de 7 días',t_en:'7-day streak',p:'Estudia 7 días seguidos',p_en:'Study 7 days in a row',un:true},
  {i:'📗',t:'Primera lección',t_en:'First lesson',p:'Completa tu primera lección',p_en:'Complete your first lesson',un:true},
  {i:'🏛️',t:'Aprendiz de Historia',t_en:'History apprentice',p:'Llega al 75% en Historia',p_en:'Reach 75% in History',un:true},
  {i:'⚡',t:'300 XP',t_en:'300 XP',p:'Acumula 300 XP totales',p_en:'Accumulate 300 total XP',un:true},
  {i:'🎯',t:'Quiz perfecto',t_en:'Perfect quiz',p:'Responde un quiz sin errores',p_en:'Answer a quiz with no mistakes',un:false},
  {i:'🧮',t:'As del Álgebra',t_en:'Algebra ace',p:'Domina todos los temas de álgebra',p_en:'Master every algebra topic',un:false},
  {i:'🌍',t:'Políglota',t_en:'Polyglot',p:'Llega al 80% en Inglés',p_en:'Reach 80% in English',un:false},
  {i:'🏆',t:'Nivel 10',t_en:'Level 10',p:'Alcanza el nivel 10',p_en:'Reach level 10',un:false}
];
