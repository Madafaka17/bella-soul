import { getCarrito, totales } from '@/lib/cart';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';

/** Contenido del carrito desplegable de la barra superior */
export default async function MiniCart() {
  const items = await getCarrito();

  if (!items.length) {
    return (
      <div className="mini-cart-empty">
        <i className="fas fa-shopping-bag"></i>
        <p>Tu carrito está vacío</p>
      </div>
    );
  }

  const { cartCount, subtotal } = totales(items);

  return (
    <>
      <div className="mini-cart-items">
        {items.map((item) => (
          <div className="mini-cart-item" data-key={item.key} key={item.key}>
            <img src={imgUrl(item.imagen)} alt={item.nombre} loading="lazy" />
            <div className="mini-cart-item-info">
              <a href={`/producto/${item.producto_id}`} className="mini-cart-item-name">
                {item.nombre}
              </a>
              <div className="mini-cart-item-meta">
                {item.talla ? <span>Talla: {item.talla}</span> : null}
                {item.color ? <span>Color: {item.color}</span> : null}
              </div>
              <div className="mini-cart-item-price">
                {item.cantidad} x {formatPrecio(item.precio)}
              </div>
            </div>
            <button className="mini-cart-item-remove" data-action="remove-cart-item" data-key={item.key} title="Eliminar" type="button">
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
      <div className="mini-cart-footer">
        <div className="mini-cart-subtotal">
          <span>
            Subtotal ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})
          </span>
          <strong>{formatPrecio(subtotal)}</strong>
        </div>
        <a href="/carrito" className="btn btn-outline btn-sm btn-block">
          <i className="fas fa-shopping-bag"></i> Ver carrito
        </a>
        <a href="/pago" className="btn btn-primary btn-sm btn-block">
          <i className="fas fa-lock"></i> Proceder al pago
        </a>
      </div>
    </>
  );
}
