import AdminShell from '@/components/admin/AdminShell';
import ConfirmForm from '@/components/ConfirmForm';
import Paginacion from '@/components/admin/Paginacion';
import { one, query } from '@/lib/db';
import { paginar } from '@/lib/admin';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';
import { categoriasActivas } from '@/lib/data';

export const metadata = { title: 'Productos' };
export const dynamic = 'force-dynamic';

const uno = (v) => String((Array.isArray(v) ? v[0] : v) ?? '').trim();

export default async function Productos({ searchParams }) {
  const sp = await searchParams;
  const search = uno(sp.search);
  const categoria = uno(sp.categoria);

  const where = ['1=1'];
  const params = [];
  if (search) {
    where.push('(p.nombre LIKE ? OR p.slug LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoria) {
    where.push('p.categoria_id = ?');
    params.push(categoria);
  }

  const { total } = await one(`SELECT COUNT(*) AS total FROM productos p WHERE ${where.join(' AND ')}`, params);
  const pag = paginar(sp, total);
  const [productos, categorias] = await Promise.all([
    query(
      `SELECT p.*, c.nombre AS categoria_nombre FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC, p.id DESC LIMIT ? OFFSET ?`,
      [...params, pag.limite, pag.offset]
    ),
    categoriasActivas(),
  ]);

  return (
    <AdminShell titulo="Productos">
      <div className="admin-card">
        <div className="admin-card-header">
          <h5>Lista de productos <span className="sub">Administra tu catálogo</span></h5>
          <a href="/admin/productos/crear" className="btn btn-primary"><i className="fas fa-plus"></i> Nuevo producto</a>
        </div>
        <div className="admin-card-body">
          <form method="GET" action="/admin/productos" className="toolbar">
            <div className="search">
              <i className="fas fa-search"></i>
              <input type="text" name="search" className="form-control" placeholder="Buscar producto..." defaultValue={search} />
            </div>
            <select name="categoria" className="form-control" defaultValue={categoria}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary"><i className="fas fa-filter"></i> Filtrar</button>
            {search || categoria ? <a href="/admin/productos" className="btn btn-outline-secondary">Limpiar</a> : null}
          </form>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Etiquetas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length ? (
                  productos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          {p.imagen ? (
                            <img src={imgUrl(p.imagen)} alt={p.nombre} className="product-thumb" />
                          ) : (
                            <div className="product-thumb empty"><i className="far fa-image"></i></div>
                          )}
                          <a href={`/admin/productos/${p.id}/editar`}>{p.nombre}</a>
                        </div>
                      </td>
                      <td>{p.categoria_nombre || '—'}</td>
                      <td>
                        {Number(p.precio_oferta) > 0 ? (
                          <>
                            <strong>{formatPrecio(p.precio_oferta)}</strong>
                            <br />
                            <small style={{ textDecoration: 'line-through' }}>{formatPrecio(p.precio)}</small>
                          </>
                        ) : (
                          formatPrecio(p.precio)
                        )}
                      </td>
                      <td><span className={`${p.stock <= 5 ? 'text-danger' : 'text-success'} fw-bold`}>{p.stock}</span></td>
                      <td>
                        {p.estado ? (
                          <span className="status-badge status-entregado">Activo</span>
                        ) : (
                          <span className="status-badge status-cancelado">Inactivo</span>
                        )}
                      </td>
                      <td>
                        {p.destacado ? <span className="badge bg-warning">Destacado</span> : null}{' '}
                        {p.novedad ? <span className="badge bg-info">Novedad</span> : null}
                        {!p.destacado && !p.novedad ? <span className="muted">—</span> : null}
                      </td>
                      <td>
                        <div className="actions">
                          <a href={`/admin/productos/${p.id}/editar`} className="btn btn-sm btn-outline-primary"><i className="fas fa-pen"></i> Editar</a>
                          {p.estado ? (
                            <ConfirmForm action={`/api/admin/productos/${p.id}/desactivar`} mensaje="¿Desactivar este producto?">
                              <button type="submit" className="btn btn-sm btn-outline-danger"><i className="fas fa-ban"></i> Desactivar</button>
                            </ConfirmForm>
                          ) : (
                            <form action={`/api/admin/productos/${p.id}/activar`} method="POST">
                              <button type="submit" className="btn btn-sm btn-outline-secondary"><i className="fas fa-rotate-left"></i> Activar</button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="text-center">No hay productos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Paginacion ruta="/admin/productos" params={{ search, categoria }} {...pag} />
      </div>
    </AdminShell>
  );
}
