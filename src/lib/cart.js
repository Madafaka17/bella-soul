import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';

/**
 * El carrito vive en la cookie `bs_cart` como una lista mínima:
 *   [{ p: productoId, t: talla, c: color, q: cantidad }]
 * Los precios, nombres e imágenes se leen SIEMPRE de la base de datos,
 * así el cliente no puede alterar un precio desde el navegador.
 */
export const COOKIE_CARRITO = 'bs_cart';
const MAX_ITEMS = 40;

function parsear(valor) {
  if (!valor) return [];
  try {
    const arr = JSON.parse(valor);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && Number.isInteger(x.p) && x.p > 0)
      .slice(0, MAX_ITEMS)
      .map((x) => ({
        p: x.p,
        t: String(x.t ?? '').slice(0, 20),
        c: String(x.c ?? '').slice(0, 50),
        q: Math.max(1, Math.min(parseInt(x.q, 10) || 1, 99)),
      }));
  } catch {
    return [];
  }
}

export const claveItem = (p, t, c) => `${p}-${t}-${c}`;

/** Lee el carrito crudo desde las cookies de la petición */
export async function leerCarritoCrudo() {
  const jar = await cookies();
  return parsear(jar.get(COOKIE_CARRITO)?.value);
}

/** Lee el carrito crudo desde un objeto Request (route handlers) */
export function leerCarritoDeRequest(request) {
  return parsear(request.cookies.get(COOKIE_CARRITO)?.value);
}

/** Completa cada línea con los datos actuales del producto */
export async function hidratarCarrito(crudo) {
  if (!crudo.length) return [];
  const ids = [...new Set(crudo.map((x) => x.p))];
  const rows = await query(
    'SELECT id, nombre, imagen, precio, precio_oferta, stock FROM productos WHERE estado = 1 AND id IN (?)',
    [ids]
  );
  const porId = new Map(rows.map((r) => [r.id, r]));
  const items = [];
  for (const x of crudo) {
    const prod = porId.get(x.p);
    if (!prod) continue;
    const precio = Number(prod.precio_oferta) > 0 ? Number(prod.precio_oferta) : Number(prod.precio);
    const stock = Number(prod.stock) || 0;
    items.push({
      key: claveItem(x.p, x.t, x.c),
      producto_id: prod.id,
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio,
      talla: x.t,
      color: x.c,
      cantidad: stock > 0 ? Math.min(x.q, stock) : x.q,
      stock,
    });
  }
  return items;
}

/** Carrito completo de la petición actual (server components) */
export async function getCarrito() {
  return hidratarCarrito(await leerCarritoCrudo());
}

export function totales(items) {
  const cartCount = items.reduce((a, i) => a + i.cantidad, 0);
  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  return { cartCount, subtotal };
}

/** Cuerpo JSON que espera /assets/js/script.js */
export function cuerpoCarrito(items, extra = {}) {
  const { cartCount, subtotal } = totales(items);
  return {
    success: true,
    cartCount,
    cartSubtotal: subtotal,
    cartSubtotalFormatted: formatPrecio(subtotal),
    cartItems: items.map((i) => ({
      key: i.key,
      producto_id: i.producto_id,
      nombre: i.nombre,
      imagen: imgUrl(i.imagen),
      precio: i.precio,
      talla: i.talla,
      color: i.color,
      cantidad: i.cantidad,
      subtotal: i.precio * i.cantidad,
    })),
    ...extra,
  };
}

/** Guarda el carrito crudo en la respuesta */
export function guardarCarritoEn(res, crudo) {
  if (!crudo.length) {
    res.cookies.set(COOKIE_CARRITO, '', { path: '/', maxAge: 0 });
    return;
  }
  res.cookies.set(COOKIE_CARRITO, JSON.stringify(crudo), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.VERCEL === '1' || process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}
