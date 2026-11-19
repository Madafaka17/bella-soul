import { one, transaction } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { leerProducto, valoresTexto } from '@/lib/productosAdmin';

export const dynamic = 'force-dynamic';

/** POST /api/admin/productos/:id — actualizar producto */
export async function POST(request, { params }) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const { id } = await params;
  const n = parseInt(id, 10);
  const volver = `/admin/productos/${n}/editar`;

  if (!Number.isInteger(n) || !(await one('SELECT id FROM productos WHERE id = ?', [n]))) {
    return redirigir(request, '/admin/productos', { tipo: 'error', texto: 'Producto no encontrado.' });
  }

  const fd = await request.formData();
  const { datos, error } = await leerProducto(fd);
  if (error) return redirigir(request, volver, { tipo: 'error', texto: error, old: valoresTexto(fd) });

  try {
    await transaction(async (db) => {
      // Las imágenes solo se reemplazan si se subió una nueva
      const campos = [
        'categoria_id = ?', 'nombre = ?', 'descripcion = ?', 'descripcion_corta = ?', 'material = ?', 'recomendaciones = ?',
        'ocasion = ?', 'precio = ?', 'precio_oferta = ?', 'stock = ?', 'destacado = ?', 'novedad = ?', 'updated_at = NOW()',
      ];
      const valores = [
        datos.categoria_id, datos.nombre, datos.descripcion, datos.descripcion_corta, datos.material, datos.recomendaciones,
        datos.ocasion, datos.precio, datos.precio_oferta, datos.stock, datos.destacado, datos.novedad,
      ];
      for (const campo of ['imagen', 'imagen2', 'imagen3']) {
        if (datos.imagenes[campo]) {
          campos.push(`${campo} = ?`);
          valores.push(datos.imagenes[campo]);
        }
      }
      await db.exec(`UPDATE productos SET ${campos.join(', ')} WHERE id = ?`, [...valores, n]);

      await db.exec('DELETE FROM producto_tallas WHERE producto_id = ?', [n]);
      for (const t of datos.tallas) {
        await db.exec('INSERT INTO producto_tallas (producto_id, talla, stock) VALUES (?, ?, ?)', [n, t.talla, t.stock]);
      }
      await db.exec('DELETE FROM producto_colores WHERE producto_id = ?', [n]);
      for (const c of datos.colores) {
        await db.exec('INSERT INTO producto_colores (producto_id, color, codigo_hex) VALUES (?, ?, ?)', [n, c.color, c.hex]);
      }
    });
  } catch (e) {
    console.error('[admin] actualizar producto:', e);
    return redirigir(request, volver, { tipo: 'error', texto: 'No se pudo actualizar el producto. Intenta de nuevo.', old: valoresTexto(fd) });
  }

  return redirigir(request, '/admin/productos', { tipo: 'success', texto: 'Producto actualizado exitosamente.' });
}
