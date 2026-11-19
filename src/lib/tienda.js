import { cache } from 'react';
import { query } from '@/lib/db';

/** Número de WhatsApp por defecto (se puede cambiar en Admin → Configuración) */
const WHATSAPP_DEFECTO = process.env.WHATSAPP_NUMBER || '51944888664';

/**
 * Ajustes de la tienda (tabla `configuracion`, editable desde el admin).
 * `cache` de React: una sola consulta por petición.
 */
export const getConfig = cache(async () => {
  try {
    const rows = await query('SELECT clave, valor FROM configuracion');
    const cfg = {};
    for (const r of rows) cfg[r.clave] = r.valor;
    return cfg;
  } catch {
    return {};
  }
});

export async function configTienda(clave, def = null) {
  const cfg = await getConfig();
  const v = cfg[clave];
  return v === undefined || v === null || v === '' ? def : v;
}

// ---------------------------------------------------------------
// Envío según la ciudad
// ---------------------------------------------------------------
export const ZONA_LOCAL_NOMBRE = 'Moyobamba y alrededores';

/** Localidades que pagan la tarifa local (sin tildes ni mayúsculas) */
export const ZONA_LOCAL = ['moyobamba', 'sorito', 'soritor', 'calzada', 'habana', 'jepelacio', 'yantalo'];

export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function esZonaLocal(ciudad) {
  const c = normalizar(ciudad);
  if (!c) return false;
  return ZONA_LOCAL.some((k) => c.includes(k));
}

export async function tarifas() {
  const cfg = await getConfig();
  const num = (k, d) => {
    const v = cfg[k];
    return v === undefined || v === null || v === '' ? d : Number(v);
  };
  return {
    local: num('costo_envio_lima', 8),
    nacional: num('costo_envio_provincia', 15),
    gratisDesde: num('envio_gratis_minimo', 150),
  };
}

/**
 * Costo de envío:
 * - Recojo en tienda: gratis.
 * - Subtotal >= mínimo de envío gratis: gratis.
 * - Moyobamba y alrededores: tarifa local; resto del país: tarifa nacional.
 */
export function calcularEnvio(subtotal, ciudad, metodoEntrega, t) {
  if (metodoEntrega === 'retiro') return 0;
  if (t.gratisDesde > 0 && subtotal >= t.gratisDesde) return 0;
  return esZonaLocal(ciudad) ? t.local : t.nacional;
}

export async function whatsappNumero() {
  return (await configTienda('whatsapp_numero', WHATSAPP_DEFECTO)) || WHATSAPP_DEFECTO;
}

/** Enlace de WhatsApp con mensaje opcional */
export async function whatsappLink(mensaje = '') {
  const n = await whatsappNumero();
  return mensaje ? `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}` : `https://wa.me/${n}`;
}
