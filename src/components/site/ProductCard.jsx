import { imgUrl } from '@/lib/imagenes';
import { formatPrecio } from '@/lib/format';

/**
 * Tarjeta de producto.
 * Los botones usan data-action; /assets/js/script.js los atiende (vista rápida y agregar).
 */
export default function ProductCard({ producto, wa }) {
  const p = producto;
  const consulta = wa(`Hola, quiero consultar sobre: ${p.nombre}`);

  return (
    <div className="product-card animate-on-scroll">
      <div className="product-img-wrap">
        <a href={`/producto/${p.id}`} style={{ display: 'block' }}>
          <img src={imgUrl(p.imagen)} alt={p.nombre} loading="lazy" />
          {p.novedad ? (
            <div className="product-badges">
              <span className="badge badge-new">Nuevo</span>
            </div>
          ) : null}
          {p.descuento > 0 ? (
            <div className="product-badges" style={{ top: 'auto', bottom: 'var(--space-md)' }}>
              <span className="badge badge-offer">-{p.descuento}%</span>
            </div>
          ) : null}
        </a>
        <div className="product-quick-actions">
          <button className="quick-btn" data-action="quick-view" data-id={p.id} title="Vista rápida" type="button">
            <i className="fas fa-eye"></i>
          </button>
          <a href={consulta} target="_blank" rel="noopener noreferrer" className="quick-btn" title="Consultar">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
      <div className="product-info">
        {p.categoria_nombre ? <span className="product-cat">{p.categoria_nombre}</span> : null}
        <a href={`/producto/${p.id}`} className="product-name">
          {p.nombre}
        </a>
        <div className="product-price">
          {p.tiene_oferta ? (
            <>
              <span className="price-old">{formatPrecio(p.precio)}</span>
              <span className="price-current">{formatPrecio(p.precio_oferta)}</span>
            </>
          ) : (
            <span className="price-current">{formatPrecio(p.precio)}</span>
          )}
        </div>
        <div className="product-actions">
          <button data-action="add-to-cart" data-id={p.id} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} type="button">
            <i className="fas fa-shopping-bag"></i> Agregar
          </button>
          <a href={`/producto/${p.id}`} className="btn btn-outline btn-sm" title="Ver detalle">
            <i className="fas fa-eye"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
