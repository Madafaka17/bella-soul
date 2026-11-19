import { exec, one } from '@/lib/db';
import { hashClave } from '@/lib/clave';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { COOKIE_CLIENT, setClientCookie, verificar } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** POST /api/cuenta — actualizar datos de la clienta */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();

  const token = await verificar(request.cookies.get(COOKIE_CLIENT)?.value);
  if (token?.tipo !== 'cliente') return redirigir(request, '/login', { tipo: 'error', texto: 'Inicia sesión para continuar.' });

  const form = formAObjeto(await request.formData());
  const nombres = String(form.nombres ?? '').trim().slice(0, 100);
  const apellidos = String(form.apellidos ?? '').trim().slice(0, 100);
  const telefono = String(form.telefono ?? '').trim().slice(0, 20) || null;
  const direccion = String(form.direccion ?? '').trim().slice(0, 500) || null;
  const dni = String(form.dni ?? '').trim().slice(0, 8) || null;
  const password = String(form.password ?? '');

  const volver = (texto) => redirigir(request, '/mi-cuenta', { tipo: 'error', texto });
  if (!nombres || !apellidos) return volver('Los nombres y apellidos son obligatorios.');
  if (password && password.length < 6) return volver('La nueva contraseña debe tener al menos 6 caracteres.');

  const campos = ['nombres = ?', 'apellidos = ?', 'telefono = ?', 'direccion = ?', 'dni = ?', 'updated_at = NOW()'];
  const valores = [nombres, apellidos, telefono, direccion, dni];
  if (password) {
    campos.push('password = ?');
    valores.push(hashClave(password));
  }
  await exec(`UPDATE clientes SET ${campos.join(', ')} WHERE id = ?`, [...valores, token.id]);

  const cliente = await one('SELECT id, nombres, apellidos, email FROM clientes WHERE id = ?', [token.id]);
  const res = redirigir(request, '/mi-cuenta', { tipo: 'success', texto: 'Datos actualizados correctamente.' });
  if (cliente) await setClientCookie(res, cliente);
  return res;
}
