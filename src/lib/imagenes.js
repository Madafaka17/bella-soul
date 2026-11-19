import { exec } from '@/lib/db';

/**
 * Las fotos del catálogo inicial viven en /public/assets/img.
 * Las fotos subidas desde el admin se guardan en la tabla `imagenes`
 * (nombre que empieza con "up_") y se sirven desde /media/<nombre>.
 */
export function imgUrl(nombre) {
  if (!nombre) return '/assets/img/placeholder.png';
  // up_... = subida nueva; prod_<timestamp>_<id> = subida del sistema anterior (Laravel)
  if (/^up_/.test(nombre) || /^prod_\d{9,}_[0-9a-f]{10,}\./.test(nombre)) {
    return `/media/${nombre}`;
  }
  return `/assets/img/${nombre}`;
}

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_IMAGEN_BYTES = 2 * 1024 * 1024;

/**
 * Guarda una imagen subida (File) en la base de datos y devuelve su nombre.
 * Lanza un Error con mensaje legible si el archivo no es válido.
 */
export async function guardarImagen(file) {
  if (!MIME_PERMITIDOS.includes(file.type)) {
    throw new Error('Las imágenes deben ser JPG, PNG o WEBP.');
  }
  if (file.size > MAX_IMAGEN_BYTES) {
    throw new Error('Cada imagen debe pesar máximo 2 MB.');
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const nombre = `up_${Date.now()}_${Math.random().toString(16).slice(2, 10)}.${EXT[file.type]}`;
  await exec(
    'INSERT INTO imagenes (nombre, mime, datos, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [nombre, file.type, buf.toString('base64')]
  );
  return nombre;
}
