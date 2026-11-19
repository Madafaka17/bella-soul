import Alertas from '@/components/Alertas';
import ConfirmForm from '@/components/ConfirmForm';
import { getCarrito, totales } from '@/lib/cart';
import { tarifas, whatsappLink, ZONA_LOCAL_NOMBRE } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';

export const metadata = { title: 'Carrito — bella.soul2024' };

export default async function Carrito() {
  const [items, t, wa] = await Promise.all([getCarrito(), tarifas(), whatsappLink('Hola, quiero hacer un pedido')]);
  const { subtotal } = totales(items);
  const gratis = t.gratisDesde > 0 && subtotal >= t.gratisDesde;

  return (
    <>
      <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + var(--promo-height) + var(--space-3xl))', minHeight: '100vh' }}>
        <div className="container">
          <Alertas estilo={{ marginBottom: 'var(--space-lg)' }} />

          {!items.length ? (
            <div className="empty-state" style={{ paddingTop: 'var(--space-3xl)' }}>
              <i className="fas fa-shopping-bag" style={{ fontSize: '4rem', color: 'var(--color-beige-d)' }}></i>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega prendas desde nuestro catálogo y vuelve aquí para finalizar tu compra.</p>
              <a href="/catalogo" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                <i className="fas fa-arrow-right"></i> Explorar catálogo
              </a>
            </div>
          ) : (
            <>
              <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
                <div>
                  <h1 className="section-title" style={{ marginBottom: 'var(--space-xs)' }}>Carrito</h1>
                  <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>
                    {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
                <ConfirmForm action="/carrito/vaciar" mensaje="¿Vaciar carrito?">
                  <button type="submit" className="btn btn-sm btn-outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                    <i className="fas fa-trash-alt"></i> Vaciar
                  </button>
                </ConfirmForm>
              </div>

              <div className="cart-layout">
                <div>
                  {items.map((item) => (
                    <div className="cart-item" data-key={item.key} data-precio={item.precio} key={item.key}>
                      <a href={`/producto/${item.producto_id}`} className="cart-item-img">
                        <img src={imgUrl(item.imagen)} alt={item.nombre} loading="lazy" />
                      </a>
                      <div>
                        <a href={`/producto/${item.producto_id}`} className="cart-item-name">{item.nombre}</a>
                        <div className="cart-item-meta">
                          <span>Talla: <strong>{item.talla || 'Única'}</strong></span>
                          {item.color ? (
                            <span style={{ marginLeft: '0.5rem' }}>Color: <strong>{item.color}</strong></span>
                          ) : null}
                        </div>
                        <div className="product-price" style={{ marginBottom: 'var(--space-sm)' }}>
                          <span className="price-current">{formatPrecio(item.precio)}</span>
                        </div>
                        <div className="flex" style={{ gap: 'var(--space-md)', alignItems: 'center' }}>
                          <div className="qty-control">
                            <button className="qty-btn" data-action="minus" data-key={item.key} type="button">−</button>
                            <span className="qty-num" data-max={item.stock || 99}>{item.cantidad}</span>
                            <button
                              className="qty-btn"
                              data-action="plus"
                              data-key={item.key}
                              type="button"
                              disabled={item.stock > 0 && item.cantidad >= item.stock}
                              style={item.stock > 0 && item.cantidad >= item.stock ? { opacity: 0.4 } : undefined}
                            >
                              +
                            </button>
                          </div>
                          <span className="item-subtotal fw-700" style={{ fontSize: '1rem' }}>
                            {formatPrecio(item.precio * item.cantidad)}
                          </span>
                        </div>
                      </div>
                      <button
                        data-action="remove-cart-item"
                        data-key={item.key}
                        className="cart-item-remove"
                        title="Eliminar"
                        type="button"
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}

                  <a href="/catalogo" className="btn btn-outline" style={{ marginTop: 'var(--space-md)' }}>
                    <i className="fas fa-arrow-left"></i> Seguir comprando
                  </a>
                </div>

                <div className="cart-summary">
                  <h3 className="summary-title">Resumen</h3>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span className="fw-600" id="cartSubtotal">{formatPrecio(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envío</span>
                    <span className="fw-600">{gratis ? 'Gratis' : 'Según tu ciudad'}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <span id="cartTotal">{formatPrecio(subtotal)}</span>
                  </div>
                  {!gratis ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textAlign: 'center', margin: 'var(--space-sm) 0' }}>
                      {ZONA_LOCAL_NOMBRE}: {formatPrecio(t.local)} · Resto del país: {formatPrecio(t.nacional)}
                    </p>
                  ) : null}
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                    {t.gratisDesde > 0 && subtotal < t.gratisDesde ? (
                      <>
                        <i className="fas fa-truck" style={{ color: 'var(--color-primary)', marginRight: '0.3rem' }}></i>
                        Agrega <strong>{formatPrecio(t.gratisDesde - subtotal)}</strong> más para envío gratis
                      </>
                    ) : t.gratisDesde > 0 ? (
                      <>
                        <i className="fas fa-check-circle" style={{ color: 'var(--color-success)' }}></i> ¡Envío gratis aplicado!
                      </>
                    ) : null}
                  </div>
                  <a href="/pago" className="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-md)' }}>
                    <i className="fas fa-lock"></i> Proceder al pago
                  </a>
                  <a href={wa} target="_blank" className="btn btn-whatsapp btn-block" rel="noopener noreferrer">
                    <i className="fab fa-whatsapp"></i> Pedir por WhatsApp
                  </a>
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
                    <img src="/assets/img/pagos-seguros.png" alt="Pagos seguros" style={{ maxWidth: 200, opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <script src="/assets/js/cart.js" defer></script>
    </>
  );
}
