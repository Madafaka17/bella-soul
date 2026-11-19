import { exec } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** POST /api/admin/consultas/:id/leida */
export async function POST(request, { params }) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const { id } = await params;
  const n = parseInt(id, 10);
  if (Number.isInteger(n)) {
    await exec("UPDATE consultas SET leida = 1, estado = 'respondida', updated_at = NOW() WHERE id = ?", [n]);
  }
  return redirigir(request, '/admin/consultas', { tipo: 'success', texto: 'Consulta marcada como leída.' });
}
