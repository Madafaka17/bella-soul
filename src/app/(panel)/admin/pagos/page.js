import AdminShell from '@/components/admin/AdminShell';
import Paginacion from '@/components/admin/Paginacion';
import ConfirmForm from '@/components/ConfirmForm';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { formatPrecio, ucfirst } from '@/lib/format';

export const metadata = { title: 'Pagos' };
export const dynamic = 'force-dynamic';

const MAPA = { pendiente: 'pendiente', verificado: 'entregado', rechazado: 'cancelado' };

export default async function Pagos({ searchParams }) {
  const sp = await searchParams;
  const { total } = await one('SELECT COUNT(*) AS total FROM pagos');
  const pag = paginar(sp, total);
  const pagos = await query(
    `SELECT g.*, p.numero_pedido FROM pagos g LEFT JOIN pedidos p ON p.id = g.pedido_id
     ORDER BY g.created_at DESC, g.id DESC LIMIT ? OFFSET ?`,
    [pag.limite, pag.offset]
  );

  return (
    <AdminShell titulo="Pagos">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Verificación de pagos <span className="sub">Confirma los pagos para avanzar los pedidos</span></h5>
        </div>
        <div className="admin-card-body">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th><th>Método</th><th>Monto</th><th>N° Operación</th><th>Comprobante</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.length ? (
                  pagos.map((g) => (
                    <tr key={g.id}>
                      <td>{g.pedido_id ? <a href={`/admin/pedidos/${g.pedido_id}`}>#{g.numero_pedido || g.pedido_id}</a> : '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{g.metodo}</td>
                      <td>{formatPrecio(g.monto)}</td>
                      <td>{g.numero_operacion || '—'}</td>
                      <td>
                        {g.comprobante_img ? (
                          <a href={`/media/${g.comprobante_img}`} target="_blank" className="btn btn-sm btn-outline-info"><i className="fas fa-image"></i> Ver</a>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td><span className={`status-badge status-${MAPA[g.estado] || 'pendiente'}`}>{ucfirst(g.estado)}</span></td>
                      <td>
                        {g.estado === 'pendiente' ? (
                          <div className="actions">
                            <form action={`/api/admin/pagos/${g.id}/verificar`} method="POST">
                              <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-check"></i> Verificar</button>
                            </form>
                            <ConfirmForm action={`/api/admin/pagos/${g.id}/rechazar`} mensaje="¿Rechazar este pago?">
                              <button type="submit" className="btn btn-sm btn-danger"><i className="fas fa-times"></i> Rechazar</button>
                            </ConfirmForm>
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="text-center">No hay pagos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/pagos" {...pag} />
      </div>
    </AdminShell>
  );
}
