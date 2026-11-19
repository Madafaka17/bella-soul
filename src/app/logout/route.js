import { NextResponse } from 'next/server';
import { clearCookie, COOKIE_CLIENT } from '@/lib/session';
import { urlAbs } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Cierra la sesión de la clienta */
export async function GET(request) {
  const res = NextResponse.redirect(urlAbs(request, '/'), 303);
  clearCookie(res, COOKIE_CLIENT);
  return res;
}
