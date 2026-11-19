import bcrypt from 'bcryptjs';

/** Compara una contraseña con un hash bcrypt (acepta los hashes $2y$ creados por Laravel) */
export function claveCorrecta(plana, hash) {
  if (!plana || !hash) return false;
  try {
    return bcrypt.compareSync(String(plana), String(hash).replace(/^\$2y\$/, '$2a$'));
  } catch {
    return false;
  }
}

export function hashClave(plana) {
  return bcrypt.hashSync(String(plana), 10);
}

/** Solo permite redirecciones internas (evita "open redirect") */
export function rutaInterna(destino, defecto = '/mi-cuenta') {
  const d = String(destino ?? '');
  return d.startsWith('/') && !d.startsWith('//') && !d.includes('\\') ? d : defecto;
}

export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e ?? '').trim());
