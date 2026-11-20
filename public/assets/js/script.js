// ============================================================
// bella.soul2024 — script.js
// JavaScript global: navbar, carrito, modales, animaciones
// ============================================================

// Ejecuta `fn` al terminar de cargar el documento (o de inmediato si ya cargó:
// con Next.js el script puede ejecutarse después de DOMContentLoaded).
function onReady(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

onReady(function () {

  // Mostrar body (evita FOUC)
  document.body.classList.add('loaded');

  // -------------------------------------------------------
  // NAVBAR SCROLL
  // -------------------------------------------------------
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // -------------------------------------------------------
  // HAMBURGER MENU
  // -------------------------------------------------------
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const navOverlay = document.getElementById('navOverlay');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        mobileNav.classList.add('open');
        navOverlay.style.display = 'block';
        hamburger.innerHTML = '<span style="transform:rotate(45deg);transform-origin:center;position:relative;top:7px"></span><span style="opacity:0"></span><span style="transform:rotate(-45deg);transform-origin:center;position:relative;top:-7px"></span>';
      }
    });
  }

  // -------------------------------------------------------
  // BARRA DE BÚSQUEDA TOGGLE
  // -------------------------------------------------------
  const searchToggle = document.getElementById('searchToggle');
  const searchBar    = document.getElementById('searchBar');
  const searchInput  = document.getElementById('searchInput');

  if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', () => {
      const visible = searchBar.style.display !== 'none';
      searchBar.style.display = visible ? 'none' : 'block';
      if (!visible && searchInput) searchInput.focus();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (searchBar.style.display !== 'none' &&
          !searchBar.contains(e.target) &&
          !searchToggle.contains(e.target)) {
        searchBar.style.display = 'none';
      }
    });
  }

  // -------------------------------------------------------
  // ANIMACIONES AL SCROLL (Intersection Observer)
  // -------------------------------------------------------
  const animElements = document.querySelectorAll('.animate-on-scroll');
  if (animElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animElements.forEach(el => observer.observe(el));
  }

  // -------------------------------------------------------
  // FILTROS DE TALLAS (catálogo)
  // -------------------------------------------------------
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const group = this.closest('.filter-size-grid');
      if (group) group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      this.classList.toggle('active');
    });
  });

  // -------------------------------------------------------
  // SLIDER DE PRECIO
  // -------------------------------------------------------
  const priceRange = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');
  if (priceRange && priceDisplay) {
    priceRange.addEventListener('input', () => {
      priceDisplay.textContent = 'S/ ' + priceRange.value;
    });
  }

  // -------------------------------------------------------
  // GALERÍA DE PRODUCTO (thumbnails)
  // -------------------------------------------------------
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', function () {
      const mainImg = this.closest('.modal-gallery')?.querySelector('.gallery-main img')
                    || document.querySelector('.gallery-main img');
      if (mainImg && this.querySelector('img')) {
        mainImg.src = this.querySelector('img').src;
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------
  // SELECTOR DE TALLAS (detalle de producto)
  // -------------------------------------------------------
  document.querySelectorAll('.size-option').forEach(opt => {
    if (!opt.classList.contains('agotada')) {
      opt.addEventListener('click', function () {
        const parent = this.closest('.size-selector');
        if (parent) parent.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');

        const hiddenInput = document.getElementById('tallaSeleccionada');
        if (hiddenInput) hiddenInput.value = this.dataset.talla;
      });
    }
  });

  // -------------------------------------------------------
  // SELECTOR DE COLORES (detalle de producto)
  // -------------------------------------------------------
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', function () {
      const parent = this.closest('.color-selector');
      if (parent) parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');

      const hiddenInput = document.getElementById('colorSeleccionado');
      if (hiddenInput) hiddenInput.value = this.dataset.color;

      const display = document.getElementById('colorNombre');
      if (display) display.textContent = this.dataset.color;
    });
  });

  // -------------------------------------------------------
  // CONTROL DE CANTIDAD
  // -------------------------------------------------------
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const wrap  = this.closest('.qty-control');
      const numEl = wrap?.querySelector('.qty-num');
      if (!numEl) return;
      let val = parseInt(numEl.textContent) || 1;
      const max = parseInt(numEl.dataset.max) || 99;

      if (this.dataset.action === 'plus')  val = Math.min(val + 1, max);
      if (this.dataset.action === 'minus') val = Math.max(val - 1, 1);

      numEl.textContent = val;

      const qtyInput = wrap.querySelector('input[name="cantidad"]') || wrap.querySelector('input[type="hidden"]');
      if (qtyInput) qtyInput.value = val;

      updateCartSubtotal();
    });
  });

  // -------------------------------------------------------
  // TABS DE MÉTODO DE PAGO
  // -------------------------------------------------------
  document.querySelectorAll('.payment-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.payment-panel').forEach(p => p.classList.add('hidden'));
      this.classList.add('active');
      const panel = document.getElementById('panel-' + this.dataset.method);
      if (panel) panel.classList.remove('hidden');
      const methodInput = document.getElementById('metodoPago');
      if (methodInput) methodInput.value = this.dataset.method;
    });
  });

  // -------------------------------------------------------
  // FILTER SIDEBAR MOBILE
  // -------------------------------------------------------
  const filterToggle = document.getElementById('filterToggleBtn');
  const filterSidebar = document.querySelector('.filters-sidebar');
  if (filterToggle && filterSidebar) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('mobile-open');
    });
  }

  // -------------------------------------------------------
  // AUTO-CERRAR ALERTS
  // -------------------------------------------------------
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s ease';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // -------------------------------------------------------
  // MINI CART TOGGLE
  // -------------------------------------------------------
  const cartBtn = document.getElementById('cartBtn');
  const miniCart = document.getElementById('miniCart');
  if (cartBtn && miniCart) {
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      miniCart.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (miniCart.classList.contains('open') &&
          !miniCart.contains(e.target) &&
          !cartBtn.contains(e.target)) {
        miniCart.classList.remove('open');
      }
    });

    miniCart.addEventListener('mouseenter', () => clearTimeout(__miniCartCloseTimer));
  }

});

// ============================================================
// FUNCIONES GLOBALES
// ============================================================

function closeMobileNav() {
  const mobileNav   = document.getElementById('mobileNav');
  const navOverlay  = document.getElementById('navOverlay');
  const hamburger   = document.getElementById('hamburgerBtn');
  if (mobileNav) mobileNav.classList.remove('open');
  if (navOverlay) navOverlay.style.display = 'none';
  if (hamburger) hamburger.innerHTML = '<span></span><span></span><span></span>';
}

function openProductModal(productId) {
  const overlay = document.getElementById('productModal');
  const body    = document.getElementById('modalBody');
  if (!overlay || !body) return;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  body.innerHTML = '<div class="flex-center" style="height:400px"><div class="spinner"></div></div>';

  fetch('/api/producto-modal/' + productId)
    .then(r => r.text())
    .then(html => {
      body.innerHTML = html;
      initModalInteractions();
    })
    .catch(() => {
      body.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Error al cargar</h3><p>No se pudo cargar el producto.</p></div>';
    });
}

function closeModal() {
  const overlay = document.getElementById('productModal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  const overlay = document.getElementById('productModal');
  if (overlay && e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function initModalInteractions() {
  document.querySelectorAll('.size-option').forEach(opt => {
    if (!opt.classList.contains('agotada')) {
      opt.addEventListener('click', function () {
        this.closest('.size-selector')?.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        const inp = document.getElementById('tallaSeleccionada');
        if (inp) inp.value = this.dataset.talla;
      });
    }
  });

  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', function () {
      this.closest('.color-selector')?.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
      const inp = document.getElementById('colorSeleccionado');
      if (inp) inp.value = this.dataset.color;
      const disp = document.getElementById('colorNombre');
      if (disp) disp.textContent = this.dataset.color;
    });
  });

  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', function () {
      const mainImg = document.querySelector('.gallery-main img');
      if (mainImg && this.querySelector('img')) {
        mainImg.src = this.querySelector('img').src;
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  document.querySelectorAll('#modalBody .qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const wrap  = this.closest('.qty-control');
      const numEl = wrap?.querySelector('.qty-num');
      if (!numEl) return;
      let val = parseInt(numEl.textContent) || 1;
      const max = parseInt(numEl.dataset.max) || 99;
      if (this.dataset.action === 'plus')  val = Math.min(val + 1, max);
      if (this.dataset.action === 'minus') val = Math.max(val - 1, 1);
      numEl.textContent = val;
    });
  });
}

/**
 * Agrega producto al carrito vía AJAX
 */
function addToCart(productoId, talla, color, cantidad) {
  const data = {
    producto_id: productoId,
    talla: talla || '',
    color: color || '',
    cantidad: cantidad || 1
  };

  const csrf = window.CSRF_TOKEN || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  fetch('/carrito/agregar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrf
    },
    body: JSON.stringify(data)
  })
    .then(r => {
      if (r.status === 419) throw new Error('Tu sesión expiró, recarga la página e intenta de nuevo.');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(res => {
      if (res.success) {
        updateCartBadge(res.cartCount);
        updateMiniCart(res);
        showToast(res.message, 'success');
        openMiniCart();
      } else {
        showToast(res.message || 'Error al agregar al carrito', 'error');
      }
    })
    .catch(err => {
      console.warn('addToCart AJAX failed:', err.message);
      showToast(err.message && err.message.includes('sesión') ? err.message : 'No se pudo agregar el producto. Intenta de nuevo.', 'error');
    });
}

/**
 * Actualiza cantidad en carrito vía AJAX
 */
function updateCart(key, cantidad) {
  const csrf = window.CSRF_TOKEN || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  fetch('/carrito/actualizar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrf
    },
    body: JSON.stringify({ key, cantidad })
  })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(res => {
      if (res.success) {
        updateCartBadge(res.cartCount);
        updateMiniCart(res);
      }
    })
    .catch(() => {});
}

/**
 * Elimina producto del carrito vía AJAX
 */
function removeCartItem(key) {
  const csrf = window.CSRF_TOKEN || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  fetch('/carrito/eliminar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrf
    },
    body: JSON.stringify({ key })
  })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(res => {
      if (res.success) {
        updateCartBadge(res.cartCount);
        updateMiniCart(res);
        showToast('Producto eliminado del carrito', 'info');
      }
    })
    .catch(() => {});
}

/**
 * Actualiza el badge del carrito
 */
function updateCartBadge(count) {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/**
 * Abre el panel del mini-carrito y lo cierra solo tras unos segundos
 */
let __miniCartCloseTimer = null;
function openMiniCart() {
  const miniCart = document.getElementById('miniCart');
  if (!miniCart) return;
  miniCart.classList.add('open');
  clearTimeout(__miniCartCloseTimer);
  __miniCartCloseTimer = setTimeout(() => {
    miniCart.classList.remove('open');
  }, 4000);
}

/**
 * Actualiza el mini-carrito con datos del servidor
 */
function updateMiniCart(data) {
  const miniCart = document.getElementById('miniCart');
  if (!miniCart) return;

  if (data.html) {
    miniCart.innerHTML = data.html;
    return;
  }

  if (!data.cartItems || data.cartItems.length === 0) {
    miniCart.innerHTML = '<div class="mini-cart-empty"><i class="fas fa-shopping-bag"></i><p>Tu carrito está vacío</p></div>';
    return;
  }

  let html = '<div class="mini-cart-items">';
  data.cartItems.forEach(item => {
    html += '<div class="mini-cart-item" data-key="' + item.key + '">';
    html += '<img src="' + item.imagen + '" alt="' + item.nombre + '" loading="lazy">';
    html += '<div class="mini-cart-item-info">';
    html += '<a href="/producto/' + item.producto_id + '" class="mini-cart-item-name">' + item.nombre + '</a>';
    html += '<div class="mini-cart-item-meta">';
    if (item.talla) html += '<span>Talla: ' + item.talla + '</span>';
    if (item.color) html += '<span>Color: ' + item.color + '</span>';
    html += '</div>';
    html += '<div class="mini-cart-item-price">' + item.cantidad + ' x S/ ' + item.precio.toFixed(2) + '</div>';
    html += '</div>';
    html += '<button class="mini-cart-item-remove" onclick="removeCartItem(\'' + item.key + '\')" title="Eliminar"><i class="fas fa-times"></i></button>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div class="mini-cart-footer">';
  html += '<div class="mini-cart-subtotal"><span>Subtotal (' + data.cartCount + ' productos)</span><strong>' + data.cartSubtotalFormatted + '</strong></div>';
  html += '<a href="/carrito" class="btn btn-outline btn-sm btn-block"><i class="fas fa-shopping-bag"></i> Ver carrito</a>';
  html += '<a href="/pago" class="btn btn-primary btn-sm btn-block"><i class="fas fa-lock"></i> Proceder al pago</a>';
  html += '</div>';

  miniCart.innerHTML = html;
}

/**
 * Actualiza subtotal en carrito
 */
function updateCartSubtotal() {
  let subtotal = 0;
  document.querySelectorAll('.cart-item').forEach(item => {
    const precio   = parseFloat(item.dataset.precio || 0);
    const qty      = parseInt(item.querySelector('.qty-num')?.textContent || 1);
    const subtotalEl = item.querySelector('.item-subtotal');
    const itemTotal  = precio * qty;
    if (subtotalEl) subtotalEl.textContent = 'S/ ' + itemTotal.toFixed(2);
    subtotal += itemTotal;
  });

  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl    = document.getElementById('cartTotal');
  const envio      = parseFloat(document.getElementById('costoEnvio')?.textContent?.replace('S/ ', '') || 0);

  if (subtotalEl) subtotalEl.textContent = 'S/ ' + subtotal.toFixed(2);
  if (totalEl)    totalEl.textContent    = 'S/ ' + (subtotal + envio).toFixed(2);
}

/**
 * Muestra un toast / notificación
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

/**
 * Genera enlace de WhatsApp para un producto
 */
function whatsappProducto(nombre, talla, color, cantidad) {
  const t = talla   || 'No especificada';
  const c = color   || 'No especificado';
  const q = cantidad || 1;
  const msg = `Hola, estoy interesada en comprar en bella.soul2024.\nProducto: ${nombre}\nTalla: ${t}\nColor: ${c}\nCantidad: ${q}\n¿Está disponible?`;
  const url = 'https://wa.me/51944888664?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

/**
 * Confirma eliminación en admin
 */
function confirmarEliminar(url, nombre) {
  if (confirm(`¿Estás segura que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
    window.location.href = url;
  }
}

/**
 * Preview de imagen antes de subir
 */
function previewImagen(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}


// ============================================================
// ACCIONES POR data-action (reemplazan los onclick del HTML)
// ============================================================
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-action]');
  if (!el) return;
  var accion = el.dataset.action;

  switch (accion) {
    case 'quick-view':
      e.preventDefault();
      openProductModal(parseInt(el.dataset.id, 10));
      break;

    case 'add-to-cart':
      e.preventDefault();
      addToCart(parseInt(el.dataset.id, 10));
      break;

    case 'add-to-cart-detail': {
      e.preventDefault();
      var alcance = (el.dataset.scope && document.querySelector(el.dataset.scope)) || document;
      var talla = (document.getElementById('tallaSeleccionada') || {}).value || '';
      var color = (document.getElementById('colorSeleccionado') || {}).value || '';
      var numEl = alcance.querySelector('.qty-num');
      var cantidad = parseInt(numEl ? numEl.textContent : '1', 10) || 1;
      addToCart(parseInt(el.dataset.id, 10), talla, color, cantidad);
      break;
    }

    case 'remove-cart-item':
      e.preventDefault();
      removeCartItem(el.dataset.key);
      break;

    case 'close-modal':
      closeModal();
      break;

    case 'close-mobile-nav':
      closeMobileNav();
      break;

    case 'swap-image': {
      var destino = document.getElementById(el.dataset.target);
      if (destino) destino.src = el.dataset.src;
      if (el.parentElement) {
        el.parentElement.querySelectorAll('.thumbnail').forEach(function (t) { t.classList.remove('active'); });
      }
      el.classList.add('active');
      break;
    }
  }
});