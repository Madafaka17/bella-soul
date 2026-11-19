import { notFound } from 'next/navigation';
import { pedidoConDetalle, puedeVerPedido } from '@/lib/pedidos';
import { whatsappNumero } from '@/lib/tienda';
import { formatPrecio, fechaHora, ucfirst } from '@/lib/format';

export const metadata = { title: 'Pedido Confirmado — bella.soul2024' };

const fila = { color: 'var(--color-gray)', fontSize: '0.9rem' };

export default async function Confirmacion({ params }) {
  const { id } = await params;
  const pedido = await pedidoConDetalle(id);
  if (!pedido || !(await puedeVerPedido(pedido))) notFound();

  const numero = await whatsappNumero();
  const waPedido = `https://wa.me/${numero}?text=${encodeURIComponent(`Hola, quiero consultar sobre mi pedido N° ${pedido.numero_pedido}`)}`;

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + var(--promo-height) + var(--space-3xl))', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(76,175,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-xl)', fontSize: '2.5rem', color: '#2E7D32' }}>
            <i className="fas fa-check-circle"></i>
          </div>

          <h1 className="section-title" style={{ marginBottom: 'var(--space-sm)' }}>¡Pedido confirmado!</h1>
          <p style={{ color: 'var(--color-gray)', fontSize: '1rem', marginBottom: 'var(--space-2xl)' }}>
            Gracias por tu compra. Hemos recibido tu pedido correctamente y te contactaremos pronto.
          </p>

          <div className="form-card" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
            <h3 className="form-section-title"><i className="fas fa-file-invoice"></i> Detalles del pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div className="flex-between"><span style={fila}>N° de pedido</span><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pedido.numero_pedido}</span></div>
              <div className="flex-between"><span style={fila}>Fecha</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fechaHora(pedido.created_at)}</span></div>
              <div className="flex-between"><span style={fila}>Estado</span><span className="status-badge status-pendiente">{ucfirst(pedido.estado || 'pendiente')}</span></div>
              <div className="flex-between"><span style={fila}>Método de pago</span><span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{pedido.metodo_pago || '—'}</span></div>
              <div className="flex-between"><span style={fila}>Entrega</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pedido.metodo_entrega === 'retiro' ? 'Recojo en tienda' : `A domicilio${pedido.ciudad ? ` · ${pedido.ciudad}` : ''}`}</span></div>
            </div>

            <div className="summary-divider" style={{ margin: 'var(--space-lg) 0' }}></div>

            <h6 style={{ fontWeight: 700, marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>Productos</h6>
            {pedido.detalle.map((d) => (
              <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }} key={d.id}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>{d.nombre_producto}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', margin: 0 }}>
                    {d.talla || ''} {d.color ? `/ ${d.color}` : ''} × {d.cantidad}
                  </p>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{formatPrecio(d.precio_unitario * d.cantidad)}</span>
              </div>
            ))}

            <div className="summary-divider" style={{ margin: 'var(--space-lg) 0' }}></div>

            <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
              <span style={{ color: 'var(--color-gray)' }}>Subtotal</span>
              <span className="fw-600">{formatPrecio(pedido.subtotal)}</span>
            </div>
            <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
              <span style={{ color: 'var(--color-gray)' }}>Envío</span>
              <span className="fw-600">{pedido.costo_envio > 0 ? formatPrecio(pedido.costo_envio) : 'Gratis'}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="flex-between">
              <strong>Total</strong>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary-d)' }}>{formatPrecio(pedido.total)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={waPedido} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
              <i className="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
            <a href={`/boleta/${pedido.id}`} target="_blank" className="btn btn-outline">
              <i className="fas fa-file-invoice"></i> Ver boleta
            </a>
            <a href="/" className="btn btn-outline">
              <i className="fas fa-home"></i> Volver al inicio
            </a>
          </div>

          {pedido.metodo_pago === 'transferencia' ? (
            <div className="alert alert-info" style={{ marginTop: 'var(--space-xl)', textAlign: 'left' }}>
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>Importante:</strong> Para confirmar tu pedido, realiza la transferencia a la cuenta BCP indicada y envíanos el comprobante por WhatsApp. Procesaremos tu pedido una vez verificado el pago.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
