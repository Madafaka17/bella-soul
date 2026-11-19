import { one } from '@/lib/db';
import { guardarImagen } from '@/lib/imagenes';
import { OCASIONES } from '@/components/admin/ProductForm';

const OCASIONES_OK = OCASIONES.map(([v]) => v);

/** Agrupa campos tipo tallas[0][talla] en una lista de objetos */
function filasAnidadas(fd, base) {
  const filas = {};
  const re = new RegExp(`^${base}\\[(\\d+)\\]\\[(\\w+)\\]$`);
  for (const [k, v] of fd.entries()) {
    const m = k.match(re);
    if (m && typeof v === 'string') (filas[m[1]] ??= {})[m[2]] = v;
  }
  return Object.keys(filas)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => filas[k]);
}

const esArchivo = (v) => v && typeof v === 'object' && typeof v.arrayBuffer === 'function' && v.size > 0;

/**
 * Lee y valida el formulario de producto.
 * Devuelve { datos } o { error } con un mensaje legible.
 */
export async function leerProducto(fd) {
  const s = (k, max) => String(fd.get(k) ?? '').trim().slice(0, max);

  const categoria_id = parseInt(fd.get('categoria_id'), 10);
  const nombre = s('nombre', 200);
  const ocasion = s('ocasion', 30);
  const precio = parseFloat(fd.get('precio'));
  const ofertaTxt = s('precio_oferta', 20);
  const oferta = ofertaTxt === '' ? null : parseFloat(ofertaTxt);
  const stock = parseInt(fd.get('stock'), 10);

  if (!nombre) return { error: 'El nombre del producto es obligatorio.' };
  if (!Number.isInteger(categoria_id) || !(await one('SELECT id FROM categorias WHERE id = ?', [categoria_id]))) {
    return { error: 'Elige una categoría válida.' };
  }
  if (!OCASIONES_OK.includes(ocasion)) return { error: 'Elige una ocasión válida.' };
  if (!Number.isFinite(precio) || precio < 0) return { error: 'Ingresa un precio válido.' };
  if (oferta !== null && (!Number.isFinite(oferta) || oferta < 0)) return { error: 'El precio de oferta no es válido.' };
  if (oferta && oferta >= precio) return { error: 'El precio de oferta debe ser menor que el precio normal.' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'El stock debe ser un número entero mayor o igual a 0.' };

  // Imágenes nuevas (opcionales)
  const imagenes = {};
  try {
    for (const campo of ['imagen', 'imagen2', 'imagen3']) {
      const f = fd.get(campo);
      if (esArchivo(f)) imagenes[campo] = await guardarImagen(f);
    }
  } catch (e) {
    return { error: e.message };
  }

  const tallas = filasAnidadas(fd, 'tallas')
    .map((t) => ({ talla: String(t.talla ?? '').trim().slice(0, 10), stock: Math.max(0, parseInt(t.stock, 10) || 0) }))
    .filter((t) => t.talla);
  const colores = filasAnidadas(fd, 'colores')
    .map((c) => ({
      color: String(c.color ?? '').trim().slice(0, 50),
      hex: /^#[0-9a-fA-F]{6}$/.test(c.hex ?? '') ? c.hex : '#000000',
    }))
    .filter((c) => c.color);

  return {
    datos: {
      categoria_id,
      nombre,
      descripcion: s('descripcion', 5000) || null,
      descripcion_corta: s('descripcion_corta', 300) || null,
      material: s('material', 100) || null,
      recomendaciones: s('recomendaciones', 2000) || null,
      ocasion,
      precio,
      precio_oferta: oferta || null,
      stock,
      destacado: fd.get('destacado') === '1' ? 1 : 0,
      novedad: fd.get('novedad') === '1' ? 1 : 0,
      imagenes,
      tallas,
      colores,
    },
  };
}

/** Texto de un formulario como objeto simple para repoblar los campos tras un error */
export function valoresTexto(fd) {
  const o = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.includes('[')) o[k] = v;
  return o;
}
