// Panel admin: menú lateral en celular
(function () {
  var sidebar = document.getElementById('adminSidebar');
  var overlay = document.getElementById('adminOverlay');
  var btn = document.getElementById('sidebarToggle');
  if (!sidebar || !btn) return;

  function alternar(abrir) {
    sidebar.classList.toggle('mobile-open', abrir);
    overlay.classList.toggle('show', abrir);
  }
  btn.addEventListener('click', function () {
    alternar(!sidebar.classList.contains('mobile-open'));
  });
  overlay.addEventListener('click', function () { alternar(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') alternar(false);
  });
})();
