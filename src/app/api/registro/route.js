import { exec, one } from '@/lib/db';
import { emailValido, hashClave } from '@/lib/clave';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';
import { setClientCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** POST /api/registro — crear cuenta de clienta */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const form = formAObjeto(await request.formData());

  const nombres = String(form.nombres ?? '').trim().slice(0, 100);
  const apellidos = String(form.apellidos ?? '').trim().slice(0, 100);
  const email = String(form.email ?? '').trim().toLowerCase().slice(0, 150);
  const telefono = String(form.telefono ?? '').trim().slice(0, 20) || null;
  const password = String(form.password ?? '');

  const volver = (texto) =>
    redirigir(request, '/login?registro=1', { tipo: 'error', texto, old: { nombres, apellidos, email, telefono: telefono || '' } });

  if (!nombres || !apellidos) return volver('Ingresa tus nombres y apellidos.');
  if (!emailValido(email)) return volver('Ingresa un correo electrónico válido.');
  if (password.length < 6) return volver('La contraseña debe tener al menos 6 caracteres.');
  if (password !== form.password_confirmation) return volver('Las contraseñas no coinciden.');

  if (await one('SELECT id FROM clientes WHERE email = ?', [email])) {
    return volver('Ya existe una cuenta con ese correo. Inicia sesión.');
  }

  const r = await exec(
    'INSERT INTO clientes (nombres, apellidos, email, telefono, password, estado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())',
    [nombres, apellidos, email, telefono, hashClave(password)]
  );

  const res = redirigir(request, '/mi-cuenta', { tipo: 'success', texto: '¡Cuenta creada exitosamente! Bienvenida a bella.soul2024.' });
  await setClientCookie(res, { id: r.insertId, nombres, apellidos, email });
  return res;
}
