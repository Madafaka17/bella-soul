import { transaction } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** POST /api/admin/pagos/:id/(verificar|rechazar) */
export async function POST(request, { params }) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const { id, accion } = await params;
  const n = parseInt(id, 10);
  if (!Number.isInteger(n) || !['verificar', 'rechazar'].includes(accion)) {
    return redirigir(request, '/admin/pagos', { tipo: 'error', texto: 'Acción no válida.' });
  }

  const ok = await transaction(async (db) => {
    const [pago] = await db.query('SELECT id, pedido_id FROM pagos WHERE id = ?', [n]);
    if (!pago) return false;
    await db.exec('UPDATE pagos SET estado = ?, updated_at = NOW() WHERE id = ?', [accion === 'verificar' ? 'verificado' : 'rechazado', n]);
    if (accion === 'verificar' && pago.pedido_id) {
      await db.exec("UPDATE pedidos SET estado = 'confirmado', updated_at = NOW() WHERE id = ? AND estado = 'pendiente'", [pago.pedido_id]);
    }
    return true;
  });

  if (!ok) return redirigir(request, '/admin/pagos', { tipo: 'error', texto: 'Pago no encontrado.' });
  return redirigir(request, '/admin/pagos', { tipo: 'success', texto: accion === 'verificar' ? 'Pago verificado correctamente.' : 'Pago rechazado.' });
}
