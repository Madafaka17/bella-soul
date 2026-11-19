import { exec } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** POST /api/admin/productos/:id/(desactivar|activar) */
export async function POST(request, { params }) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const { id, accion } = await params;
  const n = parseInt(id, 10);
  if (!Number.isInteger(n) || !['activar', 'desactivar'].includes(accion)) {
    return redirigir(request, '/admin/productos', { tipo: 'error', texto: 'Acción no válida.' });
  }

  await exec('UPDATE productos SET estado = ?, updated_at = NOW() WHERE id = ?', [accion === 'activar' ? 1 : 0, n]);
  return redirigir(request, '/admin/productos', { tipo: 'success', texto: accion === 'activar' ? 'Producto activado.' : 'Producto desactivado.' });
}
