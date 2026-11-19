import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { claveItem, cuerpoCarrito, guardarCarritoEn, hidratarCarrito, leerCarritoDeRequest } from '@/lib/cart';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { esAjax, leerCuerpo } from '@/lib/cuerpo';

export const dynamic = 'force-dynamic';

/** POST /carrito/agregar  { producto_id, talla, color, cantidad } */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();

  const ajax = esAjax(request);
  const body = await leerCuerpo(request);
  const productoId = parseInt(body.producto_id, 10);
  const talla = String(body.talla ?? '').slice(0, 20);
  const color = String(body.color ?? '').slice(0, 50);
  const cantidad = Math.max(1, Math.min(parseInt(body.cantidad, 10) || 1, 99));

  const fallo = (mensaje) =>
    ajax
      ? NextResponse.json({ success: false, message: mensaje })
      : redirigir(request, request.headers.get('referer') ? new URL(request.headers.get('referer')).pathname : '/catalogo', { tipo: 'error', texto: mensaje });

  if (!Number.isInteger(productoId) || productoId <= 0) return fallo('Producto no encontrado.');

  const prod = await one('SELECT id, stock FROM productos WHERE id = ? AND estado = 1', [productoId]);
  if (!prod) return fallo('Producto no encontrado.');
  if (Number(prod.stock) <= 0) return fallo('Producto agotado.');

  const crudo = leerCarritoDeRequest(request);
  const clave = claveItem(productoId, talla, color);
  const existente = crudo.find((x) => claveItem(x.p, x.t, x.c) === clave);
  if (existente) {
    existente.q = Math.min(existente.q + cantidad, Number(prod.stock), 99);
  } else {
    crudo.push({ p: productoId, t: talla, c: color, q: Math.min(cantidad, Number(prod.stock)) });
  }

  const items = await hidratarCarrito(crudo);
  const res = ajax
    ? NextResponse.json(cuerpoCarrito(items, { message: 'Producto agregado al carrito.' }))
    : redirigir(request, '/carrito', { tipo: 'success', texto: 'Producto agregado al carrito.' });
  guardarCarritoEn(res, crudo);
  return res;
}
