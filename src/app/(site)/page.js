import ProductCard from '@/components/site/ProductCard';
import { categoriasActivas, productosDestacados, productosNuevos } from '@/lib/data';
import { tarifas, whatsappLink, whatsappNumero } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';

export const metadata = {
  title: 'bella.soul2024 — Moda Femenina para Cada Ocasión',
  description:
    'Descubre vestidos largos, blusas, tops y prendas femeninas modernas en bella.soul2024. Moda con estilo, comodidad y elegancia.',
};

const ICONOS = {
  'vestidos-largos': 'fa-person-dress',
  'vestidos-cortos': 'fa-vest',
  blusas: 'fa-shirt',
  tops: 'fa-star',
  'ropa-casual': 'fa-sun',
  'ropa-elegante': 'fa-gem',
  'prendas-basicas': 'fa-heart',
};

export default async function Inicio() {
  const [categorias, destacados, nuevos, t, wa, numero] = await Promise.all([
    categoriasActivas(),
    productosDestacados(8),
    productosNuevos(4),
    tarifas(),
    whatsappLink(),
    whatsappNumero(),
  ]);
  const waMsg = (m) => `https://wa.me/${numero}?text=${encodeURIComponent(m)}`;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/assets/img/hero_fashion.png" alt="bella.soul2024 Moda Femenina" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">Nueva Colección</div>
          <h1>
            Moda femenina <br />
            para cada <em>ocasión</em>
          </h1>
          <p className="hero-subtitle">
            Descubre prendas diseñadas para realzar tu belleza natural. Elegancia, comodidad y tendencia en cada costura.
          </p>
          <div className="hero-cta">
            <a href="/catalogo" className="btn btn-gold btn-lg">
              <i className="fas fa-arrow-right"></i> Explorar catálogo
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
              <i className="fab fa-whatsapp"></i> Consultar
            </a>
          </div>
        </div>
        <div className="hero-badge">
          <span>
            Nueva
            <br />
            Colección
            <br />
            2024
          </span>
        </div>
      </section>

      {/* Categorías */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Categorías</span>
            <h2 className="section-title">Explora por categoría</h2>
            <p className="section-subtitle">Encuentra lo que buscas entre nuestras colecciones diseñadas para ti</p>
          </div>
          <div className="categories-grid">
            {categorias.length ? (
              categorias.map((cat) => (
                <a key={cat.id} href={`/catalogo?cat=${cat.slug}`} className="category-card">
                  <div className="category-icon">
                    <i className={`fas ${ICONOS[cat.slug] || cat.icono || 'fa-tag'}`}></i>
                  </div>
                  <span>{cat.nombre}</span>
                </a>
              ))
            ) : (
              <div className="text-center py-4" style={{ gridColumn: '1/-1' }}>
                <p className="color-gray">No hay categorías disponibles.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="text-center">
              <span className="label-gold">Destacados</span>
              <h2 className="section-title">Productos destacados</h2>
              <p className="section-subtitle">Los favoritos de nuestra comunidad, seleccionados especialmente para ti</p>
            </div>
            <div className="products-grid">
              {destacados.map((p) => (
                <ProductCard key={p.id} producto={p} wa={waMsg} />
              ))}
            </div>
            <div className="text-center mt-xl">
              <a href="/catalogo" className="btn btn-outline">
                Ver todo el catálogo <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Por qué elegirnos</span>
            <h2 className="section-title">Una experiencia de compra única</h2>
            <p className="section-subtitle">Pensamos en cada detalle para que disfrutes tu experiencia con nosotras</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card animate-on-scroll">
              <div className="benefit-icon"><i className="fas fa-truck"></i></div>
              <h3>Envío a todo el país</h3>
              <p>
                Enviamos desde Sorito, Moyobamba a todo el Perú con entregas rápidas y seguras.
                {t.gratisDesde > 0 ? ` Envío gratis en compras desde ${formatPrecio(t.gratisDesde)}.` : ''}
              </p>
            </div>
            <div className="benefit-card animate-on-scroll">
              <div className="benefit-icon"><i className="fas fa-rotate-left"></i></div>
              <h3>Cambios sin complicaciones</h3>
              <p>Dispones de 3 días hábiles para solicitar cambios. Tu satisfacción es nuestra prioridad.</p>
            </div>
            <div className="benefit-card animate-on-scroll">
              <div className="benefit-icon"><i className="fas fa-gem"></i></div>
              <h3>Calidad seleccionada</h3>
              <p>Cada prenda es elegida cuidadosamente con los mejores materiales y acabados para ti.</p>
            </div>
            <div className="benefit-card animate-on-scroll">
              <div className="benefit-icon"><i className="fas fa-shield-halved"></i></div>
              <h3>Compra segura</h3>
              <p>Paga con total confianza vía Yape, Plin, transferencia bancaria o contraentrega.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre nosotras */}
      <section className="section section-dark">
        <div className="container">
          <div className="about-grid">
            <div className="animate-on-scroll">
              <span className="label-gold" style={{ color: 'var(--color-primary)' }}>Sobre nosotras</span>
              <h2 className="section-title" style={{ color: 'var(--color-white)' }}>
                Elegancia que inspira,
                <br />
                moda que transforma
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 'var(--space-xl)', fontSize: '0.95rem' }}>
                En bella.soul2024 creemos que cada mujer merece sentirse única y especial. Seleccionamos cuidadosamente cada prenda pensando en ti, combinando tendencias globales con un toque de distinción.
              </p>
              <div className="hero-cta">
                <a href="/sobre-nosotras" className="btn btn-gold">
                  Conocer más <i className="fas fa-arrow-right"></i>
                </a>
                <a href="/catalogo" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--color-white)' }}>
                  Ver colección
                </a>
              </div>
            </div>
            <div className="animate-on-scroll">
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--color-beige-d)', boxShadow: 'var(--shadow-xl)' }}>
                <img src="/assets/img/vestido_largo_marron.png" alt="Sobre bella.soul2024" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuevos ingresos */}
      {nuevos.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex-between flex-wrap" style={{ marginBottom: 'var(--space-2xl)' }}>
              <div>
                <span className="label-gold">Novedades</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Nuevos ingresos</h2>
              </div>
              <a href="/catalogo?novedad=1" className="btn btn-outline">
                Ver todo <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="products-grid">
              {nuevos.map((p) => (
                <ProductCard key={p.id} producto={p} wa={waMsg} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonios */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Testimonios</span>
            <h2 className="section-title">Lo que dicen nuestras clientas</h2>
            <p className="section-subtitle">La opinión de quienes ya confían en nosotras</p>
          </div>
          <div className="testimonials-grid">
            {[
              ['MC', 'María C.', 'Los vestidos son preciosos, la tela es de muy buena calidad y la entrega fue súper rápida. Definitivamente volveré a comprar.'],
              ['AL', 'Andrea L.', 'Me encantó la atención personalizada por WhatsApp. Me ayudaron a elegir la talla correcta y el vestido me quedó perfecto.'],
              ['VP', 'Valentina P.', 'La relación calidad-precio es increíble. Las blusas son hermosas y se ven exactamente como en las fotos. Muy recomendadas.'],
            ].map(([ini, nombre, texto]) => (
              <div className="testimonial-card animate-on-scroll" key={ini}>
                <p className="testimonial-text">"{texto}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{ini}</div>
                  <div>
                    <div className="testimonial-name">{nombre}</div>
                    <div className="testimonial-role">Cliente verificada</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <h2>Recibe las últimas tendencias</h2>
          <p>Suscríbete y entérate primero de nuevas colecciones, ofertas exclusivas y consejos de moda.</p>
          <form className="newsletter-form" action="#" method="get">
            <input type="email" placeholder="Tu correo electrónico" required />
            <button type="submit">
              Suscribirme <i className="fas fa-paper-plane" style={{ marginLeft: '0.4rem' }}></i>
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>¿Lista para renovar tu estilo?</h2>
          <p>Descubre una colección pensada para mujeres como tú, que buscan destacar con elegancia.</p>
          <a href="/catalogo" className="btn btn-gold btn-lg">
            Comprar ahora <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </section>

      {/* Contacto */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Contacto</span>
            <h2 className="section-title">Estamos para ti</h2>
            <p className="section-subtitle">Respondemos en menos de 24 horas. ¡Escríbenos!</p>
          </div>
          <div className="contact-grid">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="contact-item">
              <div className="contact-icon whatsapp"><i className="fab fa-whatsapp"></i></div>
              <div className="contact-info">
                <h4>WhatsApp</h4>
                <p>Atención personalizada, responde rápido</p>
              </div>
            </a>
            <a href="https://www.instagram.com/bella.soul2024?igsh=YnBuN2piZnlpMWF1&utm_source=qr" target="_blank" rel="noopener noreferrer" className="contact-item">
              <div className="contact-icon instagram"><i className="fab fa-instagram"></i></div>
              <div className="contact-info">
                <h4>Instagram</h4>
                <p>@bella.soul2024 — Síguenos</p>
              </div>
            </a>
            <a href="mailto:bellasoul2024@gmail.com" className="contact-item">
              <div className="contact-icon email"><i className="fas fa-envelope"></i></div>
              <div className="contact-info">
                <h4>Email</h4>
                <p>bellasoul2024@gmail.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
