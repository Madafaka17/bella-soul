import AdminShell from '@/components/admin/AdminShell';
import Paginacion from '@/components/admin/Paginacion';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { formatPrecio, fechaHora, ucfirst } from '@/lib/format';

export const metadata = { title: 'Pedidos' };
export const dynamic = 'force-dynamic';

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
const uno = (v) => String((Array.isArray(v) ? v[0] : v) ?? '').trim();

export default async function Pedidos({ searchParams }) {
  const sp = await searchParams;
  const search = uno(sp.search);
  const estado = ESTADOS.includes(uno(sp.estado)) ? uno(sp.estado) : '';

  const where = ['1=1'];
  const params = [];
  if (search) {
    where.push('(numero_pedido LIKE ? OR nombre_cliente LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (estado) {
    where.push('estado = ?');
    params.push(estado);
  }

  const { total } = await one(`SELECT COUNT(*) AS total FROM pedidos WHERE ${where.join(' AND ')}`, params);
  const pag = paginar(sp, total);
  const pedidos = await query(
    `SELECT * FROM pedidos WHERE ${where.join(' AND ')} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, pag.limite, pag.offset]
  );

  return (
    <AdminShell titulo="Pedidos">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Lista de pedidos <span className="sub">Gestiona y da seguimiento a las compras</span></h5>
        </div>
        <div className="admin-card-body">
          <form method="GET" action="/admin/pedidos" className="toolbar">
            <div className="search">
              <i className="fas fa-search"></i>
              <input type="text" name="search" className="form-control" placeholder="Buscar por N° de pedido o cliente..." defaultValue={search} />
            </div>
            <select name="estado" className="form-control" defaultValue={estado}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{ucfirst(e)}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary"><i className="fas fa-filter"></i> Filtrar</button>
            {search || estado ? <a href="/admin/pedidos" className="btn btn-outline-secondary">Limpiar</a> : null}
          </form>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length ? (
                  pedidos.map((p) => (
                    <tr key={p.id}>
                      <td><a href={`/admin/pedidos/${p.id}`}>#{p.numero_pedido}</a></td>
                      <td>{p.nombre_cliente}<br /><small>{p.celular}</small></td>
                      <td>{fechaHora(p.created_at)}</td>
                      <td><strong>{formatPrecio(p.total)}</strong></td>
                      <td><span className={`status-badge status-${p.estado}`}>{ucfirst(p.estado)}</span></td>
                      <td><a href={`/admin/pedidos/${p.id}`} className="btn btn-sm btn-outline-primary"><i className="fas fa-eye"></i> Ver</a></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center">No hay pedidos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/pedidos" params={{ search, estado }} {...pag} />
      </div>
    </AdminShell>
  );
}
