import { imgUrl } from '@/lib/imagenes';

export const OCASIONES = [
  ['casual', 'Casual'],
  ['formal', 'Formal'],
  ['elegante', 'Elegante'],
  ['fiesta', 'Fiesta'],
  ['playa', 'Playa'],
  ['deporte', 'Deporte'],
  ['invierno', 'Invierno'],
  ['verano', 'Verano'],
  ['diario', 'Diario'],
  ['basico', 'Básico'],
  ['trabajo', 'Trabajo'],
];

/**
 * Formulario de producto (crear / editar).
 * `producto` = null al crear. `old` = valores del intento anterior si hubo un error.
 */
export default function ProductForm({ producto, categorias, old = {} }) {
  const editando = !!producto;
  const val = (campo, def = '') => (old[campo] !== undefined ? old[campo] : producto?.[campo] ?? def);
  const marcado = (campo) => (old[campo] !== undefined ? old[campo] === '1' : !!producto?.[campo]);

  const tallas = producto?.tallas?.length ? producto.tallas : [{ talla: '', stock: 0 }];
  const colores = producto?.colores?.length ? producto.colores : [{ color: '', codigo_hex: '#ffffff' }];

  const accion = editando ? `/api/admin/productos/${producto.id}` : '/api/admin/productos';

  return (
    <form className="pf-wrap" action={accion} method="POST" encType="multipart/form-data" id="productForm">
      <div className="pf-layout">
        {/* ============ COLUMNA PRINCIPAL ============ */}
        <div className="pf-main">
          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-tag"></i>
              <h3>Información básica<small>Nombre, categoría y descripción del producto</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c3">
                <label htmlFor="f-nombre">Nombre <span className="req">*</span></label>
                <input id="f-nombre" type="text" name="nombre" className="pf-input" placeholder="Ej: Vestido floral midi" defaultValue={val('nombre')} required maxLength={200} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="f-categoria">Categoría <span className="req">*</span></label>
                <select id="f-categoria" name="categoria_id" className="pf-select" defaultValue={String(val('categoria_id'))} required>
                  <option value="">Seleccionar</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label htmlFor="f-corta">Descripción corta</label>
                <input id="f-corta" type="text" name="descripcion_corta" className="pf-input" placeholder="Una frase que resuma el producto" defaultValue={val('descripcion_corta')} maxLength={300} />
              </div>
              <div className="pf-field">
                <label htmlFor="f-desc">Descripción</label>
                <textarea id="f-desc" name="descripcion" className="pf-textarea" rows={4} placeholder="Detalles, corte, estilo..." defaultValue={val('descripcion')}></textarea>
              </div>
              <div className="pf-field c3">
                <label htmlFor="f-material">Material</label>
                <input id="f-material" type="text" name="material" className="pf-input" placeholder="Ej: 100% algodón" defaultValue={val('material')} maxLength={100} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="f-ocasion">Ocasión <span className="req">*</span></label>
                <select id="f-ocasion" name="ocasion" className="pf-select" defaultValue={String(val('ocasion', 'casual'))} required>
                  {OCASIONES.map(([v, n]) => (
                    <option key={v} value={v}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label htmlFor="f-reco">Recomendaciones de cuidado</label>
                <input id="f-reco" type="text" name="recomendaciones" className="pf-input" placeholder="Ej: Lavar a mano, no usar blanqueador" defaultValue={val('recomendaciones')} />
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-coins"></i>
              <h3>Precio e inventario<small>Precio de venta, oferta y stock general</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c2">
                <label htmlFor="f-precio">Precio <span className="req">*</span></label>
                <div className="pf-money"><span>S/</span><input id="f-precio" type="number" step="0.01" min="0" name="precio" className="pf-input" placeholder="0.00" defaultValue={val('precio')} required /></div>
              </div>
              <div className="pf-field c2">
                <label htmlFor="f-oferta">Precio oferta</label>
                <div className="pf-money"><span>S/</span><input id="f-oferta" type="number" step="0.01" min="0" name="precio_oferta" className="pf-input" placeholder="0.00" defaultValue={Number(val('precio_oferta')) > 0 ? val('precio_oferta') : ''} /></div>
                <span className="hint">Déjalo vacío si no hay oferta</span>
              </div>
              <div className="pf-field c2">
                <label htmlFor="f-stock">Stock general</label>
                <input id="f-stock" type="number" min="0" name="stock" className="pf-input" defaultValue={val('stock', 0)} />
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-ruler"></i>
              <h3>Tallas y stock por talla<small>Agrega cada talla disponible con su cantidad</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-rows" id="size-rows">
                <div className="pf-row pf-row-head"><span>Talla</span><span>Stock</span><span></span></div>
                {tallas.map((t, i) => (
                  <div className="pf-row size-row" key={i}>
                    <input type="text" name={`tallas[${i}][talla]`} className="pf-input" placeholder="S, M, L..." defaultValue={t.talla} maxLength={10} />
                    <input type="number" min="0" name={`tallas[${i}][stock]`} className="pf-input" placeholder="0" defaultValue={t.stock ?? 0} />
                    <button type="button" className={`pf-del remove-size ${i === 0 && tallas.length === 1 ? 'off' : ''}`} title="Quitar talla"><i className="fas fa-trash-alt"></i></button>
                  </div>
                ))}
              </div>
              <button type="button" id="add-size" className="pf-add"><i className="fas fa-plus"></i> Agregar talla</button>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-palette"></i>
              <h3>Colores<small>Nombre y tono de cada color disponible</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-rows" id="color-rows">
                <div className="pf-row pf-row-head"><span>Color</span><span>Tono</span><span></span></div>
                {colores.map((c, i) => (
                  <div className="pf-row color-row" key={i}>
                    <input type="text" name={`colores[${i}][color]`} className="pf-input" placeholder="Ej: Rosa palo" defaultValue={c.color} maxLength={50} />
                    <div className="pf-color-pick">
                      <input type="color" name={`colores[${i}][hex]`} defaultValue={c.codigo_hex || '#ffffff'} />
                      <code>{c.codigo_hex || '#ffffff'}</code>
                    </div>
                    <button type="button" className={`pf-del remove-color ${i === 0 && colores.length === 1 ? 'off' : ''}`} title="Quitar color"><i className="fas fa-trash-alt"></i></button>
                  </div>
                ))}
              </div>
              <button type="button" id="add-color" className="pf-add"><i className="fas fa-plus"></i> Agregar color</button>
            </div>
          </section>
        </div>

        {/* ============ COLUMNA LATERAL ============ */}
        <aside className="pf-side">
          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-images"></i>
              <h3>Imágenes<small>Haz clic en un recuadro para elegir</small></h3>
            </header>
            <div className="pf-card-body" style={{ display: 'flex', flexDirection: 'column' }}>
              <label className={`pf-drop main ${producto?.imagen ? 'has-img' : ''}`}>
                <span className="pf-badge">Principal</span>
                <input type="file" name="imagen" accept="image/jpeg,image/png,image/webp" />
                {producto?.imagen ? <img src={imgUrl(producto.imagen)} alt="" /> : null}
                <span className="pf-drop-empty"><i className="fas fa-cloud-upload-alt"></i>Subir imagen principal</span>
              </label>
              <div className="pf-thumbs">
                {[['imagen2', 'Imagen 2'], ['imagen3', 'Imagen 3']].map(([campo, nombre]) => (
                  <label className={`pf-drop small ${producto?.[campo] ? 'has-img' : ''}`} key={campo}>
                    <input type="file" name={campo} accept="image/jpeg,image/png,image/webp" />
                    {producto?.[campo] ? <img src={imgUrl(producto[campo])} alt="" /> : null}
                    <span className="pf-drop-empty"><i className="fas fa-plus"></i>{nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-star"></i>
              <h3>Visibilidad<small>Dónde se destaca en la tienda</small></h3>
            </header>
            <div className="pf-card-body">
              <label className="pf-switch">
                <span><strong>Destacado</strong><small>Aparece en la sección de destacados</small></span>
                <input type="checkbox" name="destacado" value="1" defaultChecked={marcado('destacado')} />
                <span className="pf-toggle"></span>
              </label>
              <label className="pf-switch">
                <span><strong>Novedad</strong><small>Muestra la etiqueta “Nuevo”</small></span>
                <input type="checkbox" name="novedad" value="1" defaultChecked={marcado('novedad')} />
                <span className="pf-toggle"></span>
              </label>
            </div>
          </section>

          <section className="pf-card">
            <div className="pf-actions">
              <button type="submit" className="pf-btn primary"><i className="fas fa-save"></i> {editando ? 'Actualizar producto' : 'Guardar producto'}</button>
              <a href="/admin/productos" className="pf-btn ghost">Cancelar</a>
            </div>
          </section>
        </aside>
      </div>
      <script src="/assets/js/admin-producto.js" defer></script>
    </form>
  );
}
