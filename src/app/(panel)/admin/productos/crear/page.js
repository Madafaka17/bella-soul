import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { categoriasActivas } from '@/lib/data';
import { leerFlash } from '@/lib/http';

export const metadata = { title: 'Agregar Producto' };
export const dynamic = 'force-dynamic';

export default async function CrearProducto() {
  const [categorias, flash] = await Promise.all([categoriasActivas(), leerFlash()]);
  return (
    <AdminShell titulo="Agregar Producto">
      <ProductForm producto={null} categorias={categorias} old={flash.old} />
    </AdminShell>
  );
}
