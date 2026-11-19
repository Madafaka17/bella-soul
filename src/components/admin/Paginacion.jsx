/** Paginación simple para listados del panel. `base` ya incluye "?" o "&" si hay filtros. */
export default function Paginacion({ ruta, params = {}, pagina, ultima, total }) {
  if (ultima <= 1) return null;

  const href = (p) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) u.set(k, String(v));
    u.set('page', String(p));
    return `${ruta}?${u.toString()}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.5rem', borderTop: '1px solid var(--ad-line)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--ad-muted)' }}>
        {total} registros · Página {pagina} de {ultima}
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {pagina > 1 ? (
          <a href={href(pagina - 1)} className="btn btn-sm btn-outline-secondary"><i className="fas fa-chevron-left"></i> Anterior</a>
        ) : null}
        {pagina < ultima ? (
          <a href={href(pagina + 1)} className="btn btn-sm btn-outline-secondary">Siguiente <i className="fas fa-chevron-right"></i></a>
        ) : null}
      </div>
    </div>
  );
}
