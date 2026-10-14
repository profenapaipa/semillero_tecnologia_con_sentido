/*
 * data/precios.js — precios del plan Pro por país (ajustados por poder adquisitivo)
 * ====================================================================================
 * Fuente: "Precios Wisfox: Freemium y Pro por país" (30 sept. 2026). Colombia es el
 * país ancla. Hay dos canales, cada uno con su propia tabla:
 *   - individual (familias / estudiantes): `mensual` y `anual`, `ahorro` = % de
 *     descuento del anual frente a pagar mes a mes.
 *   - colegios: precio POR ESTUDIANTE AL AÑO en tres tramos (30-50, 51-200,
 *     201-500). Mínimo 30 estudiantes; más de 500 se cotiza a medida a partir
 *     del tramo 201-500.
 *
 * Los valores son los del documento, no se recalculan. Argentina se revisa cada
 * mes y los demás países cada trimestre (solo subir, nunca bajar): actualiza este
 * archivo cuando cambien.
 */

export const PAIS_DEFECTO = 'CO';

export const PAISES = {
  CO: { es: 'Colombia', en: 'Colombia', moneda: 'COP $', mensual: 29900, anual: 249900, ahorro: 30, colegios: [120000, 95000, 75000] },
  MX: { es: 'México', en: 'Mexico', moneda: 'MXN $', mensual: 159, anual: 1299, ahorro: 32, colegios: [620, 495, 390] },
  AR: { es: 'Argentina', en: 'Argentina', moneda: 'ARS $', mensual: 5900, anual: 49900, ahorro: 30, colegios: [23900, 18900, 14900] },
  CL: { es: 'Chile', en: 'Chile', moneda: 'CLP $', mensual: 9990, anual: 84900, ahorro: 29, colegios: [40900, 32300, 25500] },
  PE: { es: 'Perú', en: 'Peru', moneda: 'PEN $', mensual: 19.9, anual: 169.9, ahorro: 29, colegios: [81.9, 64.9, 50.9] },
  EC: { es: 'Ecuador', en: 'Ecuador', moneda: 'US$', mensual: 7.99, anual: 69.99, ahorro: 27, colegios: [33.9, 26.9, 20.9] },
};

export const TRAMOS_COLEGIOS = ['30-50', '51-200', '201-500'];

/** Formatea un monto al estilo local: punto para miles, coma para decimales (29.900 · 19,90). */
export function formatoMonto(n) {
  const [ent, dec] = (Number.isInteger(n) ? String(n) : n.toFixed(2)).split('.');
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${miles},${dec}` : miles;
}
