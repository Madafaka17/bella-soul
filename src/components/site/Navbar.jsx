import NavLinks from '@/components/NavLinks';
import MiniCart from '@/components/site/MiniCart';
import { getClient } from '@/lib/session';
import { leerCarritoCrudo } from '@/lib/cart';
import { whatsappLink } from '@/lib/tienda';

export default async function Navbar() {
  const [cliente, crudo, wa] = await Promise.all([getClient(), leerCarritoCrudo(), whatsappLink()]);
  const total = crudo.reduce((a, i) => a + i.q, 0);

  return (
    <nav className="navbar" id="navbar">
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          BELLA<span>.</span>SOUL
        </a>

        <div className="nav-links">
          <NavLinks />
        </div>

        <div className="nav-actions">
          <button className="nav-icon-btn" id="searchToggle" title="Buscar" type="button">
            <i className="fas fa-search"></i>
          </button>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="nav-icon-btn" title="WhatsApp" style={{ color: '#25D366' }}>
            <i className="fab fa-whatsapp"></i>
          </a>
          {cliente ? (
            <a href="/mi-cuenta" className="nav-icon-btn" title="Mi cuenta" style={{ position: 'relative' }}>
              <i className="fas fa-user"></i>
              <span className="online-dot"></span>
            </a>
          ) : (
            <a href="/login" className="nav-icon-btn" title="Iniciar sesión">
              <i className="fas fa-user"></i>
            </a>
          )}
          <a href="/carrito" className="nav-icon-btn" title="Carrito" id="cartBtn">
            <i className="fas fa-shopping-bag"></i>
            <span className="cart-badge" id="cartBadge" style={total > 0 ? undefined : { display: 'none' }}>
              {total}
            </span>
          </a>
          <div className="mini-cart" id="miniCart">
            <MiniCart />
          </div>
          <button className="nav-hamburger" id="hamburgerBtn" type="button" aria-label="Menú">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
