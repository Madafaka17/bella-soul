// Pestañas "Iniciar sesión" / "Crear cuenta"
(function () {
  function cambiar(tab) {
    document.querySelectorAll('.tab-auth').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.auth-panel').forEach(function (p) { p.style.display = 'none'; });
    if (tab === 'login') {
      document.getElementById('loginTabBtn').classList.add('active');
      document.getElementById('loginForm').style.display = '';
    } else {
      document.getElementById('registerTabBtn').classList.add('active');
      document.getElementById('registerForm').style.display = '';
    }
  }
  document.querySelectorAll('.tab-auth').forEach(function (btn) {
    btn.addEventListener('click', function () { cambiar(btn.dataset.tab); });
  });
})();
