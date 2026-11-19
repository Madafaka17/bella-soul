import { transaction } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { slugify } from '@/lib/format';
import { leerProducto, valoresTexto } from '@/lib/productosAdmin';

export const dynamic = 'force-dynamic';

/** POST /api/admin/productos — crear producto */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const fd = await request.formData();
  const { datos, error } = await leerProducto(fd);
  if (error) return redirigir(request, '/admin/productos/crear', { tipo: 'error', texto: error, old: valoresTexto(fd) });

  try {
    await transaction(async (db) => {
      const slug = `${slugify(datos.nombre) || 'producto'}-${Date.now()}`;
      const r = await db.exec(
        `INSERT INTO productos
          (categoria_id, nombre, slug, descripcion, descripcion_corta, material, recomendaciones, ocasion,
           precio, precio_oferta, stock, imagen, imagen2, imagen3, destacado, novedad, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          datos.categoria_id, datos.nombre, slug, datos.descripcion, datos.descripcion_corta, datos.material,
          datos.recomendaciones, datos.ocasion, datos.precio, datos.precio_oferta, datos.stock,
          datos.imagenes.imagen ?? null, datos.imagenes.imagen2 ?? null, datos.imagenes.imagen3 ?? null,
          datos.destacado, datos.novedad,
        ]
      );
      for (const t of datos.tallas) {
        await db.exec('INSERT INTO producto_tallas (producto_id, talla, stock) VALUES (?, ?, ?)', [r.insertId, t.talla, t.stock]);
      }
      for (const c of datos.colores) {
        await db.exec('INSERT INTO producto_colores (producto_id, color, codigo_hex) VALUES (?, ?, ?)', [r.insertId, c.color, c.hex]);
      }
    });
  } catch (e) {
    console.error('[admin] crear producto:', e);
    return redirigir(request, '/admin/productos/crear', { tipo: 'error', texto: 'No se pudo crear el producto. Intenta de nuevo.', old: valoresTexto(fd) });
  }

  return redirigir(request, '/admin/productos', { tipo: 'success', texto: 'Producto creado exitosamente.' });
}
