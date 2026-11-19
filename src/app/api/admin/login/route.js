import { one } from '@/lib/db';
import { claveCorrecta, emailValido } from '@/lib/clave';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { setAdminCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** POST /api/admin/login */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const form = formAObjeto(await request.formData());
  const email = String(form.email ?? '').trim().toLowerCase();

  const fallo = () =>
    redirigir(request, '/admin/login', { tipo: 'error', texto: 'Credenciales incorrectas. Verifica tu correo y contraseña.', old: { email } });

  if (!emailValido(email) || !form.password) return fallo();

  const admin = await one('SELECT * FROM administradores WHERE email = ? AND estado = 1', [email]);
  if (!admin || !claveCorrecta(form.password, admin.password)) return fallo();

  const res = redirigir(request, '/admin/dashboard');
  await setAdminCookie(res, admin);
  return res;
}
