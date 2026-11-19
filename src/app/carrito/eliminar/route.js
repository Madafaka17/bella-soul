import { NextResponse } from 'next/server';
import { claveItem, cuerpoCarrito, guardarCarritoEn, hidratarCarrito, leerCarritoDeRequest } from '@/lib/cart';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { esAjax, leerCuerpo } from '@/lib/cuerpo';

export const dynamic = 'force-dynamic';

/** POST /carrito/eliminar  { key } */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();

  const body = await leerCuerpo(request);
  const key = String(body.key ?? '');

  const crudo = leerCarritoDeRequest(request).filter((x) => claveItem(x.p, x.t, x.c) !== key);
  const items = await hidratarCarrito(crudo);

  const res = esAjax(request) ? NextResponse.json(cuerpoCarrito(items)) : redirigir(request, '/carrito');
  guardarCarritoEn(res, crudo);
  return res;
}
