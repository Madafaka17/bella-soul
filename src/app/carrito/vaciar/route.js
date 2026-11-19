import { guardarCarritoEn } from '@/lib/cart';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** POST /carrito/vaciar */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const res = redirigir(request, '/carrito');
  guardarCarritoEn(res, []);
  return res;
}
