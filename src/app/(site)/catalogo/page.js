import ProductCard from '@/components/site/ProductCard';
import { catalogo, categoriasActivas } from '@/lib/data';
import { whatsappNumero } from '@/lib/tienda';

export const metadata = { title: 'Catálogo — bella.soul2024' };

const OCASIONES = ['Casual', 'Formal', 'Fiesta', 'Playa', 'Trabajo', 'Diario'];
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];

const primero = (v) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Construye "?a=1&b=2" omitiendo claves vacías y las indicadas */
function qs(params, omitir = []) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (omitir.includes(k) || v === '' || v === null || v === undefined || v === false) continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

const chip = { background: 'var(--color-beige)', color: 'var(--color-dark)', padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };

export default async function Catalogo({ searchParams }) {
  const sp = await searchParams;
  const filtros = {
    cat: String(primero(sp.cat)).trim(),
    talla: String(primero(sp.talla)).trim(),
    color: String(primero(sp.color)).trim(),
    ocasion: String(primero(sp.ocasion)).trim(),
    disp: ['1', 'true', 'on'].includes(String(primero(sp.disp))),
    novedad: ['1', 'true', 'on'].includes(String(primero(sp.novedad))),
    precioMax: parseFloat(primero(sp.precio_max)) || 999,
    q: String(primero(sp.q)).trim(),
    orden: String(primero(sp.orden)) || 'recientes',
    page: parseInt(primero(sp.page), 10) || 1,
  };

  const [categorias, resultado, numero] = await Promise.all([categoriasActivas(), catalogo(filtros), whatsappNumero()]);
  const { productos, total, pagina, ultima } = resultado;
  const waMsg = (m) => `https://wa.me/${numero}?text=${encodeURIComponent(m)}`;

  const catActiva = categorias.find((c) => c.slug === filtros.cat);
  const catActivaNombre = catActiva ? catActiva.nombre : '';
  const tallasSel = filtros.talla ? filtros.talla.split(',') : [];

  // Parámetros actuales (para enlaces de paginación y chips)
  const actuales = {
    q: filtros.q,
    cat: filtros.cat,
    ocasion: filtros.ocasion,
    talla: filtros.talla,
    color: filtros.color,
    precio_max: filtros.precioMax < 999 ? filtros.precioMax : '',
    disp: filtros.disp ? 1 : '',
    novedad: filtros.novedad ? 1 : '',
    orden: filtros.orden !== 'recientes' ? filtros.orden : '',
  };
  const hayFiltros = filtros.q || filtros.cat || filtros.ocasion || filtros.talla || filtros.disp || filtros.novedad;

  return (
    <>
      <section className="page-hero-modern">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span className="current">Catálogo</span>
          </div>
          <h1>Catálogo</h1>
          {catActivaNombre ? <p style={{ color: 'var(--color-gray)', marginTop: 'var(--space-sm)' }}>{catActivaNombre}</p> : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="catalog-layout">
            {/* Filtros */}
            <aside className="filters-sidebar">
              <div className="filter-title">
                <span><i className="fas fa-sliders-h" style={{ marginRight: '0.5rem' }}></i>Filtros</span>
                <a href="/catalogo" className="filter-clear">Limpiar</a>
              </div>

              <form method="GET" action="/catalogo" id="filterForm">
                <div className="filter-group">
                  <div className="filter-group-title">Buscar</div>
                  <div className="catalog-search" style={{ maxWidth: 'none' }}>
                    <i className="fas fa-search"></i>
                    <input type="text" name="q" placeholder="Buscar prendas..." defaultValue={filtros.q} />
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-group-title">Categorías</div>
                  <div className="filter-options">
                    <label className="filter-check">
                      <input type="radio" name="cat" value="" defaultChecked={!filtros.cat} />
                      <span>Todas</span>
                    </label>
                    {categorias.map((c) => (
                      <label className="filter-check" key={c.id}>
                        <input type="radio" name="cat" value={c.slug} defaultChecked={filtros.cat === c.slug} />
                        <span>{c.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-group-title">Ocasión</div>
                  <div className="filter-options">
                    <label className="filter-check">
                      <input type="radio" name="ocasion" value="" defaultChecked={!filtros.ocasion} />
                      <span>Todas</span>
                    </label>
                    {OCASIONES.map((o) => (
                      <label className="filter-check" key={o}>
                        <input type="radio" name="ocasion" value={o.toLowerCase()} defaultChecked={filtros.ocasion === o.toLowerCase()} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-group-title">Tallas</div>
                  <div className="filter-size-grid">
                    {TALLAS.map((t) => (
                      <button type="button" key={t} className={`size-btn ${tallasSel.includes(t) ? 'active' : ''}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="talla" id="tallaInput" defaultValue={filtros.talla} />
                </div>

                <div className="filter-group">
                  <div className="filter-group-title">Precio máximo</div>
                  <div className="price-range-wrap">
                    <input type="range" name="precio_max" id="priceRange" min="0" max="999" step="10" defaultValue={filtros.precioMax} />
                    <div className="price-labels">
                      <span>S/0</span>
                      <span id="priceDisplay">S/{filtros.precioMax.toLocaleString('es-PE')}</span>
                    </div>
                  </div>
                </div>

                <div className="filter-group">
                  <div className="filter-group-title">Disponibilidad</div>
                  <div className="filter-options">
                    <label className="filter-check">
                      <input type="checkbox" name="disp" value="1" defaultChecked={filtros.disp} />
                      <span>Solo disponibles</span>
                    </label>
                    <label className="filter-check">
                      <input type="checkbox" name="novedad" value="1" defaultChecked={filtros.novedad} />
                      <span>Novedades</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-sliders-h"></i> Aplicar filtros
                </button>
              </form>
            </aside>

            {/* Resultados */}
            <div>
              <div className="catalog-topbar">
                <div className="flex" style={{ gap: 'var(--space-md)', alignItems: 'center' }}>
                  <button className="btn btn-sm btn-outline d-lg-none" id="toggleFilters" type="button">
                    <i className="fas fa-sliders-h"></i> Filtros
                  </button>
                  <span className="catalog-count"><strong>{total}</strong> producto(s)</span>
                </div>
                <div className="flex" style={{ gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <form method="GET" action="/catalogo" className="flex" style={{ gap: 'var(--space-sm)', alignItems: 'center' }} id="sortForm">
                    {Object.entries(actuales)
                      .filter(([k, v]) => k !== 'orden' && v !== '')
                      .map(([k, v]) => (
                        <input type="hidden" name={k} value={v} key={k} />
                      ))}
                    <label htmlFor="sortOrder" className="filter-group-title" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Ordenar:</label>
                    <select name="orden" id="sortOrder" className="catalog-sort" defaultValue={filtros.orden}>
                      <option value="recientes">Más recientes</option>
                      <option value="precio_asc">Precio: menor a mayor</option>
                      <option value="precio_desc">Precio: mayor a menor</option>
                      <option value="nombre_asc">Nombre A-Z</option>
                    </select>
                  </form>
                </div>
              </div>

              {hayFiltros ? (
                <div className="flex flex-wrap" style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                  {filtros.q ? (
                    <span className="badge" style={chip}>
                      <i className="fas fa-search"></i> "{filtros.q}"
                      <a href={`/catalogo${qs(actuales, ['q'])}`} style={{ color: 'var(--color-gray)' }}>&times;</a>
                    </span>
                  ) : null}
                  {filtros.cat ? (
                    <span className="badge" style={chip}>
                      <i className="fas fa-tag"></i> {catActivaNombre || filtros.cat}
                      <a href={`/catalogo${qs(actuales, ['cat'])}`} style={{ color: 'var(--color-gray)' }}>&times;</a>
                    </span>
                  ) : null}
                  {tallasSel.map((t) => (
                    <span className="badge" style={chip} key={t}>
                      Talla {t}
                      <a href={`/catalogo${qs({ ...actuales, talla: tallasSel.filter((x) => x !== t).join(',') })}`} style={{ color: 'var(--color-gray)' }}>&times;</a>
                    </span>
                  ))}
                  <a href="/catalogo" className="badge" style={{ ...chip, background: 'var(--color-dark)', color: 'var(--color-white)' }}>
                    <i className="fas fa-times-circle"></i> Limpiar todo
                  </a>
                </div>
              ) : null}

              {productos.length ? (
                <>
                  <div className="products-grid">
                    {productos.map((p) => (
                      <ProductCard key={p.id} producto={p} wa={waMsg} />
                    ))}
                  </div>

                  {ultima > 1 ? (
                    <div className="flex-center" style={{ marginTop: 'var(--space-3xl)', gap: 'var(--space-sm)' }}>
                      {pagina > 1 ? (
                        <a href={`/catalogo${qs({ ...actuales, page: pagina - 1 })}`} className="btn btn-sm btn-outline">
                          <i className="fas fa-chevron-left"></i> Anterior
                        </a>
                      ) : (
                        <span className="btn btn-sm btn-outline" style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}>
                          <i className="fas fa-chevron-left"></i> Anterior
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-gray)', padding: '0 var(--space-sm)' }}>
                        Página {pagina} de {ultima}
                      </span>
                      {pagina < ultima ? (
                        <a href={`/catalogo${qs({ ...actuales, page: pagina + 1 })}`} className="btn btn-sm btn-outline">
                          Siguiente <i className="fas fa-chevron-right"></i>
                        </a>
                      ) : (
                        <span className="btn btn-sm btn-outline" style={{ opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }}>
                          Siguiente <i className="fas fa-chevron-right"></i>
                        </span>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-box-open"></i>
                  <h3>No encontramos productos</h3>
                  <p>Intenta ajustando los filtros o realizando una nueva búsqueda.</p>
                  <a href="/catalogo" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                    <i className="fas fa-undo-alt"></i> Limpiar filtros
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <script src="/assets/js/catalog.js" defer></script>
    </>
  );
}
