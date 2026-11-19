import { query, one } from '@/lib/db';

const BASE_PRODUCTO = `
  SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
`;

/** Agrega campos derivados (oferta, descuento, precio actual) */
export function conDerivados(p) {
  if (!p) return p;
  const precio = Number(p.precio) || 0;
  const oferta = Number(p.precio_oferta) || 0;
  const tieneOferta = oferta > 0 && oferta < precio;
  return {
    ...p,
    destacado: !!p.destacado,
    novedad: !!p.novedad,
    estado: !!p.estado,
    tiene_oferta: tieneOferta,
    descuento: tieneOferta ? Math.round((1 - oferta / precio) * 100) : 0,
    precio_actual: tieneOferta ? oferta : precio,
  };
}

export async function categoriasActivas() {
  return query('SELECT * FROM categorias WHERE estado = 1 ORDER BY orden, id');
}

export async function productosDestacados(n = 8) {
  const rows = await query(`${BASE_PRODUCTO} WHERE p.estado = 1 AND p.destacado = 1 ORDER BY p.created_at DESC, p.id DESC LIMIT ?`, [n]);
  return rows.map(conDerivados);
}

export async function productosNuevos(n = 4) {
  const rows = await query(`${BASE_PRODUCTO} WHERE p.estado = 1 AND p.novedad = 1 ORDER BY p.created_at DESC, p.id DESC LIMIT ?`, [n]);
  return rows.map(conDerivados);
}

export async function productoActivo(id) {
  const n = parseInt(id, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  const p = await one(`${BASE_PRODUCTO} WHERE p.estado = 1 AND p.id = ?`, [n]);
  if (!p) return null;
  const [tallas, colores] = await Promise.all([
    query('SELECT * FROM producto_tallas WHERE producto_id = ? ORDER BY id', [n]),
    query('SELECT * FROM producto_colores WHERE producto_id = ? ORDER BY id', [n]),
  ]);
  return { ...conDerivados(p), tallas, colores };
}

export async function productosRelacionados(prod, n = 4) {
  const rows = await query(
    `${BASE_PRODUCTO} WHERE p.estado = 1 AND p.categoria_id = ? AND p.id <> ? ORDER BY p.created_at DESC, p.id DESC LIMIT ?`,
    [prod.categoria_id, prod.id, n]
  );
  return rows.map(conDerivados);
}

const PRECIO_FINAL = 'COALESCE(NULLIF(p.precio_oferta, 0), p.precio)';

/**
 * Catálogo con filtros y paginación (12 por página).
 * f: { cat, talla, color, ocasion, disp, novedad, precioMax, q, orden, page }
 */
export async function catalogo(f) {
  const where = ['p.estado = 1'];
  const params = [];

  if (f.cat) {
    where.push('c.slug = ?');
    params.push(f.cat);
  }
  if (f.q) {
    where.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
    params.push(`%${f.q}%`, `%${f.q}%`);
  }
  if (f.ocasion) {
    where.push('p.ocasion = ?');
    params.push(f.ocasion);
  }
  if (f.disp) where.push('p.stock > 0');
  if (f.novedad) where.push('p.novedad = 1');
  if (f.precioMax < 999) {
    where.push(`${PRECIO_FINAL} <= ?`);
    params.push(f.precioMax);
  }
  if (f.talla) {
    const tallas = f.talla.split(',').map((t) => t.trim()).filter(Boolean);
    if (tallas.length) {
      where.push('EXISTS (SELECT 1 FROM producto_tallas t WHERE t.producto_id = p.id AND t.talla IN (?) AND t.stock > 0)');
      params.push(tallas);
    }
  }
  if (f.color) {
    where.push('EXISTS (SELECT 1 FROM producto_colores k WHERE k.producto_id = p.id AND k.color LIKE ?)');
    params.push(`%${f.color}%`);
  }

  const orden =
    {
      precio_asc: `${PRECIO_FINAL} ASC, p.id DESC`,
      precio_desc: `${PRECIO_FINAL} DESC, p.id DESC`,
      nombre_asc: 'p.nombre ASC',
    }[f.orden] || 'p.created_at DESC, p.id DESC';

  const porPagina = 12;
  const desde = `FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE ${where.join(' AND ')}`;

  const { total } = await one(`SELECT COUNT(*) AS total ${desde}`, params);
  const ultima = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(Math.max(1, f.page || 1), ultima);

  const rows = await query(
    `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug ${desde} ORDER BY ${orden} LIMIT ? OFFSET ?`,
    [...params, porPagina, (pagina - 1) * porPagina]
  );

  return { productos: rows.map(conDerivados), total, pagina, ultima };
}
