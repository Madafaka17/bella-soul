import { exec, transaction } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

/** POST /api/admin/pedidos/:id/estado */
export async function POST(request, { params }) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const { id } = await params;
  const n = parseInt(id, 10);
  const nuevo = formAObjeto(await request.formData()).estado;
  const volver = `/admin/pedidos/${n}`;

  if (!Number.isInteger(n) || !ESTADOS.includes(nuevo)) {
    return redirigir(request, volver, { tipo: 'error', texto: 'Estado no válido.' });
  }

  await transaction(async (db) => {
    const [pedido] = await db.query('SELECT id, estado FROM pedidos WHERE id = ? FOR UPDATE', [n]);
    if (!pedido) return;
    await db.exec('UPDATE pedidos SET estado = ?, updated_at = NOW() WHERE id = ?', [nuevo, n]);

    // Si se cancela un pedido, devolver el stock; si se reactiva, volver a descontarlo
    if (nuevo === 'cancelado' && pedido.estado !== 'cancelado') {
      await db.exec(
        'UPDATE productos p JOIN detalle_pedido d ON d.producto_id = p.id SET p.stock = p.stock + d.cantidad WHERE d.pedido_id = ?',
        [n]
      );
    } else if (pedido.estado === 'cancelado' && nuevo !== 'cancelado') {
      await db.exec(
        'UPDATE productos p JOIN detalle_pedido d ON d.producto_id = p.id SET p.stock = GREATEST(p.stock - d.cantidad, 0) WHERE d.pedido_id = ?',
        [n]
      );
    }
  });

  return redirigir(request, volver, { tipo: 'success', texto: 'Estado actualizado.' });
}
