import { whatsappLink } from '@/lib/tienda';

export const metadata = {
  title: 'Sobre Nosotras — bella.soul2024',
  description:
    'Conoce la historia de bella.soul2024, una marca de moda femenina con estilo, calidad y dedicación para mujeres que buscan sentirse únicas y auténticas.',
};

const VALORES = [
  ['fa-gem', 'Calidad', 'Seleccionamos los mejores materiales y acabados para cada prenda, garantizando durabilidad y confort.'],
  ['fa-heart', 'Pasión', 'Cada colección es creada con amor y dedicación, pensando en lo que realmente te hace sentir especial.'],
  ['fa-hand-holding-heart', 'Confianza', 'Tu satisfacción es nuestra prioridad. Trabajamos para que cada experiencia de compra sea inolvidable.'],
  ['fa-star', 'Elegancia', 'Diseños que realzan tu estilo único, combinando tendencia con un toque clásico y sofisticado.'],
  ['fa-feather', 'Comodidad', 'Prendas pensadas para tu día a día, porque la moda no debe sacrificar el bienestar.'],
  ['fa-leaf', 'Sostenibilidad', 'Promovemos un consumo consciente con colecciones atemporales que trascienden las temporadas.'],
];

export default async function SobreNosotras() {
  const wa = await whatsappLink('Hola, quiero información sobre sus productos');

  return (
    <>
      {/* Hero */}
      <section className="about-hero-modern">
        <div className="container">
          <div className="about-hero-text animate-on-scroll">
            <span className="label-gold" style={{ color: 'var(--color-primary)' }}>Sobre nosotras</span>
            <h1>
              Elegancia que inspira,
              <br />
              moda que transforma
            </h1>
            <p>
              Cada prenda cuenta una historia. La tuya. Creemos en el poder de la moda para expresar quien eres y en la importancia de sentirte auténtica, segura y radiante en cada momento.
            </p>
            <div className="hero-cta">
              <a href="/catalogo" className="btn btn-gold">
                <i className="fas fa-arrow-right"></i> Explorar colección
              </a>
            </div>
          </div>
          <div className="about-hero-image animate-on-scroll">
            <div className="img-wrap">
              <img src="/assets/img/hero_fashion.png" alt="bella.soul2024 - Moda femenina" />
            </div>
            <div className="floating-badge">
              <div className="badge-number">+500</div>
              <div className="badge-label">
                Clientas
                <br />
                felices
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div className="animate-on-scroll">
              <span className="label-gold">Nuestra historia</span>
              <h2>Nacimos del deseo de hacerte sentir única</h2>
              <p>
                bella.soul2024 nació de la pasión por la moda femenina y el deseo de ofrecer prendas que combinen estilo, calidad y comodidad para la mujer moderna que busca sentirse auténtica y segura en cada ocasión.
              </p>
              <p>
                Cada pieza es seleccionada cuidadosamente pensando en los detalles que marcan la diferencia. Nos inspiramos en las tendencias actuales para crear looks versátiles que se adapten a tu personalidad única.
              </p>
            </div>
            <div className="animate-on-scroll">
              <div className="highlight-text">
                "La moda es la armadura para sobrevivir a la realidad cotidiana y, sobre todo, para expresar quien eres sin necesidad de palabras."
              </div>
              <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>
                Creemos en una moda consciente, donde cada prenda tiene un propósito: hacerte sentir tan bien por fuera como por dentro. Porque cuando te ves bien, te sientes mejor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Nuestros valores</span>
            <h2 className="section-title">Lo que nos define</h2>
            <p className="section-subtitle">Principios que guían cada decisión y cada prenda que seleccionamos para ti</p>
          </div>
          <div className="about-values-grid">
            {VALORES.map(([icono, titulo, texto]) => (
              <div className="about-value-card animate-on-scroll" key={titulo}>
                <div className="about-value-icon"><i className={`fas ${icono}`}></i></div>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div className="animate-on-scroll">
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '1/1', background: 'var(--color-beige-d)', boxShadow: 'var(--shadow-lg)' }}>
                <img src="/assets/img/vestido_floral.png" alt="Nuestra misión" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="animate-on-scroll">
              <span className="label-gold">Nuestra misión</span>
              <h2>Empoderar a cada mujer a través de la moda</h2>
              <p>
                En bella.soul2024, nuestra misión es ofrecerte mucho más que ropa: queremos brindarte una experiencia de moda que te haga sentir segura, elegante y auténtica en cada etapa de tu vida.
              </p>
              <p>
                Trabajamos incansablemente para seleccionar prendas que se adapten a tu estilo de vida, combinando las últimas tendencias con la comodidad y calidad que mereces. Porque creemos que cada mujer tiene derecho a verse y sentirse increíble.
              </p>
              <div style={{ marginTop: 'var(--space-xl)' }}>
                <a href="/catalogo" className="btn btn-primary">
                  Descubrir colección <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>¿Tienes alguna consulta?</h2>
          <p>Estamos aquí para ayudarte. Escríbenos por WhatsApp y te atenderemos con mucho gusto.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-lg">
            <i className="fab fa-whatsapp"></i> Escríbenos por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
