/*
 * utils/dom.js — pequeño helper de input de archivo
 * ======================================================
 * Origen: wisfo_19.backup.html líneas 2996-3003 (leerArchivo).
 * Compartido por cada subida de archivo/foto en la app: foto de avatar
 * (screens/perfil.js, #fileAvatar), subida de documento de nota y
 * captura de foto de nota (screens/notas.js, #fileNota/#fotoNota — ver
 * index.html).
 */

/**
 * Lee el primer archivo seleccionado de un elemento <input type="file">
 * y llama a `cb(file, result)` — `result` es una URL data: para
 * imágenes, texto plano en los demás casos. Reinicia el valor del input
 * después, para que seleccionar el mismo archivo otra vez siga
 * disparando un evento `change`.
 */
export function leerArchivo(input, cb) {
  const f = input.files && input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => cb(f, r.result);
  if (f.type.startsWith('image/')) r.readAsDataURL(f); else r.readAsText(f);
  input.value = '';
}
