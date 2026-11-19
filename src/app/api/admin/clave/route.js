import { exec, one } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { claveCorrecta, hashClave } from '@/lib/clave';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** POST /api/admin/clave — cambia la contraseña del administrador en sesión */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const { admin, respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const form = formAObjeto(await request.formData());
  const error = (texto) => redirigir(request, '/admin/configuracion', { tipo: 'error', texto });

  const fila = await one('SELECT password FROM administradores WHERE id = ?', [admin.id]);
  if (!fila || !claveCorrecta(form.actual, fila.password)) return error('La contraseña actual no es correcta.');
  if (String(form.nueva ?? '').length < 8) return error('La nueva contraseña debe tener al menos 8 caracteres.');
  if (form.nueva !== form.confirmar) return error('Las contraseñas nuevas no coinciden.');
  if (form.nueva === form.actual) return error('La nueva contraseña debe ser distinta a la actual.');

  await exec('UPDATE administradores SET password = ?, updated_at = NOW() WHERE id = ?', [hashClave(form.nueva), admin.id]);
  return redirigir(request, '/admin/configuracion', { tipo: 'success', texto: 'Contraseña actualizada correctamente.' });
}
