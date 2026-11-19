// Catálogo: filtros que se aplican solos, tallas, precio y orden
(function () {
  // Botones de talla: se atienden en la fase de captura para no chocar con script.js
  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target.closest('.filter-size-grid .size-btn');
      if (!btn) return;
      e.stopPropagation();
      e.preventDefault();
      btn.classList.toggle('active');
      var activos = document.querySelectorAll('.filter-size-grid .size-btn.active');
      var valores = Array.prototype.map.call(activos, function (b) {
        return b.textContent.trim();
      });
      document.getElementById('tallaInput').value = valores.join(',');
      document.getElementById('filterForm').submit();
    },
    true
  );

  function iniciar() {
    var rango = document.getElementById('priceRange');
    var etiqueta = document.getElementById('priceDisplay');
    if (rango && etiqueta) {
      rango.addEventListener('input', function () {
        etiqueta.textContent = 'S/' + Number(rango.value).toLocaleString('es-PE');
      });
      // Aplica el filtro al soltar el control
      rango.addEventListener('change', function () {
        document.getElementById('filterForm').submit();
      });
    }

    var alternar = document.getElementById('toggleFilters');
    if (alternar) {
      alternar.addEventListener('click', function () {
        var lateral = document.querySelector('.filters-sidebar');
        if (lateral) lateral.classList.toggle('mobile-open');
      });
    }

    document.querySelectorAll('.filter-check input').forEach(function (input) {
      input.addEventListener('change', function () {
        document.getElementById('filterForm').submit();
      });
    });

    var orden = document.getElementById('sortOrder');
    if (orden) {
      orden.addEventListener('change', function () {
        document.getElementById('sortForm').submit();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
