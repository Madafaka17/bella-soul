import { redirect } from 'next/navigation';
import { getCarrito, totales } from '@/lib/cart';
import { configTienda, tarifas, calcularEnvio, ZONA_LOCAL, ZONA_LOCAL_NOMBRE } from '@/lib/tienda';
import { getClient } from '@/lib/session';
import { one } from '@/lib/db';
import { leerFlash } from '@/lib/http';
import { formatPrecio, MONEDA } from '@/lib/format';
import Alertas from '@/components/Alertas';

export const metadata = { title: 'Finalizar Compra — bella.soul2024' };

const msgError = { color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: 4 };
const panelBase = { background: 'var(--color-gray-l)', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)' };
const label = { fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: 2 };
const valor = { fontWeight: 600, fontSize: '0.95rem' };

export default async function Pago() {
  const items = await getCarrito();
  if (!items.length) redirect('/carrito');

  const [t, flash, cliente, yapeNombre, yapeNumero, plinNombre, plinNumero, bcpCuenta, bcpCci] = await Promise.all([
    tarifas(),
    leerFlash(),
    getClient(),
    configTienda('yape_nombre', 'Bella Soul'),
    configTienda('yape_numero', ''),
    configTienda('plin_nombre', 'Bella Soul'),
    configTienda('plin_numero', ''),
    configTienda('bcp_cuenta', ''),
    configTienda('bcp_cci', ''),
  ]);

  // Datos de la clienta (si inició sesión) para rellenar el formulario
  let perfil = {};
  if (cliente) {
    const c = await one('SELECT nombres, apellidos, telefono, direccion FROM clientes WHERE id = ?', [cliente.id]);
    if (c) perfil = { nombre_cliente: `${c.nombres} ${c.apellidos}`.trim(), celular: c.telefono || '', direccion_envio: c.direccion || '' };
  }
  const old = { ...perfil, ...flash.old };

  const { subtotal } = totales(items);
  const metodoPago = old.metodo_pago || 'yape';
  const metodoEntrega = old.metodo_entrega || 'domicilio';
  const comprobante = old.tipo_comprobante || 'boleta';

  const envioInicial = old.ciudad ? calcularEnvio(subtotal, old.ciudad, metodoEntrega, t) : metodoEntrega === 'retiro' ? 0 : null;
  const totalInicial = subtotal + (envioInicial ?? 0);

  const datos = JSON.stringify({ ...t, zonaLocal: ZONA_LOCAL, moneda: MONEDA, subtotal });

  return (
    <>
      <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + var(--promo-height) + var(--space-3xl))', minHeight: '100vh' }}>
        <div className="container">
          <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <div className="breadcrumb">
                <a href="/carrito">Carrito</a>
                <span className="sep">/</span>
                <span className="current">Finalizar compra</span>
              </div>
              <h1 className="section-title" style={{ marginBottom: 0 }}>Finalizar compra</h1>
            </div>

            {flash.texto && flash.tipo === 'error' ? (
              <div style={{ background: '#fdecea', color: '#b3261e', border: '1px solid #f5c2be', borderRadius: 8, padding: '12px 16px', marginBottom: 'var(--space-lg)' }}>
                <i className="fas fa-exclamation-circle"></i> {flash.texto}
              </div>
            ) : (
              <Alertas />
            )}

            <form action="/api/pago" method="POST" id="checkoutForm" data-checkout={datos}>
              <div className="form-layout">
                <div>
                  {/* Cliente */}
                  <div className="form-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="form-section-title"><i className="fas fa-user"></i> Información del cliente</h3>
                    <div className="form-grid">
                      <div className="form-group full">
                        <label htmlFor="nombre_cliente" className="form-label">Nombre completo</label>
                        <input type="text" name="nombre_cliente" id="nombre_cliente" className="form-input" defaultValue={old.nombre_cliente || ''} required maxLength={200} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="celular" className="form-label">Celular</label>
                        <input type="tel" name="celular" id="celular" className="form-input" defaultValue={old.celular || ''} required maxLength={20} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ciudad" className="form-label">Ciudad</label>
                        <input
                          type="text"
                          name="ciudad"
                          id="ciudad"
                          list="ciudades"
                          autoComplete="address-level2"
                          placeholder="Ej: Moyobamba, Tarapoto, Lima..."
                          className="form-input"
                          defaultValue={old.ciudad || ''}
                          required
                          maxLength={100}
                        />
                        <datalist id="ciudades">
                          <option value="Moyobamba" />
                          <option value="Soritor" />
                          <option value="Calzada" />
                          <option value="Habana" />
                          <option value="Jepelacio" />
                          <option value="Yantaló" />
                        </datalist>
                      </div>
                      <div className="form-group full">
                        <label htmlFor="direccion_envio" className="form-label">Dirección de envío</label>
                        <input type="text" name="direccion_envio" id="direccion_envio" className="form-input" defaultValue={old.direccion_envio || ''} required />
                      </div>
                      <div className="form-group full">
                        <label htmlFor="referencia" className="form-label">Referencia (opcional)</label>
                        <textarea name="referencia" id="referencia" className="form-input" rows={2} defaultValue={old.referencia || ''}></textarea>
                      </div>
                      <div className="form-group full">
                        <label htmlFor="nota_cliente" className="form-label">Nota para el pedido (opcional)</label>
                        <textarea name="nota_cliente" id="nota_cliente" className="form-input" rows={2} defaultValue={old.nota_cliente || ''}></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Entrega */}
                  <div className="form-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="form-section-title"><i className="fas fa-truck"></i> Método de entrega</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <label className={`payment-chip ${metodoEntrega === 'domicilio' ? 'active' : ''}`}>
                        <input type="radio" name="metodo_entrega" value="domicilio" defaultChecked={metodoEntrega === 'domicilio'} />
                        <i className="fas fa-home"></i> Envío a domicilio
                      </label>
                      <label className={`payment-chip ${metodoEntrega === 'retiro' ? 'active' : ''}`}>
                        <input type="radio" name="metodo_entrega" value="retiro" defaultChecked={metodoEntrega === 'retiro'} />
                        <i className="fas fa-store"></i> Recojo en tienda
                      </label>
                    </div>
                  </div>

                  {/* Pago */}
                  <div className="form-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="form-section-title"><i className="fas fa-credit-card"></i> Método de pago</h3>
                    <input type="hidden" name="metodo_pago" id="metodo_pago" defaultValue={metodoPago} />
                    <div className="payment-tabs" id="paymentTabs">
                      {[
                        ['yape', 'fa-mobile-alt', 'Yape'],
                        ['plin', 'fa-mobile-alt', 'Plin'],
                        ['transferencia', 'fa-university', 'Transferencia'],
                        ['efectivo', 'fa-money-bill-wave', 'Efectivo'],
                        ['contraentrega', 'fa-handshake', 'Contraentrega'],
                      ].map(([m, icono, nombre]) => (
                        <button type="button" key={m} className={`payment-tab ${metodoPago === m ? 'active' : ''}`} data-method={m}>
                          <i className={`fas ${icono}`}></i> {nombre}
                        </button>
                      ))}
                    </div>

                    <div id="paymentPanels">
                      <div className={`payment-panel ${metodoPago === 'yape' ? '' : 'hidden'}`} id="panel-yape">
                        <div style={{ ...panelBase, display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <p style={{ fontWeight: 700, marginBottom: 4 }}><i className="fas fa-mobile-alt" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i> Yape</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: 2 }}><strong>Nombre:</strong> {yapeNombre}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: 0 }}><strong>Número:</strong> {yapeNumero}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`payment-panel ${metodoPago === 'plin' ? '' : 'hidden'}`} id="panel-plin">
                        <div style={{ ...panelBase, display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <p style={{ fontWeight: 700, marginBottom: 4 }}><i className="fas fa-mobile-alt" style={{ color: '#6A1B9A', marginRight: 6 }}></i> Plin</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: 2 }}><strong>Nombre:</strong> {plinNombre}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: 0 }}><strong>Número:</strong> {plinNumero}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`payment-panel ${metodoPago === 'transferencia' ? '' : 'hidden'}`} id="panel-transferencia">
                        <div style={panelBase}>
                          <p style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                            <i className="fas fa-university" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i> BCP — Transferencia bancaria
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div><p style={label}>Cuenta de ahorros</p><p style={valor}>{bcpCuenta}</p></div>
                            <div><p style={label}>CCI</p><p style={valor}>{bcpCci}</p></div>
                            <div><p style={label}>Titular</p><p style={valor}>{yapeNombre}</p></div>
                            <div><p style={label}>Banco</p><p style={valor}>BCP</p></div>
                          </div>
                        </div>
                      </div>
                      <div className={`payment-panel ${metodoPago === 'efectivo' ? '' : 'hidden'}`} id="panel-efectivo">
                        <div style={{ ...panelBase, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#2E7D32', flexShrink: 0 }}>
                            <i className="fas fa-money-bill-wave"></i>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>Pago en efectivo</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', margin: 0 }}>Pagas en efectivo al recibir tu pedido o al recojo en tienda. Sin recargos.</p>
                          </div>
                        </div>
                      </div>
                      <div className={`payment-panel ${metodoPago === 'contraentrega' ? '' : 'hidden'}`} id="panel-contraentrega">
                        <div style={{ ...panelBase, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--color-primary-d)', flexShrink: 0 }}>
                            <i className="fas fa-handshake"></i>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, marginBottom: 4 }}>Contraentrega</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', margin: 0 }}>
                              Pagas cuando recibes tu pedido directamente. Disponible solo en {ZONA_LOCAL_NOMBRE}.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprobante */}
                  <div className="form-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 className="form-section-title"><i className="fas fa-receipt"></i> Comprobante</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <label className={`payment-chip ${comprobante === 'boleta' ? 'active' : ''}`}>
                        <input type="radio" name="tipo_comprobante" value="boleta" defaultChecked={comprobante === 'boleta'} />
                        <i className="fas fa-file-invoice"></i> Boleta
                      </label>
                      <label className={`payment-chip ${comprobante === 'factura' ? 'active' : ''}`}>
                        <input type="radio" name="tipo_comprobante" value="factura" defaultChecked={comprobante === 'factura'} />
                        <i className="fas fa-file-invoice-dollar"></i> Factura
                      </label>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div>
                  <div className="cart-summary">
                    <h3 className="summary-title">Resumen del pedido</h3>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                      {items.map((item) => (
                        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }} key={item.key}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 2 }}>{item.nombre}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', margin: 0 }}>
                              {item.talla || 'Única'} {item.color ? `/ ${item.color}` : ''} × {item.cantidad}
                            </p>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 'var(--space-md)' }}>
                            {formatPrecio(item.precio * item.cantidad)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span className="fw-600">{formatPrecio(subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Envío</span>
                      <span className="fw-600" id="envioValor">
                        {envioInicial === null ? 'Indica tu ciudad' : envioInicial > 0 ? formatPrecio(envioInicial) : 'Gratis'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', margin: '-4px 0 var(--space-sm)' }} id="envioZona">
                      {ZONA_LOCAL_NOMBRE}: {formatPrecio(t.local)} · Resto del país: {formatPrecio(t.nacional)}
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row summary-total">
                      <span>Total</span>
                      <span id="totalValor">{formatPrecio(totalInicial)}</span>
                    </div>
                    {t.gratisDesde > 0 && subtotal < t.gratisDesde ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textAlign: 'center', margin: 'var(--space-md) 0' }}>
                        <i className="fas fa-truck" style={{ color: 'var(--color-primary)' }}></i> Agrega{' '}
                        <strong>{formatPrecio(t.gratisDesde - subtotal)}</strong> más para envío gratis
                      </div>
                    ) : null}
                    <button type="submit" className="btn btn-primary btn-block">
                      <i className="fas fa-check-circle"></i> Confirmar pedido
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: 'var(--space-md)' }}>
                      <i className="fas fa-lock" style={{ marginRight: '0.3rem' }}></i> Tus datos están seguros y protegidos
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <script src="/assets/js/checkout.js" defer></script>
    </>
  );
}
