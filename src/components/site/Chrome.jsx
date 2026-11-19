import { getClient } from '@/lib/session';
import { tarifas, whatsappLink } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';

const IG = 'https://www.instagram.com/bella.soul2024?igsh=YnBuN2piZnlpMWF1&utm_source=qr';
const FB = 'https://www.facebook.com/bella.soul.2024';
const TT = 'https://tiktok.com/@bellaguevaraperez';

export async function PromoBar() {
  const [t, wa] = await Promise.all([tarifas(), whatsappLink()]);
  return (
    <div className="promo-bar" id="promoBar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>
          <i className="fas fa-truck" style={{ color: 'var(--color-primary)', marginRight: '0.3rem' }}></i>
          {t.gratisDesde > 0 ? `Envío gratis en compras desde ${formatPrecio(t.gratisDesde)}` : 'Envíos a todo el Perú'}
        </p>
        <div className="promo-socials">
          <a href={wa} target="_blank" rel="noopener noreferrer" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
          <a href={IG} target="_blank" rel="noopener noreferrer" title="Instagram"><i className="fab fa-instagram"></i></a>
          <a href={FB} target="_blank" rel="noopener noreferrer" title="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href={TT} target="_blank" rel="noopener noreferrer" title="TikTok"><i className="fab fa-tiktok"></i></a>
        </div>
      </div>
    </div>
  );
}

export function SearchBar() {
  return (
    <div
      id="searchBar"
      className="search-bar"
      style={{
        display: 'none',
        position: 'fixed',
        top: 'calc(72px + 36px)',
        left: 0,
        right: 0,
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-beige-d)',
        padding: '1rem 2rem',
        zIndex: 999,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <form action="/catalogo" method="GET" style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
        <input
          type="text"
          name="q"
          placeholder="Buscar productos..."
          autoComplete="off"
          id="searchInput"
          style={{
            width: '100%',
            padding: '0.8rem 3rem 0.8rem 1.2rem',
            border: '1.5px solid var(--color-beige-d)',
            borderRadius: 'var(--radius-full)',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '1.1rem' }}
        >
          <i className="fas fa-search"></i>
        </button>
      </form>
    </div>
  );
}

export async function MobileNav() {
  const [cliente, wa] = await Promise.all([getClient(), whatsappLink()]);
  return (
    <>
      <div className="mobile-nav" id="mobileNav">
        <a href="/"><i className="fas fa-home"></i> Inicio</a>
        <a href="/catalogo"><i className="fas fa-th-large"></i> Catálogo</a>
        <a href="/sobre-nosotras"><i className="fas fa-heart"></i> Nosotras</a>
        <a href="/envios-entregas"><i className="fas fa-truck"></i> Envíos</a>
        {cliente ? (
          <>
            <a href="/mi-cuenta"><i className="fas fa-user"></i> Mi cuenta</a>
            <a href="/logout" style={{ color: 'var(--color-danger)' }}><i className="fas fa-sign-out-alt"></i> Cerrar sesión</a>
          </>
        ) : (
          <a href="/login"><i className="fas fa-sign-in-alt"></i> Iniciar sesión</a>
        )}
        <a href={wa} target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i> WhatsApp</a>
        <a href="/carrito"><i className="fas fa-shopping-bag"></i> Carrito</a>
      </div>
      <div
        id="navOverlay"
        data-action="close-mobile-nav"
        style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }}
      ></div>
    </>
  );
}

export function TrustBanner() {
  const items = [
    ['fas fa-truck', 'Envío a todo el país', 'Desde Moyobamba, rápido y seguro'],
    ['fab fa-whatsapp', 'Atención por WhatsApp', 'Respuesta rápida y personalizada'],
    ['fas fa-award', 'Calidad garantizada', 'Prendas seleccionadas con cuidado'],
    ['fas fa-shield-halved', 'Compra segura', 'Yape, Plin, transferencia o contraentrega'],
  ];
  return (
    <section className="trust-banner">
      <div className="container">
        <div className="trust-grid">
          {items.map(([icono, titulo, texto]) => (
            <div className="trust-item animate-on-scroll" key={titulo}>
              <div className="trust-icon"><i className={icono}></i></div>
              <div>
                <h4>{titulo}</h4>
                <p>{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function Footer() {
  const wa = await whatsappLink();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="nav-logo">BELLA<span>.</span>SOUL</a>
            <p>Moda femenina moderna, cómoda y elegante para mujeres que desean verse bien en cada ocasión. Vestidos, blusas, tops y prendas seleccionadas con estilo y dedicación.</p>
            <div className="footer-socials">
              <a href={IG} target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram"><i className="fab fa-instagram"></i></a>
              <a href={FB} target="_blank" rel="noopener noreferrer" className="social-btn" title="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href={TT} target="_blank" rel="noopener noreferrer" className="social-btn" title="TikTok"><i className="fab fa-tiktok"></i></a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="social-btn" title="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="/catalogo">Todo el catálogo</a></li>
              <li><a href="/catalogo?cat=vestidos-largos">Vestidos largos</a></li>
              <li><a href="/catalogo?cat=vestidos-cortos">Vestidos cortos</a></li>
              <li><a href="/catalogo?cat=blusas">Blusas</a></li>
              <li><a href="/catalogo?cat=tops">Tops</a></li>
              <li><a href="/catalogo?ocasion=elegante">Ropa elegante</a></li>
              <li><a href="/catalogo?cat=prendas-basicas">Prendas básicas</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Información</h4>
            <ul>
              <li><a href="/sobre-nosotras">Sobre nosotras</a></li>
              <li><a href="/envios-entregas">Envíos y devoluciones</a></li>
              <li><a href="/envios-entregas#devoluciones">Devoluciones</a></li>
              <li><a href="/login">Mi cuenta</a></li>
              <li><a href="/carrito">Mi carrito</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><a href={wa} target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" style={{ marginRight: 6, color: '#25D366' }}></i>WhatsApp</a></li>
              <li><a href={IG} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" style={{ marginRight: 6, color: '#E1306C' }}></i>Instagram</a></li>
              <li><a href={FB} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook" style={{ marginRight: 6, color: '#1877F2' }}></i>Facebook</a></li>
              <li><a href={TT} target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok" style={{ marginRight: 6 }}></i>TikTok</a></li>
              <li><a href="mailto:bellasoul2024@gmail.com"><i className="fas fa-envelope" style={{ marginRight: 6, color: 'var(--color-primary)' }}></i>Email</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <p>© {year} bella.soul2024 · Todos los derechos reservados · Sorito, Moyobamba, San Martín</p>
          <p>Hecho con <i className="fas fa-heart" style={{ color: 'var(--color-secondary)' }}></i> para la moda femenina</p>
        </div>
      </div>
    </footer>
  );
}

export async function WhatsAppFloat() {
  const wa = await whatsappLink('Hola, estoy interesada en un producto de bella.soul2024 ¿Podrían ayudarme?');
  return (
    <a href={wa} target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Escríbenos por WhatsApp">
      <i className="fab fa-whatsapp"></i>
      <span className="whatsapp-status">En línea</span>
    </a>
  );
}

export function ProductModalShell() {
  return (
    <div className="modal-overlay" id="productModal" role="dialog" aria-modal="true">
      <div className="modal-content" id="modalContent">
        <button className="modal-close" data-action="close-modal" type="button" aria-label="Cerrar">
          <i className="fas fa-times"></i>
        </button>
        <div id="modalBody" className="modal-body"></div>
      </div>
    </div>
  );
}
