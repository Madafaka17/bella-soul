import { redirect } from 'next/navigation';
import { COOKIE_ADMIN, getAdmin, verificar } from '@/lib/session';
import { redirigir } from '@/lib/http';

/** Páginas del panel: si no hay sesión de admin, envía al login */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/**
 * Endpoints POST del panel: devuelve el admin o una redirección al login.
 * Uso: const { admin, respuesta } = await adminDeRequest(request); if (respuesta) return respuesta;
 */
export async function adminDeRequest(request) {
  const p = await verificar(request.cookies.get(COOKIE_ADMIN)?.value);
  if (p?.tipo !== 'admin') {
    return { admin: null, respuesta: redirigir(request, '/admin/login', { tipo: 'error', texto: 'Inicia sesión para continuar.' }) };
  }
  return { admin: { id: p.id, nombre: p.nombre, rol: p.rol }, respuesta: null };
}

/** Páginas de 20 filas: calcula LIMIT/OFFSET a partir de ?page= */
export function paginar(sp, total, porPagina = 20) {
  const ultima = Math.max(1, Math.ceil(total / porPagina));
  const pedida = parseInt(Array.isArray(sp.page) ? sp.page[0] : sp.page, 10) || 1;
  const pagina = Math.min(Math.max(1, pedida), ultima);
  return { pagina, ultima, offset: (pagina - 1) * porPagina, limite: porPagina, total };
}
