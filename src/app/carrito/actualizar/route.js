import { NextResponse } from 'next/server';
import { claveItem, cuerpoCarrito, guardarCarritoEn, hidratarCarrito, leerCarritoDeRequest } from '@/lib/cart';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { esAjax, leerCuerpo } from '@/lib/cuerpo';

export const dynamic = 'force-dynamic';

/** POST /carrito/actualizar  { key, cantidad } */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();

  const body = await leerCuerpo(request);
  const key = String(body.key ?? '');
  const cantidad = parseInt(body.cantidad, 10) || 1;

  const crudo = leerCarritoDeRequest(request);
  const items = await hidratarCarrito(crudo);
  const actual = items.find((i) => i.key === key);

  let success = false;
  if (actual) {
    const max = actual.stock > 0 ? actual.stock : 99;
    const nueva = Math.min(Math.max(cantidad, 1), max);
    const linea = crudo.find((x) => claveItem(x.p, x.t, x.c) === key);
    if (linea) {
      linea.q = nueva;
      success = true;
    }
  }

  const nuevos = await hidratarCarrito(crudo);
  const res = esAjax(request) ? NextResponse.json(cuerpoCarrito(nuevos, { success })) : redirigir(request, '/carrito');
  guardarCarritoEn(res, crudo);
  return res;
}
