import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Protección CSRF: las peticiones POST deben venir del mismo sitio.
 * Los navegadores envían `Origin` en los formularios y en fetch().
 */
export function mismoOrigen(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  // Sin Origin: aceptar solo si el navegador no marca la petición como cross-site
  const site = request.headers.get('sec-fetch-site');
  return !site || site === 'same-origin' || site === 'none';
}

/**
 * URL absoluta hacia `ruta` usando el host REAL de la petición
 * (en Vercel y en local `request.url` puede traer otro host, como "localhost").
 */
export function urlAbs(request, ruta) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl?.protocol || 'http:').replace(':', '').split(',')[0];
  return host ? new URL(ruta, `${proto}://${host}`) : new URL(ruta, request.url);
}

export function prohibido() {
  return NextResponse.json({ success: false, message: 'Petición no permitida.' }, { status: 403 });
}

// ---------------------------------------------------------------
// Mensajes "flash" (se muestran una vez tras una redirección)
// ---------------------------------------------------------------
export const COOKIE_FLASH = 'bs_flash';

function recortarOld(old) {
  if (!old) return undefined;
  const salida = {};
  let total = 0;
  for (const [k, v] of Object.entries(old)) {
    if (/pass/i.test(k)) continue; // nunca guardar contraseñas
    const s = String(v ?? '').slice(0, 300);
    total += k.length + s.length;
    if (total > 2200) break;
    salida[k] = s;
  }
  return salida;
}

/**
 * Redirige (303) a `ruta` con un mensaje flash.
 * tipo: 'success' | 'error' | 'info'. `old`: valores del formulario a repoblar.
 */
export function redirigir(request, ruta, flash) {
  const res = NextResponse.redirect(urlAbs(request, ruta), 303);
  if (flash) {
    res.cookies.set(
      COOKIE_FLASH,
      JSON.stringify({ tipo: flash.tipo || 'info', texto: flash.texto || '', old: recortarOld(flash.old) }),
      { path: '/', maxAge: 60, sameSite: 'lax', secure: process.env.VERCEL === '1' || process.env.COOKIE_SECURE === 'true' }
    );
  }
  return res;
}

/** Lee el mensaje flash de la petición (server components). Se borra en el cliente. */
export async function leerFlash() {
  const jar = await cookies();
  const raw = jar.get(COOKIE_FLASH)?.value;
  if (!raw) return { tipo: null, texto: null, old: {} };
  try {
    const f = JSON.parse(raw);
    return { tipo: f.tipo || null, texto: f.texto || null, old: f.old || {} };
  } catch {
    return { tipo: null, texto: null, old: {} };
  }
}

/** Convierte un FormData en objeto simple (solo campos de texto) */
export function formAObjeto(fd) {
  const o = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === 'string') o[k] = v;
  }
  return o;
}
