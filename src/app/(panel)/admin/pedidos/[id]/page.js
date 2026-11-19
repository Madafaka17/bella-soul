import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { one } from '@/lib/db';
import { pedidoConDetalle } from '@/lib/pedidos';
import { formatPrecio, fechaHora, ucfirst } from '@/lib/format';

export const metadata = { title: 'Pedido' };
export const dynamic = 'force-dynamic';

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

export default async function PedidoDetalle({ params }) {
  const { id } = await params;
  const p = await pedidoConDetalle(id);
  if (!p) notFound();

  const cliente = p.cliente_id ? await one('SELECT email FROM clientes WHERE id = ?', [p.cliente_id]) : null;
  const soloNumeros = (p.celular || '').replace(/[^0-9]/g, '');
  const mensaje = `Hola ${p.nombre_cliente}, tu pedido #${p.numero_pedido} está ${p.estado}. Gracias por comprar en bella.soul2024 💕`;
  const waUrl = soloNumeros ? `https://wa.me/${soloNumeros}?text=${encodeURIComponent(mensaje)}` : null;

  return (
    <AdminShell titulo={`Pedido #${p.numero_pedido}`}>
      <div className="admin-split">
        <div className="admin-card">
          <div className="admin-card-header">
            <h5>Detalle del pedido #{p.numero_pedido} <span className="sub">Realizado el {fechaHora(p.created_at)}</span></h5>
            <span className={`status-badge status-${p.estado}`}>{ucfirst(p.estado)}</span>
          </div>
          <div className="admin-card-body">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th className="num">Cant.</th>
                    <th className="num">Precio</th>
                    <th className="num">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {p.detalle.map((d) => (
                    <tr key={d.id}>
                      <td><strong>{d.nombre_producto}</strong></td>
                      <td>{d.talla || '—'}</td>
                      <td>{d.color || '—'}</td>
                      <td className="num">{d.cantidad}</td>
                      <td className="num">{formatPrecio(d.precio_unitario)}</td>
                      <td className="num">{formatPrecio(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="totals" style={{ marginTop: '2.2rem' }}>
              <div><span>Subtotal</span><span>{formatPrecio(p.subtotal)}</span></div>
              {p.costo_envio > 0 ? <div><span>Envío</span><span>{formatPrecio(p.costo_envio)}</span></div> : null}
              <div className="total"><span>Total</span><span>{formatPrecio(p.total)}</span></div>
            </div>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <div className="admin-card-header"><h5>Cliente</h5></div>
            <div className="admin-card-body">
              <div className="info-list">
                <div><span className="k">Nombre</span><span className="v">{p.nombre_cliente}</span></div>
                <div><span className="k">Email</span><span className="v">{cliente?.email || '—'}</span></div>
                <div><span className="k">Teléfono</span><span className="v">{p.celular || '—'}</span></div>
                {p.ciudad ? <div><span className="k">Ciudad</span><span className="v">{p.ciudad}</span></div> : null}
                {p.direccion_envio ? <div><span className="k">Dirección</span><span className="v">{p.direccion_envio}</span></div> : null}
                {p.referencia ? <div><span className="k">Referencia</span><span className="v">{p.referencia}</span></div> : null}
                <div><span className="k">Entrega</span><span className="v">{p.metodo_entrega === 'retiro' ? 'Recojo en tienda' : 'A domicilio'}</span></div>
                <div><span className="k">Método de pago</span><span className="v">{p.metodo_pago || '—'}</span></div>
                {p.nota_cliente ? <div><span className="k">Notas</span><span className="v">{p.nota_cliente}</span></div> : null}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h5>Actualizar estado</h5></div>
            <div className="admin-card-body">
              <form method="POST" action={`/api/admin/pedidos/${p.id}/estado`}>
                <select name="estado" className="form-control mb-2" defaultValue={p.estado}>
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{ucfirst(e)}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary w-100"><i className="fas fa-check"></i> Actualizar estado</button>
              </form>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header"><h5>Comprobante</h5></div>
            <div className="admin-card-body">
              <a href={`/boleta/${p.id}`} target="_blank" className="btn btn-outline-secondary w-100"><i className="fas fa-file-invoice"></i> Ver boleta</a>
            </div>
          </div>

          {waUrl ? (
            <div className="admin-card">
              <div className="admin-card-header"><h5>Notificar a la clienta</h5></div>
              <div className="admin-card-body">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success w-100"><i className="fab fa-whatsapp"></i> Notificar por WhatsApp</a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
