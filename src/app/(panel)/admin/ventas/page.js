import AdminShell from '@/components/admin/AdminShell';
import { one, query } from '@/lib/db';
import { formatPrecio, fechaCorta, fechaHora, nombreMes, ucfirst } from '@/lib/format';

export const metadata = { title: 'Ventas' };
export const dynamic = 'force-dynamic';

const VIGENTE = "estado <> 'cancelado'";

export default async function Ventas() {
  const [hoy, mes, anio, mensuales, top, vendidos, unidades, entregados] = await Promise.all([
    one(`SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE DATE(created_at) = CURDATE() AND ${VIGENTE}`),
    one(`SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE DATE(created_at) >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND ${VIGENTE}`),
    one(`SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE YEAR(created_at) = YEAR(CURDATE()) AND ${VIGENTE}`),
    query(
      `SELECT YEAR(created_at) AS anio, MONTH(created_at) AS mes_num, SUM(total) AS total, COUNT(*) AS cantidad
       FROM pedidos WHERE ${VIGENTE} GROUP BY YEAR(created_at), MONTH(created_at)
       ORDER BY anio DESC, mes_num DESC LIMIT 12`
    ),
    query(
      `SELECT d.nombre_producto AS nombre, SUM(d.cantidad) AS total_vendido, SUM(d.subtotal) AS monto_total
       FROM detalle_pedido d JOIN pedidos p ON p.id = d.pedido_id
       WHERE p.estado <> 'cancelado' GROUP BY d.nombre_producto ORDER BY total_vendido DESC LIMIT 10`
    ),
    query(
      `SELECT d.*, p.numero_pedido, p.nombre_cliente, p.estado, p.created_at AS fecha_venta
       FROM detalle_pedido d JOIN pedidos p ON p.id = d.pedido_id
       WHERE p.estado <> 'cancelado' ORDER BY p.created_at DESC, d.id DESC LIMIT 50`
    ),
    one(`SELECT COALESCE(SUM(d.cantidad), 0) AS v FROM detalle_pedido d JOIN pedidos p ON p.id = d.pedido_id WHERE p.estado <> 'cancelado'`),
    query("SELECT id, numero_pedido, nombre_cliente, total, updated_at FROM pedidos WHERE estado = 'entregado' ORDER BY updated_at DESC LIMIT 20"),
  ]);

  return (
    <AdminShell titulo="Ventas">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-sun"></i></div>
          <div><div className="stat-value">{formatPrecio(hoy.v)}</div><p className="stat-label">Total hoy</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-calendar-alt"></i></div>
          <div><div className="stat-value">{formatPrecio(mes.v)}</div><p className="stat-label">Total del mes</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><i className="fas fa-chart-line"></i></div>
          <div>
            <div className="stat-value">{formatPrecio(anio.v)}</div>
            <p className="stat-label">Total del año</p>
            <span className="stat-note">{unidades.v} prendas vendidas</span>
          </div>
        </div>
      </div>

      <div className="admin-split even">
        <div className="admin-card">
          <div className="admin-card-header"><h5>Ventas mensuales</h5></div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Mes</th><th className="num">Total</th><th className="num">Pedidos</th></tr>
              </thead>
              <tbody>
                {mensuales.length ? (
                  mensuales.map((m) => (
                    <tr key={`${m.anio}-${m.mes_num}`}>
                      <td>{nombreMes(m.mes_num)} {m.anio}</td>
                      <td className="num">{formatPrecio(m.total)}</td>
                      <td className="num">{m.cantidad}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header"><h5>Top 10 productos más vendidos</h5></div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Producto</th><th className="num">Vendidas</th><th className="num">Total</th></tr>
              </thead>
              <tbody>
                {top.length ? (
                  top.map((t, i) => (
                    <tr key={t.nombre}>
                      <td><strong>{i + 1}</strong></td>
                      <td>{t.nombre}</td>
                      <td className="num">{t.total_vendido}</td>
                      <td className="num">{formatPrecio(t.monto_total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h5>Productos vendidos <span className="sub">Últimos 50 movimientos</span></h5></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th><th>N° Pedido</th><th>Cliente</th><th>Producto</th><th>Talla</th><th>Color</th>
                <th className="num">Cant.</th><th className="num">Subtotal</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {vendidos.length ? (
                vendidos.map((v) => (
                  <tr key={v.id}>
                    <td>{fechaHora(v.fecha_venta)}</td>
                    <td><a href={`/admin/pedidos/${v.pedido_id}`}>#{v.numero_pedido}</a></td>
                    <td>{v.nombre_cliente}</td>
                    <td>{v.nombre_producto}</td>
                    <td>{v.talla || '—'}</td>
                    <td>{v.color || '—'}</td>
                    <td className="num">{v.cantidad}</td>
                    <td className="num">{formatPrecio(v.subtotal)}</td>
                    <td><span className={`status-badge status-${v.estado}`}>{ucfirst(v.estado)}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="text-center">Aún no hay productos vendidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header"><h5>Pedidos entregados</h5></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>N° Pedido</th><th>Cliente</th><th>Fecha de entrega</th><th className="num">Total</th></tr>
            </thead>
            <tbody>
              {entregados.length ? (
                entregados.map((e) => (
                  <tr key={e.id}>
                    <td>#{e.numero_pedido}</td>
                    <td>{e.nombre_cliente}</td>
                    <td>{fechaCorta(e.updated_at)}</td>
                    <td className="num">{formatPrecio(e.total)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center">Sin pedidos entregados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
