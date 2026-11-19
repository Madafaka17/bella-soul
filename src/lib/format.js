export const MONEDA = process.env.MONEDA || 'S/';

/** "S/ 1,234.50" */
export function formatPrecio(n) {
  const v = Number(n) || 0;
  return `${MONEDA} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ucfirst(s) {
  const t = String(s ?? '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const pad = (n) => String(n).padStart(2, '0');

/** "2026-11-18 13:05:09" -> "18/11/2026" */
export function fechaCorta(s) {
  if (!s) return '—';
  const [d] = String(s).split(' ');
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

/** "2026-11-18 13:05:09" -> "18/11/2026 13:05" */
export function fechaHora(s) {
  if (!s) return '—';
  const [d, t = '00:00:00'] = String(s).split(' ');
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y} ${t.slice(0, 5)}`;
}

/** Fecha de hoy en Lima como "YYYY-MM-DD" */
export function hoyLima() {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return f.format(new Date());
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const nombreMes = (n) => MESES[(Number(n) || 1) - 1];

export function fechaLargaLima() {
  const s = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return ucfirst(s);
}

export function slugify(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Cantidad numérica segura (entero >= min) */
export function entero(v, min = 0, def = 0) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.max(n, min) : def;
}

export function decimal(v, def = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
}

export { pad };
