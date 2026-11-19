import AdminShell from '@/components/admin/AdminShell';
import Paginacion from '@/components/admin/Paginacion';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { formatPrecio, fechaCorta } from '@/lib/format';

export const metadata = { title: 'Boletas' };
export const dynamic = 'force-dynamic';

export default async function Boletas({ searchParams }) {
  const sp = await searchParams;
  const { total } = await one('SELECT COUNT(*) AS total FROM boletas');
  const pag = paginar(sp, total);
  const boletas = await query(
    `SELECT b.*, p.numero_pedido, p.nombre_cliente, p.total AS total_pedido
     FROM boletas b LEFT JOIN pedidos p ON p.id = b.pedido_id
     ORDER BY b.created_at DESC, b.id DESC LIMIT ? OFFSET ?`,
    [pag.limite, pag.offset]
  );

  return (
    <AdminShell titulo="Boletas">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Boletas emitidas <span className="sub">Comprobantes generados por cada pedido</span></h5>
        </div>
        <div className="admin-card-body">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>N° Boleta</th><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {boletas.length ? (
                  boletas.map((b) => (
                    <tr key={b.id}>
                      <td>{b.numero_boleta}</td>
                      <td>#{b.numero_pedido || '—'}</td>
                      <td>{b.nombres || b.nombre_cliente || '—'}</td>
                      <td>{fechaCorta(b.created_at)}</td>
                      <td>{formatPrecio(b.total ?? b.total_pedido ?? 0)}</td>
                      <td><a href={`/boleta/${b.pedido_id}`} target="_blank" className="btn btn-sm btn-outline-primary"><i className="fas fa-eye"></i> Ver</a></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center">No hay boletas emitidas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/boletas" {...pag} />
      </div>
    </AdminShell>
  );
}
