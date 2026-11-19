import { notFound } from 'next/navigation';
import ProductCard from '@/components/site/ProductCard';
import { productoActivo, productosRelacionados } from '@/lib/data';
import { whatsappLink, whatsappNumero } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await productoActivo(id);
  return { title: p ? `${p.nombre} — bella.soul2024` : 'Producto — bella.soul2024', description: p?.descripcion_corta || undefined };
}

export default async function Producto({ params }) {
  const { id } = await params;
  const p = await productoActivo(id);
  if (!p) notFound();

  const [relacionados, wa, numero] = await Promise.all([
    productosRelacionados(p, 4),
    whatsappLink(`Hola, quiero consultar sobre: ${p.nombre}`),
    whatsappNumero(),
  ]);
  const waMsg = (m) => `https://wa.me/${numero}?text=${encodeURIComponent(m)}`;

  const imagenes = [p.imagen, p.imagen2, p.imagen3].filter(Boolean);
  const tallaInicial = p.tallas[0]?.talla || 'Única';
  const colorInicial = p.colores[0]?.color || '';
  const agotado = p.stock <= 0;

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <a href="/">Inicio</a>
          <span className="separator">&gt;</span>
          <a href={`/catalogo?cat=${p.categoria_slug}`}>{p.categoria_nombre}</a>
          <span className="separator">&gt;</span>
          <span className="current">{p.nombre}</span>
        </div>
      </div>

      <section className="product-detail section">
        <div className="container">
          <div className="product-detail-grid">
            <div className="product-gallery">
              <div className="main-image">
                <img src={imgUrl(p.imagen)} alt={p.nombre} id="mainProductImage" />
              </div>
              <div className="thumbnails">
                {imagenes.map((img, i) => (
                  <div
                    key={img}
                    className={`thumbnail ${i === 0 ? 'active' : ''}`}
                    data-action="swap-image"
                    data-src={imgUrl(img)}
                    data-target="mainProductImage"
                  >
                    <img src={imgUrl(img)} alt={p.nombre} />
                  </div>
                ))}
              </div>
            </div>

            <div className="product-info">
              <p className="product-category">{p.categoria_nombre}</p>
              <h1 className="product-title">{p.nombre}</h1>

              <div className="product-price">
                {p.tiene_oferta ? (
                  <>
                    <span className="price-old">{formatPrecio(p.precio)}</span>
                    <span className="price-new">{formatPrecio(p.precio_oferta)}</span>
                    <span className="discount-badge">-{p.descuento}%</span>
                  </>
                ) : (
                  <span className="price-current">{formatPrecio(p.precio)}</span>
                )}
              </div>

              <p className="product-description">{p.descripcion}</p>

              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">Material:</span>
                  <span className="detail-value">{p.material}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cuidados:</span>
                  <span className="detail-value">{p.recomendaciones}</span>
                </div>
              </div>

              {agotado ? (
                <p className="stock-info out-of-stock"><i className="fas fa-times-circle"></i> Agotado</p>
              ) : (
                <p className="stock-info in-stock"><i className="fas fa-check-circle"></i> En stock</p>
              )}

              <div className="product-selectors">
                <div className="selector-group">
                  <label>Talla</label>
                  <div className="size-selector" id="tallaSelector">
                    {p.tallas.length ? (
                      p.tallas.map((t, i) => (
                        <button
                          type="button"
                          key={t.id}
                          className={`size-option ${i === 0 ? 'selected' : ''} ${t.stock <= 0 ? 'agotada' : ''}`}
                          data-talla={t.talla}
                        >
                          {t.talla}
                        </button>
                      ))
                    ) : (
                      <span className="size-option selected" data-talla="Única">Única</span>
                    )}
                  </div>
                  <input type="hidden" id="tallaSeleccionada" defaultValue={tallaInicial} />
                </div>

                <div className="selector-group">
                  <label>Color</label>
                  <div className="color-selector" id="colorSelector">
                    {p.colores.length ? (
                      p.colores.map((c, i) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`color-swatch ${i === 0 ? 'selected' : ''}`}
                          data-color={c.color}
                          style={{ background: c.codigo_hex || '#ccc' }}
                          title={c.color}
                        ></button>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Único color</span>
                    )}
                  </div>
                  <input type="hidden" id="colorSeleccionado" defaultValue={colorInicial} />
                  <span id="colorNombre" style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginLeft: 'var(--space-sm)' }}>
                    {colorInicial}
                  </span>
                </div>
              </div>

              <div className="quantity-control">
                <label>Cantidad</label>
                <div className="qty-control">
                  <button className="qty-btn" data-action="minus" type="button">−</button>
                  <span className="qty-num" data-max={p.stock || 99}>1</span>
                  <button className="qty-btn" data-action="plus" type="button">+</button>
                </div>
              </div>

              <div className="product-actions">
                <button
                  className="btn btn-primary btn-add-cart"
                  data-action="add-to-cart-detail"
                  data-id={p.id}
                  data-scope=".quantity-control"
                  type="button"
                  disabled={agotado}
                  style={agotado ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  <i className="fas fa-shopping-bag"></i> Añadir al Carrito
                </button>
                <a href={wa} target="_blank" className="btn btn-whatsapp" rel="noopener noreferrer">
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="related-products section">
          <div className="container">
            <h2 className="section-title">Productos Relacionados</h2>
            <div className="products-grid">
              {relacionados.map((r) => (
                <ProductCard key={r.id} producto={r} wa={waMsg} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
