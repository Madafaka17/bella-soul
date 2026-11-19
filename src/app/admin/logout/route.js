import { NextResponse } from 'next/server';
import { clearCookie, COOKIE_ADMIN } from '@/lib/session';
import { urlAbs } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Cierra la sesión del administrador */
export async function GET(request) {
  const res = NextResponse.redirect(urlAbs(request, '/admin/login'), 303);
  clearCookie(res, COOKIE_ADMIN);
  return res;
}
