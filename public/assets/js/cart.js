// Carrito: cambia cantidades y las guarda en el servidor.
// Se atiende en la fase de captura para no duplicar el manejo de script.js.
(function () {
  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target.closest('.cart-item .qty-btn');
      if (!btn) return;
      e.stopPropagation();
      e.preventDefault();

      var wrap = btn.closest('.qty-control');
      var numEl = wrap.querySelector('.qty-num');
      var val = parseInt(numEl.textContent, 10) || 1;
      var max = parseInt(numEl.dataset.max, 10) || 99;

      if (btn.dataset.action === 'plus') val = Math.min(val + 1, max);
      if (btn.dataset.action === 'minus') val = Math.max(val - 1, 1);
      numEl.textContent = val;

      var plus = wrap.querySelector('[data-action="plus"]');
      if (plus) {
        plus.disabled = val >= max;
        plus.style.opacity = val >= max ? '0.4' : '';
      }

      if (typeof updateCart === 'function') updateCart(btn.dataset.key, val);
      if (typeof updateCartSubtotal === 'function') updateCartSubtotal();
    },
    true
  );
})();
