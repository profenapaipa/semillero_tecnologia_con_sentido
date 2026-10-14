/*
 * data/profile-options.js — Avatar, modo de daltonismo y listas relacionadas
 * ================================================================================
 * Origen: wisfo_19.backup.html líneas 2932-2934 (AVATARES, DALTS, DALT_KEY).
 *
 * AVATARES: emojis disponibles para el selector de avatar del perfil
 * (ver setAvatar() en state/profile.js, screens/perfil.js).
 * DALTS: los 4 modos de visión de color ('ninguno' = ninguno/por
 * defecto). Al elegir uno se escribe `html[data-dalt]`, que la sección
 * DALTONISMO de overlays.css lee para remapear los tokens
 * --ok/--bad/--warn (ver theme/theme.js y overlays.css).
 * DALT_KEY: mapea cada valor de DALTS a su clave de etiqueta i18n en
 * src/i18n/es.js|en.js (daltNinguno/daltProt/daltDeut/daltTrit), para
 * renderizar las etiquetas de los botones del selector vía
 * t(DALT_KEY[modo]).
 */

export const AVATARES = ['🦊','🐻','🦉','🐼','🐨','🦁','🐯','🐸','🐧','🦄','🐙','🌟'];
export const DALTS = ['ninguno','protanopia','deuteranopia','tritanopia'];
export const DALT_KEY = {ninguno:'daltNinguno',protanopia:'daltProt',deuteranopia:'daltDeut',tritanopia:'daltTrit'};
