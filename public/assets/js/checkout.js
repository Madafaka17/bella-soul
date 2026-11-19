// Checkout: pestañas de pago, opciones de entrega/comprobante y costo de envío según la ciudad.
// (El servidor vuelve a calcular el envío al confirmar el pedido.)
(function () {
  var form = document.getElementById('checkoutForm');
  if (!form) return;

  var T;
  try {
    T = JSON.parse(form.getAttribute('data-checkout'));
  } catch (e) {
    return;
  }

  var ciudadInput = document.getElementById('ciudad');
  var envioEl = document.getElementById('envioValor');
  var totalEl = document.getElementById('totalValor');

  function fmt(n) {
    return T.moneda + ' ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function norm(s) {
    return (s || '').toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function esLocal(c) {
    c = norm(c);
    return c !== '' && T.zonaLocal.some(function (k) { return c.indexOf(k) !== -1; });
  }

  function actualizarEnvio() {
    var sel = form.querySelector('input[name="metodo_entrega"]:checked');
    var retiro = sel && sel.value === 'retiro';
    var ciudad = ciudadInput.value.trim();
    var envio = null;
    if (retiro) envio = 0;
    else if (T.gratisDesde > 0 && T.subtotal >= T.gratisDesde) envio = 0;
    else if (ciudad !== '') envio = esLocal(ciudad) ? T.local : T.nacional;

    envioEl.textContent = envio === null ? 'Indica tu ciudad' : envio > 0 ? fmt(envio) : 'Gratis';
    totalEl.textContent = fmt(T.subtotal + (envio || 0));
  }

  ciudadInput.addEventListener('input', actualizarEnvio);

  // Opciones tipo "chip" (entrega y comprobante)
  form.querySelectorAll('.payment-chip input').forEach(function (radio) {
    radio.addEventListener('change', function () {
      form.querySelectorAll('input[name="' + radio.name + '"]').forEach(function (r) {
        r.closest('.payment-chip').classList.toggle('active', r.checked);
      });
      if (radio.name === 'metodo_entrega') actualizarEnvio();
    });
  });

  // Pestañas de método de pago
  var tabs = form.querySelectorAll('.payment-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener(
      'click',
      function (e) {
        e.stopPropagation();
        tabs.forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.payment-panel').forEach(function (p) { p.classList.add('hidden'); });
        tab.classList.add('active');
        var panel = document.getElementById('panel-' + tab.dataset.method);
        if (panel) panel.classList.remove('hidden');
        document.getElementById('metodo_pago').value = tab.dataset.method;
      },
      true
    );
  });

  actualizarEnvio();
})();
