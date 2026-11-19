import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Sesiones con cookies firmadas (JWT HS256, httpOnly).
 *  - bs_admin  : panel administrativo
 *  - bs_client : clientas de la tienda
 */
const COOKIE_ADMIN = 'bs_admin';
const COOKIE_CLIENT = 'bs_client';

function secreto() {
  const s = process.env.SESSION_SECRET || process.env.APP_KEY;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Falta SESSION_SECRET (o APP_KEY) en las variables de entorno.');
    }
    return new TextEncoder().encode('desarrollo-solo-local-cambiar');
  }
  return new TextEncoder().encode(s);
}

export async function firmar(payload, dias) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${dias}d`)
    .sign(secreto());
}

export async function verificar(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto());
    return payload;
  } catch {
    return null;
  }
}

/** Las cookies llevan `Secure` solo bajo HTTPS (Vercel); en local por http no se enviarían. */
export const COOKIE_SECURE = process.env.VERCEL === '1' || process.env.COOKIE_SECURE === 'true';

export function opcionesCookie(dias) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    path: '/',
    maxAge: dias * 24 * 60 * 60,
  };
}

/** Admin en sesión: { id, nombre, rol } o null */
export async function getAdmin() {
  const jar = await cookies();
  const p = await verificar(jar.get(COOKIE_ADMIN)?.value);
  if (!p || p.tipo !== 'admin') return null;
  return { id: p.id, nombre: p.nombre, rol: p.rol };
}

/** Clienta en sesión: { id, nombre, email } o null */
export async function getClient() {
  const jar = await cookies();
  const p = await verificar(jar.get(COOKIE_CLIENT)?.value);
  if (!p || p.tipo !== 'cliente') return null;
  return { id: p.id, nombre: p.nombre, email: p.email };
}

export async function setAdminCookie(res, admin) {
  const token = await firmar({ tipo: 'admin', id: admin.id, nombre: admin.nombre, rol: admin.rol }, 1);
  res.cookies.set(COOKIE_ADMIN, token, opcionesCookie(1));
}

export async function setClientCookie(res, cliente, recordar = false) {
  const dias = recordar ? 30 : 7;
  const nombre = `${cliente.nombres} ${cliente.apellidos}`.trim();
  const token = await firmar({ tipo: 'cliente', id: cliente.id, nombre, email: cliente.email }, dias);
  res.cookies.set(COOKIE_CLIENT, token, opcionesCookie(dias));
}

export function clearCookie(res, nombre) {
  res.cookies.set(nombre, '', { path: '/', maxAge: 0 });
}

export { COOKIE_ADMIN, COOKIE_CLIENT };
