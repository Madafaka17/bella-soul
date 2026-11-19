import { NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { urlAbs } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Sirve una foto subida desde el admin (guardada en la tabla `imagenes`) */
export async function GET(request, { params }) {
  const { nombre } = await params;
  if (!/^[A-Za-z0-9_.\-]+$/.test(nombre)) return new NextResponse('No encontrado', { status: 404 });

  const img = await one('SELECT mime, datos FROM imagenes WHERE nombre = ?', [nombre]);
  if (!img) return NextResponse.redirect(urlAbs(request, '/assets/img/placeholder.png'), 302);

  return new NextResponse(Buffer.from(img.datos, 'base64'), {
    headers: {
      'Content-Type': img.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
