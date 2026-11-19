import AdminShell from '@/components/admin/AdminShell';
import Paginacion from '@/components/admin/Paginacion';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { fechaHora } from '@/lib/format';

export const metadata = { title: 'Consultas' };
export const dynamic = 'force-dynamic';

export default async function Consultas({ searchParams }) {
  const sp = await searchParams;
  const { total } = await one('SELECT COUNT(*) AS total FROM consultas');
  const pag = paginar(sp, total);
  const consultas = await query(
    `SELECT q.*, p.nombre AS producto_nombre FROM consultas q LEFT JOIN productos p ON p.id = q.producto_id
     ORDER BY q.created_at DESC, q.id DESC LIMIT ? OFFSET ?`,
    [pag.limite, pag.offset]
  );

  return (
    <AdminShell titulo="Consultas">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Consultas de clientes <span className="sub">Mensajes recibidos desde la tienda</span></h5>
        </div>
        <div className="admin-card-body">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Nombre</th><th>Teléfono</th><th>Mensaje</th><th>Producto</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {consultas.length ? (
                  consultas.map((q) => {
                    const tel = (q.telefono || '').replace(/[^0-9]/g, '');
                    const mensaje = String(q.mensaje || '');
                    return (
                      <tr key={q.id} style={q.leida ? undefined : { background: 'rgba(201,169,110,0.09)' }}>
                        <td>{q.nombre}</td>
                        <td>
                          {tel ? (
                            <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1E9E50', fontWeight: 600 }}>{q.telefono}</a>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>{mensaje.length > 80 ? `${mensaje.slice(0, 80)}…` : mensaje}</td>
                        <td>
                          {q.producto_id ? <a href={`/admin/productos/${q.producto_id}/editar`}>{q.producto_nombre}</a> : <span className="muted">—</span>}
                        </td>
                        <td>{fechaHora(q.created_at)}</td>
                        <td>
                          {q.leida ? (
                            <span className="status-badge status-entregado">Leído</span>
                          ) : (
                            <span className="status-badge status-pendiente">Nuevo</span>
                          )}
                        </td>
                        <td>
                          {!q.leida ? (
                            <form action={`/api/admin/consultas/${q.id}/leida`} method="POST">
                              <button type="submit" className="btn btn-sm btn-outline-secondary"><i className="fas fa-check-double"></i> Marcar leído</button>
                            </form>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={7} className="text-center">No hay consultas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/consultas" {...pag} />
      </div>
    </AdminShell>
  );
}
