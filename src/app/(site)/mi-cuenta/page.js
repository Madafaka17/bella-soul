import { redirect } from 'next/navigation';
import Alertas from '@/components/Alertas';
import { getClient } from '@/lib/session';
import { one, query } from '@/lib/db';
import { formatPrecio, fechaCorta } from '@/lib/format';

export const metadata = { title: 'Mi Cuenta — bella.soul2024' };

export default async function MiCuenta() {
  const sesion = await getClient();
  if (!sesion) redirect('/login');

  const cliente = await one('SELECT * FROM clientes WHERE id = ?', [sesion.id]);
  if (!cliente) redirect('/logout');

  const pedidos = await query(
    `SELECT p.*, (SELECT COUNT(*) FROM detalle_pedido d WHERE d.pedido_id = p.id) AS productos
     FROM pedidos p WHERE p.cliente_id = ? ORDER BY p.created_at DESC, p.id DESC`,
    [sesion.id]
  );
  const conBoleta = pedidos.filter((p) => p.estado !== 'cancelado');

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <a href="/">Inicio</a>
          <span className="separator">&gt;</span>
          <span className="current">Mi Cuenta</span>
        </div>
      </div>

      <section className="account-section section">
        <div className="container">
          <Alertas estilo={{ marginBottom: 'var(--space-lg)' }} />

          <div className="account-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <h1>Bienvenida, {cliente.nombres} {cliente.apellidos}</h1>
            <a href="/logout" className="btn btn-sm btn-outline"><i className="fas fa-sign-out-alt"></i> Cerrar sesión</a>
          </div>

          <div className="account-tabs">
            <ul className="tabs-nav">
              <li className="tab-link active" data-tab="tab-pedidos">Mis Pedidos</li>
              <li className="tab-link" data-tab="tab-datos">Mis Datos</li>
              <li className="tab-link" data-tab="tab-boletas">Mis Boletas</li>
            </ul>

            <div className="tabs-content">
              <div id="tab-pedidos" className="tab-panel active">
                {pedidos.length ? (
                  <div className="table-responsive">
                    <table className="table orders-table">
                      <thead>
                        <tr>
                          <th>N° Pedido</th>
                          <th>Fecha</th>
                          <th>Productos</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map((p) => (
                          <tr key={p.id}>
                            <td>{p.numero_pedido}</td>
                            <td>{fechaCorta(p.created_at)}</td>
                            <td>{p.productos}</td>
                            <td>{formatPrecio(p.total)}</td>
                            <td><span className={`status-badge status-${p.estado}`}>{p.estado}</span></td>
                            <td>
                              <a href={`/pago/confirmacion/${p.id}`} className="btn btn-sm">Ver</a>{' '}
                              <a href={`/boleta/${p.id}`} className="btn btn-sm" target="_blank">Boleta</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-message">Aún no has realizado ningún pedido.</p>
                )}
              </div>

              <div id="tab-datos" className="tab-panel">
                <form method="POST" action="/api/cuenta" className="account-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombres">Nombres</label>
                      <input type="text" id="nombres" name="nombres" className="form-control" defaultValue={cliente.nombres} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="apellidos">Apellidos</label>
                      <input type="text" id="apellidos" name="apellidos" className="form-control" defaultValue={cliente.apellidos} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <input type="text" id="telefono" name="telefono" className="form-control" defaultValue={cliente.telefono || ''} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="direccion">Dirección</label>
                      <input type="text" id="direccion" name="direccion" className="form-control" defaultValue={cliente.direccion || ''} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dni">DNI</label>
                      <input type="text" id="dni" name="dni" className="form-control" defaultValue={cliente.dni || ''} maxLength={8} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Nueva Contraseña (opcional)</label>
                      <input type="password" id="password" name="password" className="form-control" placeholder="Dejar en blanco para mantener" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
              </div>

              <div id="tab-boletas" className="tab-panel">
                {conBoleta.length ? (
                  <div className="table-responsive">
                    <table className="table boletas-table">
                      <thead>
                        <tr>
                          <th>N° Pedido</th>
                          <th>Fecha</th>
                          <th>Total</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conBoleta.map((p) => (
                          <tr key={p.id}>
                            <td>{p.numero_pedido}</td>
                            <td>{fechaCorta(p.created_at)}</td>
                            <td>{formatPrecio(p.total)}</td>
                            <td><a href={`/boleta/${p.id}`} className="btn btn-sm" target="_blank">Ver boleta</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-message">No tienes boletas disponibles.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <script src="/assets/js/account.js" defer></script>
    </>
  );
}
