import { tarifas, whatsappLink } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';

export const metadata = {
  title: 'Envíos y Entregas — bella.soul2024',
  description:
    'Conoce los costos, tiempos de envío y políticas de cambios y devoluciones de bella.soul2024. Tienda ubicada en Sorito, Moyobamba, San Martín, con envíos a todo el Perú.',
};

const PASOS = [
  ['1', 'Contáctanos por WhatsApp', 'Escríbenos indicando tu número de pedido y la prenda que deseas cambiar.'],
  ['2', 'Coordina el envío de vuelta', 'El costo de envío para el cambio corre por cuenta del cliente. Te indicaremos la dirección y los pasos a seguir.'],
  ['3', 'Recibe tu nueva prenda', 'Una vez recibamos el producto y verifiquemos su estado, te enviaremos la nueva prenda a la brevedad.'],
];

const TALLAS = [
  ['XS', '80-84', '60-64', '86-90', '58-60'],
  ['S', '85-89', '65-69', '91-95', '60-62'],
  ['M', '90-94', '70-74', '96-100', '62-64'],
  ['L', '95-99', '75-79', '101-105', '64-66'],
  ['XL', '100-104', '80-84', '106-110', '66-68'],
];

export default async function Envios() {
  const [t, waCambio, waTallas] = await Promise.all([
    tarifas(),
    whatsappLink('Hola, quiero solicitar un cambio'),
    whatsappLink('Hola, necesito ayuda con las tallas'),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="shipping-hero">
        <div className="container">
          <div className="breadcrumb" style={{ justifyContent: 'center' }}>
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span className="current">Envíos y Entregas</span>
          </div>
          <h1>Envíos y Entregas</h1>
          <p>Todo lo que necesitas saber sobre nuestros envíos, cambios y devoluciones. Estamos aquí para brindarte la mejor experiencia.</p>
          <p style={{ marginTop: 'var(--space-md)', fontWeight: 600, color: 'var(--color-primary-d)' }}>
            <i className="fas fa-location-dot"></i> Nuestra tienda está en Sorito, Moyobamba · San Martín
          </p>
        </div>
      </section>

      {/* Costos */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Costos de envío</span>
            <h2 className="section-title">Recibe tu pedido donde estés</h2>
            <p className="section-subtitle">
              Despachamos desde Sorito, Moyobamba (San Martín) a todo el Perú, con la rapidez y seguridad que mereces
            </p>
          </div>
          <div className="shipping-cards-grid">
            <div className="shipping-card-modern animate-on-scroll">
              <div className="shipping-card-icon"><i className="fas fa-location-dot"></i></div>
              <h3>Moyobamba y alrededores</h3>
              <div className="shipping-price">{formatPrecio(t.local)}</div>
              <p>
                Entrega en 1 a 3 días hábiles desde nuestra tienda en Sorito.
                {t.gratisDesde > 0 ? ` Envío gratis en compras desde ${formatPrecio(t.gratisDesde)}.` : ''}
              </p>
            </div>
            <div className="shipping-card-modern featured animate-on-scroll">
              <div className="shipping-card-icon"><i className="fas fa-gift"></i></div>
              <h3>Envío Gratis</h3>
              <div className="shipping-price">{formatPrecio(0)}</div>
              <p>
                {t.gratisDesde > 0
                  ? `Para compras desde ${formatPrecio(t.gratisDesde)}. Válido para todo el Perú. Aprovecha esta oferta.`
                  : 'Consulta nuestras promociones de envío gratis.'}
              </p>
            </div>
            <div className="shipping-card-modern animate-on-scroll">
              <div className="shipping-card-icon"><i className="fas fa-truck-fast"></i></div>
              <h3>Resto del país</h3>
              <div className="shipping-price">{formatPrecio(t.nacional)}</div>
              <p>Entrega en 3 a 7 días hábiles vía agencia de confianza con número de seguimiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detalles */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Información importante</span>
            <h2 className="section-title">Detalles que debes conocer</h2>
            <p className="section-subtitle">Para que tu experiencia de compra sea transparente y sin sorpresas</p>
          </div>
          <div className="shipping-details-grid">
            <div className="shipping-detail-card animate-on-scroll">
              <div className="shipping-detail-icon" style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366' }}>
                <i className="fas fa-box"></i>
              </div>
              <div className="shipping-detail-text">
                <h4>Proceso de envío</h4>
                <p>Una vez confirmado tu pago, procesamos tu pedido en un máximo de 24 horas. Recibirás un número de seguimiento para que puedas monitorear tu entrega en tiempo real.</p>
              </div>
            </div>
            <div className="shipping-detail-card animate-on-scroll">
              <div className="shipping-detail-icon" style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--color-primary-d)' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className="shipping-detail-text">
                <h4>Tiempos de entrega</h4>
                <p>Moyobamba y alrededores: 1-3 días hábiles. Resto del país: 3-7 días hábiles. Recojo en tienda (Sorito, Moyobamba): sin costo de envío. Los tiempos pueden variar según la demanda y la ubicación exacta de entrega.</p>
              </div>
            </div>
            <div className="shipping-detail-card animate-on-scroll">
              <div className="shipping-detail-icon" style={{ background: 'rgba(76,175,80,0.15)', color: '#2E7D32' }}>
                <i className="fas fa-rotate-left"></i>
              </div>
              <div className="shipping-detail-text">
                <h4>Cambios</h4>
                <p>Dispones de <strong>3 días hábiles</strong> desde la recepción del producto para solicitar un cambio. Las prendas deben estar en su estado original, sin uso y con etiquetas.</p>
              </div>
            </div>
            <div className="shipping-detail-card animate-on-scroll" id="devoluciones">
              <div className="shipping-detail-icon" style={{ background: 'rgba(229,57,53,0.15)', color: '#C62828' }}>
                <i className="fas fa-undo-alt"></i>
              </div>
              <div className="shipping-detail-text">
                <h4>Devoluciones</h4>
                <p>Aceptamos devoluciones solo por defectos de fabricación. Debes reportarlo dentro de las 24 horas posteriores a la recepción. El costo de envío de cambios corre por cuenta del cliente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de cambios */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div className="animate-on-scroll">
              <span className="label-gold">Proceso de cambios</span>
              <h2>¿Cómo solicitar un cambio?</h2>
              <p>
                Sabemos que a veces la talla o el estilo no es lo que esperabas. Por eso hemos creado un proceso simple y rápido para que puedas cambiar tu prenda sin complicaciones.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-xl)' }}>
                {PASOS.map(([n, titulo, texto]) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-d)', fontSize: '0.9rem' }}>
                      {n}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{titulo}</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', margin: 0 }}>{texto}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'var(--space-xl)' }}>
                <a href={waCambio} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  <i className="fab fa-whatsapp"></i> Solicitar cambio
                </a>
              </div>
            </div>
            <div className="animate-on-scroll">
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--color-beige-d)', boxShadow: 'var(--shadow-lg)' }}>
                <img src="/assets/img/vestido_largo_marron.png" alt="Cambios y devoluciones" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guía de tallas */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center">
            <span className="label-gold">Guía de tallas</span>
            <h2 className="section-title">Encuentra tu talla perfecta</h2>
            <p className="section-subtitle">Consulta nuestra tabla de medidas para elegir la talla que mejor se ajuste a ti</p>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', overflowX: 'auto' }}>
            <table className="size-table-modern">
              <thead>
                <tr>
                  <th>Talla</th>
                  <th>Pecho (cm)</th>
                  <th>Cintura (cm)</th>
                  <th>Cadera (cm)</th>
                  <th>Largo (cm)</th>
                </tr>
              </thead>
              <tbody>
                {TALLAS.map((fila) => (
                  <tr key={fila[0]}>
                    {fila.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center" style={{ marginTop: 'var(--space-xl)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>
              ¿Tienes dudas sobre tu talla?{' '}
              <a href={waTallas} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-d)', fontWeight: 600 }}>
                Escríbenos por WhatsApp
              </a>{' '}
              y te asesoramos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <h2>¿Lista para encontrar tu próxima prenda favorita?</h2>
          <p>Explora nuestro catálogo y descubre la colección que tenemos para ti.</p>
          <a href="/catalogo" className="btn btn-gold btn-lg">
            <i className="fas fa-shopping-bag"></i> Ir al catálogo
          </a>
        </div>
      </section>
    </>
  );
}
