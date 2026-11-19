import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { one, query } from '@/lib/db';
import { categoriasActivas } from '@/lib/data';
import { leerFlash } from '@/lib/http';

export const metadata = { title: 'Editar Producto' };
export const dynamic = 'force-dynamic';

export default async function EditarProducto({ params }) {
  const { id } = await params;
  const n = parseInt(id, 10);
  if (!Number.isInteger(n) || n <= 0) notFound();

  const producto = await one('SELECT * FROM productos WHERE id = ?', [n]);
  if (!producto) notFound();

  const [tallas, colores, categorias, flash] = await Promise.all([
    query('SELECT * FROM producto_tallas WHERE producto_id = ? ORDER BY id', [n]),
    query('SELECT * FROM producto_colores WHERE producto_id = ? ORDER BY id', [n]),
    categoriasActivas(),
    leerFlash(),
  ]);

  return (
    <AdminShell titulo="Editar Producto">
      <ProductForm producto={{ ...producto, tallas, colores }} categorias={categorias} old={flash.old} />
    </AdminShell>
  );
}
