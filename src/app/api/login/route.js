import { one } from '@/lib/db';
import { claveCorrecta, emailValido, rutaInterna } from '@/lib/clave';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { setClientCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** POST /api/login — ingreso de clientas */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const form = formAObjeto(await request.formData());
  const email = String(form.email ?? '').trim().toLowerCase();
  const destino = rutaInterna(form.redirect, '/mi-cuenta');

  if (!emailValido(email) || !form.password) {
    return redirigir(request, '/login', { tipo: 'error', texto: 'Ingresa tu correo y tu contraseña.', old: { email } });
  }

  const cliente = await one('SELECT * FROM clientes WHERE email = ? AND estado = 1', [email]);
  if (!cliente || !claveCorrecta(form.password, cliente.password)) {
    return redirigir(request, '/login', { tipo: 'error', texto: 'Credenciales incorrectas. Verifica tu correo y contraseña.', old: { email } });
  }

  const res = redirigir(request, destino, { tipo: 'success', texto: `¡Bienvenida de nuevo, ${cliente.nombres}!` });
  await setClientCookie(res, cliente, form.remember === 'on');
  return res;
}
