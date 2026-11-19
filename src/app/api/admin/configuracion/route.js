import { transaction } from '@/lib/db';
import { adminDeRequest } from '@/lib/admin';
import { formAObjeto, mismoOrigen, prohibido, redirigir } from '@/lib/http';

export const dynamic = 'force-dynamic';

const TEXTO = [
  'tienda_nombre', 'whatsapp_numero', 'email_contacto', 'direccion',
  'instagram_url', 'facebook_url', 'tiktok_url',
  'yape_nombre', 'yape_numero', 'plin_nombre', 'plin_numero', 'bcp_cuenta', 'bcp_cci',
];
const NUMERICOS = ['costo_envio_lima', 'costo_envio_provincia', 'envio_gratis_minimo'];
const URLS = ['instagram_url', 'facebook_url', 'tiktok_url'];

/** POST /api/admin/configuracion */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();
  const { respuesta } = await adminDeRequest(request);
  if (respuesta) return respuesta;

  const form = formAObjeto(await request.formData());
  const error = (texto) => redirigir(request, '/admin/configuracion', { tipo: 'error', texto, old: form });

  const valores = {};
  for (const k of TEXTO) {
    if (form[k] === undefined) continue;
    const v = String(form[k]).trim().slice(0, 500);
    if (URLS.includes(k) && v && !/^https?:\/\//i.test(v)) return error('Los enlaces de redes sociales deben empezar con http:// o https://');
    valores[k] = v;
  }
  if (valores.whatsapp_numero) valores.whatsapp_numero = valores.whatsapp_numero.replace(/[^0-9]/g, '');
  for (const k of NUMERICOS) {
    if (form[k] === undefined) continue;
    const n = parseFloat(form[k]);
    if (!Number.isFinite(n) || n < 0) return error('Los costos de envío deben ser números mayores o iguales a 0.');
    valores[k] = String(n);
  }

  await transaction(async (db) => {
    for (const [clave, valor] of Object.entries(valores)) {
      await db.exec(
        `INSERT INTO configuracion (clave, valor, created_at, updated_at) VALUES (?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE valor = VALUES(valor), updated_at = NOW()`,
        [clave, valor]
      );
    }
  });

  return redirigir(request, '/admin/configuracion', { tipo: 'success', texto: 'Configuración actualizada.' });
}
