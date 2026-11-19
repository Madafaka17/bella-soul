import AdminShell from '@/components/admin/AdminShell';
import Paginacion from '@/components/admin/Paginacion';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { formatPrecio, fechaCorta } from '@/lib/format';

export const metadata = { title: 'Clientes' };
export const dynamic = 'force-dynamic';

export default async function Clientes({ searchParams }) {
  const sp = await searchParams;
  const { total } = await one('SELECT COUNT(*) AS total FROM clientes');
  const pag = paginar(sp, total);
  const clientes = await query(
    `SELECT c.*,
       (SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id = c.id AND p.estado <> 'cancelado') AS total_pedidos,
       (SELECT COALESCE(SUM(p.total), 0) FROM pedidos p WHERE p.cliente_id = c.id AND p.estado <> 'cancelado') AS total_gastado
     FROM clientes c ORDER BY c.created_at DESC, c.id DESC LIMIT ? OFFSET ?`,
    [pag.limite, pag.offset]
  );

  return (
    <AdminShell titulo="Clientes">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Lista de clientes <span className="sub">Clientas registradas en la tienda</span></h5>
        </div>
        <div className="admin-card-body">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th className="num">Pedidos</th><th className="num">Total gastado</th><th>Registro</th><th>WhatsApp</th></tr>
              </thead>
              <tbody>
                {clientes.length ? (
                  clientes.map((c) => {
                    const tel = (c.telefono || '').replace(/[^0-9]/g, '');
                    return (
                      <tr key={c.id}>
                        <td>{c.nombres} {c.apellidos}</td>
                        <td>{c.email}</td>
                        <td>{c.telefono || '—'}</td>
                        <td className="num">{c.total_pedidos}</td>
                        <td className="num">{formatPrecio(c.total_gastado)}</td>
                        <td>{fechaCorta(c.created_at)}</td>
                        <td>
                          {tel ? (
                            <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success"><i className="fab fa-whatsapp"></i> WhatsApp</a>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={7} className="text-center">No hay clientes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/clientes" {...pag} />
      </div>
    </AdminShell>
  );
}
