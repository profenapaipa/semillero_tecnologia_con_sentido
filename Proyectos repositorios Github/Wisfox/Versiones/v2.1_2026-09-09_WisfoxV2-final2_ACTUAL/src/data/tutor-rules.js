/*
 * data/tutor-rules.js — Tutor IA simulado: respuestas por patrones de palabras clave
 * ========================================================================================
 * Origen: wisfo_19.backup.html líneas 2476-2503 (TUTOR_RULES + tutorReply).
 *
 * Esta es una "IA" de respuesta enlatada por palabra clave con regex —
 * ningún modelo involucrado. Según la decisión de preparar a Mudy Aslan
 * para una API de LLM real, este archivo se conserva como el FALLBACK
 * SIN CONEXIÓN: services/tutor-api.js debería intentar primero la API
 * real y caer de vuelta a `tutorReply()` aquí cuando VITE_TUTOR_API_URL
 * no esté configurada, la solicitud falle, o el dispositivo esté sin
 * conexión — ver los TODO de ese archivo. No borres esto ni siquiera
 * después de que la integración real esté en producción; es una
 * experiencia degradada razonable.
 *
 * TUTOR_RULES[lang] es una lista ordenada de pares [RegExp, respuesta] —
 * gana la primera coincidencia, así que mantén los patrones más
 * específicos antes si agregas más.
 */

import { t, getLang } from '../i18n/index.js';

export const TUTOR_RULES = {
 es:[
  [/deriva/i,'¡Buena pregunta! 📉 La <b>derivada</b> mide qué tan rápido cambia una función. Imagina que vas en bici: tu posición es la función y tu <i>velocidad</i> es la derivada. Regla básica: la derivada de xⁿ es n·xⁿ⁻¹. Por ejemplo, x² → 2x. ¿Quieres practicar con un ejercicio?'],
  [/revoluci[oó]n francesa/i,'La <b>Revolución Francesa</b> (1789) 🇫🇷 transformó el mundo: el pueblo, cansado del hambre y los impuestos injustos, derrocó la monarquía absoluta. Momentos clave: la toma de la Bastilla, la Declaración de los Derechos del Hombre y el lema <i>libertad, igualdad, fraternidad</i>. Tienes la lección completa en Historia → Revoluciones.'],
  [/plan de estudio|organizar|horario/i,'¡Te armo un plan! 📋 Con tu progreso actual te sugiero: <b>Lunes y miércoles</b>: Economía (15%, tu materia más débil) · <b>Martes y jueves</b>: Biología (30%) · <b>Viernes</b>: Inglés · <b>Fin de semana</b>: repaso de Historia y Matemáticas con quiz. Sesiones de 25 min con descansos de 5 (técnica Pomodoro) 🍅.'],
  [/c[eé]lula/i,'La <b>célula</b> 🦠 es la unidad básica de la vida. Recuerda sus 3 partes clave: membrana (la puerta), núcleo (el cerebro con el ADN) y mitocondrias (la planta de energía). Tip de examen: procariotas NO tienen núcleo definido.'],
  [/pib/i,'El <b>PIB</b> 💰 es como la "nota final" de la economía de un país: suma el valor de todo lo que produce en un periodo. Si crece, hay expansión; si cae dos trimestres seguidos, recesión. ¿Quieres ver la lección completa en Economía?'],
  [/phrasal|ingl[eé]s|english/i,'Para mejorar tu inglés 🌍 te recomiendo empezar por los <b>phrasal verbs</b> más comunes: give up (rendirse), find out (descubrir), look for (buscar). Úsalos en frases tuyas, así se quedan. Tienes una lección de 12 min lista en Lecciones → Inglés.'],
  [/quiz|examen|prueba/i,'¡A practicar! 📝 Te recomiendo el quiz de Matemáticas de hoy a las 4:00 PM. Cada respuesta correcta te da XP. Ve a la sección Quiz y elige tu materia. ¡Tú puedes! 💪'],
  [/hola|hey|buenas/i,'¡Hola! 🦊 Qué bueno verte por aquí. ¿Sobre qué materia tienes dudas hoy? Puedo explicarte temas, darte ejemplos o armarte un plan de estudio.'],
  [/gracias/i,'¡Con gusto, Alex! 🦊💚 Recuerda: la astucia no es trucar, es saber aprender. ¡Sigue así con tu racha de 7 días! 🔥']
 ],
 en:[
  [/derivativ/i,'Great question! 📉 The <b>derivative</b> measures how fast a function changes. Imagine you are riding a bike: your position is the function and your <i>speed</i> is the derivative. Basic rule: the derivative of xⁿ is n·xⁿ⁻¹. For example, x² → 2x. Do you want to practice with an exercise?'],
  [/french revolution/i,'The <b>French Revolution</b> (1789) 🇫🇷 transformed the world: the people, tired of hunger and unfair taxes, overthrew the absolute monarchy. Key moments: the storming of the Bastille, the Declaration of the Rights of Man and the motto <i>liberty, equality, fraternity</i>. The full lesson is in History → Revolutions.'],
  [/study plan|organi[sz]e|schedule|timetable/i,'Here is your plan! 📋 With your current progress I suggest: <b>Monday and Wednesday</b>: Economics (15%, your weakest subject) · <b>Tuesday and Thursday</b>: Biology (30%) · <b>Friday</b>: English · <b>Weekend</b>: review History and Mathematics with a quiz. Sessions of 25 min with 5 min breaks (Pomodoro technique) 🍅.'],
  [/\bcells?\b/i,'The <b>cell</b> 🦠 is the basic unit of life. Remember its 3 key parts: membrane (the door), nucleus (the brain that holds the DNA) and mitochondria (the power plant). Exam tip: prokaryotes do NOT have a defined nucleus.'],
  [/\bgdp\b/i,'<b>GDP</b> 💰 is like the "final grade" of the economy of a country: it adds up the value of everything it produces in a period. If it grows, there is expansion; if it falls two quarters in a row, recession. Do you want to see the full lesson in Economics?'],
  [/phrasal|english/i,'To improve your English 🌍 I recommend starting with the most common <b>phrasal verbs</b>: give up (to quit), find out (to discover), look for (to search). Use them in your own sentences, that is how they stick. You have a 12 min lesson ready in Lessons → English.'],
  [/\b(quiz|exam|test)\b/i,'Time to practice! 📝 I recommend the Mathematics quiz today at 4:00 PM. Every correct answer gives you XP. Go to the Quiz section and pick your subject. You can do it! 💪'],
  [/\b(hello|hi|hey)\b/i,'Hi! 🦊 Good to see you here. Which subject do you have questions about today? I can explain topics, give you examples or build you a study plan.'],
  [/thank/i,'My pleasure, Alex! 🦊💚 Remember: cunning is not about tricks, it is knowing how to learn. Keep going with your 7-day streak! 🔥']
 ]
};

/** Busca una respuesta enlatada para el texto libre `text` en el idioma actual, cayendo de vuelta a t('tutorFallback'). */
export function tutorReply(text) {
  const lang = getLang();
  for (const [re, ans] of TUTOR_RULES[lang]) if (re.test(text)) return ans;
  return t('tutorFallback');
}
