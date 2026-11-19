export const metadata = { title: 'Página no encontrada — bella.soul2024' };

export default function NoEncontrada() {
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + var(--promo-height) + var(--space-3xl))', minHeight: '70vh' }}>
      <div className="container">
        <div className="empty-state">
          <i className="fas fa-compass"></i>
          <h3>No encontramos lo que buscas</h3>
          <p>Es posible que el enlace haya cambiado o que el producto ya no esté disponible.</p>
          <a href="/catalogo" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
            <i className="fas fa-arrow-right"></i> Ir al catálogo
          </a>
        </div>
      </div>
    </section>
  );
}
