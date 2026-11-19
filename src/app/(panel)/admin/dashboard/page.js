import AdminShell from '@/components/admin/AdminShell';
import { one, query } from '@/lib/db';
import { formatPrecio, fechaCorta, ucfirst } from '@/lib/format';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [hoy, pend, stock, tot, ultimos, bajos, semana] = await Promise.all([
    one("SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE DATE(created_at) = CURDATE() AND estado <> 'cancelado'"),
    one("SELECT COUNT(*) AS v FROM pedidos WHERE estado = 'pendiente'"),
    one('SELECT COUNT(*) AS v FROM productos WHERE stock <= 5 AND estado = 1'),
    one('SELECT COUNT(*) AS v FROM pedidos'),
    query('SELECT id, numero_pedido, nombre_cliente, total, estado, created_at FROM pedidos ORDER BY created_at DESC, id DESC LIMIT 10'),
    query('SELECT id, nombre, stock FROM productos WHERE stock <= 5 AND estado = 1 ORDER BY stock ASC, id LIMIT 10'),
    query(
      `SELECT DATE(created_at) AS fecha, SUM(total) AS total FROM pedidos
       WHERE created_at >= (NOW() - INTERVAL 7 DAY) AND estado <> 'cancelado'
       GROUP BY DATE(created_at) ORDER BY fecha`
    ),
  ]);

  const stats = [
    ['green', 'fa-coins', formatPrecio(hoy.v), 'Ventas de hoy'],
    ['orange', 'fa-hourglass-half', pend.v, 'Pedidos pendientes'],
    ['red', 'fa-triangle-exclamation', stock.v, 'Stock bajo'],
    ['blue', 'fa-shopping-bag', tot.v, 'Total de pedidos'],
  ];

  return (
    <AdminShell titulo="Dashboard">
      <div className="stats-grid">
        {stats.map(([color, icono, valor, etiqueta]) => (
          <div className="stat-card" key={etiqueta}>
            <div className={`stat-icon ${color}`}><i className={`fas ${icono}`}></i></div>
            <div>
              <div className="stat-value">{valor}</div>
              <p className="stat-label">{etiqueta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-split">
        <div className="admin-card">
          <div className="admin-card-header">
            <h5>Últimos pedidos <span className="sub">Los pedidos más recientes de la tienda</span></h5>
            <a href="/admin/pedidos" className="btn btn-sm btn-outline-secondary">Ver todos</a>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.length ? (
                  ultimos.map((p) => (
                    <tr key={p.id}>
                      <td><a href={`/admin/pedidos/${p.id}`}>#{p.numero_pedido}</a></td>
                      <td>{p.nombre_cliente}</td>
                      <td>{formatPrecio(p.total)}</td>
                      <td><span className={`status-badge status-${p.estado}`}>{ucfirst(p.estado)}</span></td>
                      <td>{fechaCorta(p.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center">Aún no hay pedidos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="admin-card">
            <div className="admin-card-header">
              <h5>Stock bajo <span className="sub">Productos por reponer</span></h5>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="num">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {bajos.length ? (
                    bajos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td className="num"><span className="text-danger fw-bold">{p.stock}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={2} className="text-center">Todo el stock está al día</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h5>Ventas de los últimos 7 días</h5>
            </div>
            <div className="admin-card-body">
              <div className="mini-list">
                {semana.length ? (
                  semana.map((v) => (
                    <div key={v.fecha}>
                      <span className="k">{fechaCorta(v.fecha)}</span>
                      <span className="v">{formatPrecio(v.total)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center" style={{ color: 'var(--ad-muted)', margin: 0 }}>Sin ventas en la última semana</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
