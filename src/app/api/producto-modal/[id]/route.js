import { productoActivo } from '@/lib/data';
import { whatsappLink } from '@/lib/tienda';
import { formatPrecio } from '@/lib/format';
import { imgUrl } from '@/lib/imagenes';

export const dynamic = 'force-dynamic';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** HTML de la vista rápida de un producto (se inserta en el modal con script.js) */
export async function GET(request, { params }) {
  const { id } = await params;
  const p = await productoActivo(id);
  if (!p) {
    return new Response('<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Producto no encontrado</h3></div>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const wa = await whatsappLink(`Hola, quiero consultar sobre: ${p.nombre}`);
  const imagenes = [p.imagen, p.imagen2, p.imagen3].filter(Boolean);
  const agotado = p.stock <= 0;
  const tallaInicial = p.tallas[0]?.talla || 'Única';
  const colorInicial = p.colores[0]?.color || '';

  const miniaturas = imagenes
    .map(
      (img, i) =>
        `<div class="thumbnail ${i === 0 ? 'active' : ''}" data-action="swap-image" data-src="${esc(imgUrl(img))}" data-target="modalMainImage"><img src="${esc(imgUrl(img))}" alt="${esc(p.nombre)}"></div>`
    )
    .join('');

  const precio = p.tiene_oferta
    ? `<span class="price-old">${formatPrecio(p.precio)}</span><span class="price-new">${formatPrecio(p.precio_oferta)}</span><span class="discount-badge">-${p.descuento}%</span>`
    : `<span class="price-current">${formatPrecio(p.precio)}</span>`;

  const tallas = p.tallas.length
    ? p.tallas
        .map((t, i) => `<button type="button" class="size-option ${i === 0 ? 'selected' : ''} ${t.stock <= 0 ? 'agotada' : ''}" data-talla="${esc(t.talla)}">${esc(t.talla)}</button>`)
        .join('')
    : '<span class="size-option selected" data-talla="Única">Única</span>';

  const colores = p.colores.length
    ? p.colores
        .map((c, i) => `<button type="button" class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${esc(c.color)}" style="background:${esc(c.codigo_hex || '#ccc')}" title="${esc(c.color)}"></button>`)
        .join('')
    : '<span style="font-size:0.85rem;color:var(--color-gray)">Único color</span>';

  const html = `
<div class="modal-product-grid">
  <div class="modal-product-gallery">
    <div class="main-image"><img src="${esc(imgUrl(p.imagen))}" alt="${esc(p.nombre)}" id="modalMainImage"></div>
    <div class="thumbnails">${miniaturas}</div>
  </div>
  <div class="modal-product-info">
    <p class="product-category">${esc(p.categoria_nombre)}</p>
    <h2 class="product-title">${esc(p.nombre)}</h2>
    <div class="product-price">${precio}</div>
    <p class="product-description">${esc(p.descripcion)}</p>
    ${
      agotado
        ? '<p class="stock-info out-of-stock"><i class="fas fa-times-circle"></i> Agotado</p>'
        : '<p class="stock-info in-stock"><i class="fas fa-check-circle"></i> En stock</p>'
    }
    <div class="product-selectors">
      <div class="selector-group">
        <label>Talla</label>
        <div class="size-selector" id="modalTallaSelector">${tallas}</div>
        <input type="hidden" id="tallaSeleccionada" value="${esc(tallaInicial)}">
      </div>
      <div class="selector-group">
        <label>Color</label>
        <div class="color-selector" id="modalColorSelector">${colores}</div>
        <input type="hidden" id="colorSeleccionado" value="${esc(colorInicial)}">
        <span id="colorNombre" style="font-size:0.8rem;color:var(--color-gray);margin-left:var(--space-sm)">${esc(colorInicial)}</span>
      </div>
    </div>
    <div class="quantity-control">
      <label>Cantidad</label>
      <div class="qty-control">
        <button class="qty-btn" data-action="minus" type="button">−</button>
        <span class="qty-num" data-max="${p.stock || 99}">1</span>
        <button class="qty-btn" data-action="plus" type="button">+</button>
      </div>
    </div>
    <div class="product-actions">
      <button class="btn btn-primary btn-add-cart" data-action="add-to-cart-detail" data-id="${p.id}" data-scope="#modalBody" type="button" ${agotado ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
        <i class="fas fa-shopping-bag"></i> Añadir al Carrito
      </button>
      <a href="${esc(wa)}" target="_blank" class="btn btn-whatsapp" rel="noopener noreferrer">Consultar por WhatsApp</a>
    </div>
  </div>
</div>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
