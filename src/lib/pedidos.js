import { cookies } from 'next/headers';
import { one, query } from '@/lib/db';
import { firmar, verificar, getAdmin, getClient, opcionesCookie } from '@/lib/session';

/**
 * Los pedidos hechos sin cuenta se recuerdan en la cookie firmada `bs_orders`
 * para que la clienta pueda ver su confirmación y su boleta sin exponer los
 * pedidos de otras personas (los ids son consecutivos).
 */
export const COOKIE_PEDIDOS = 'bs_orders';

export async function recordarPedidoEn(request, res, pedidoId) {
  const actuales = (await verificar(request.cookies.get(COOKIE_PEDIDOS)?.value))?.ids || [];
  const ids = [...actuales.filter((x) => x !== pedidoId), pedidoId].slice(-20);
  const token = await firmar({ tipo: 'pedidos', ids }, 30);
  res.cookies.set(COOKIE_PEDIDOS, token, opcionesCookie(30));
}

async function idsRecordados() {
  const jar = await cookies();
  const p = await verificar(jar.get(COOKIE_PEDIDOS)?.value);
  return p?.tipo === 'pedidos' && Array.isArray(p.ids) ? p.ids : [];
}

/** ¿La persona actual puede ver este pedido? (admin, dueña del pedido, o lo hizo en este navegador) */
export async function puedeVerPedido(pedido) {
  const [admin, cliente, ids] = await Promise.all([getAdmin(), getClient(), idsRecordados()]);
  if (admin) return true;
  if (cliente && pedido.cliente_id && Number(pedido.cliente_id) === Number(cliente.id)) return true;
  return ids.includes(Number(pedido.id));
}

const pad = (n, largo) => String(n).padStart(largo, '0');

/** Siguiente número de pedido del año: BS-20260001 */
export async function siguienteNumeroPedido(db) {
  const year = new Date().getFullYear();
  const prefijo = `BS-${year}`;
  const rows = await db.query('SELECT numero_pedido FROM pedidos WHERE numero_pedido LIKE ? ORDER BY id DESC LIMIT 1', [`${prefijo}%`]);
  const ultimo = rows[0] ? parseInt(String(rows[0].numero_pedido).slice(prefijo.length), 10) || 0 : 0;
  return `${prefijo}${pad(ultimo + 1, 4)}`;
}

/** Siguiente número de boleta: B001-00001 */
export async function siguienteNumeroBoleta(db) {
  const rows = await db.query('SELECT numero_boleta FROM boletas ORDER BY id DESC LIMIT 1');
  const ultimo = rows[0] ? parseInt(String(rows[0].numero_boleta).split('-')[1], 10) || 0 : 0;
  return `B001-${pad(ultimo + 1, 5)}`;
}

export async function pedidoConDetalle(id) {
  const n = parseInt(id, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  const pedido = await one('SELECT * FROM pedidos WHERE id = ?', [n]);
  if (!pedido) return null;
  const detalle = await query('SELECT * FROM detalle_pedido WHERE pedido_id = ? ORDER BY id', [n]);
  return { ...pedido, detalle };
}
