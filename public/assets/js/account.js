// Mi cuenta: pestañas
(function () {
  document.querySelectorAll('.tab-link').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tab-link').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
})();
