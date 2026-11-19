// Formulario de producto: tallas/colores dinámicos, vista previa y compresión de imágenes
(function () {
  var sizeBox = document.getElementById('size-rows');
  var colorBox = document.getElementById('color-rows');
  if (!sizeBox || !colorBox) return;

  // ---------- Filas dinámicas ----------
  function actualizarBorrar(caja, clase) {
    var filas = caja.querySelectorAll('.' + clase);
    filas.forEach(function (f) {
      f.querySelector('.pf-del').classList.toggle('off', filas.length === 1);
    });
  }

  function enlazar(fila, caja, clase) {
    fila.querySelector('.pf-del').addEventListener('click', function () {
      fila.remove();
      actualizarBorrar(caja, clase);
    });
    var picker = fila.querySelector('input[type=color]');
    if (picker) {
      picker.addEventListener('input', function () {
        fila.querySelector('code').textContent = picker.value;
      });
    }
  }

  var sizeIndex = sizeBox.querySelectorAll('.size-row').length;
  var colorIndex = colorBox.querySelectorAll('.color-row').length;

  sizeBox.querySelectorAll('.size-row').forEach(function (r) { enlazar(r, sizeBox, 'size-row'); });
  colorBox.querySelectorAll('.color-row').forEach(function (r) { enlazar(r, colorBox, 'color-row'); });

  document.getElementById('add-size').addEventListener('click', function () {
    var fila = document.createElement('div');
    fila.className = 'pf-row size-row';
    fila.innerHTML =
      '<input type="text" name="tallas[' + sizeIndex + '][talla]" class="pf-input" placeholder="S, M, L..." maxlength="10">' +
      '<input type="number" min="0" name="tallas[' + sizeIndex + '][stock]" class="pf-input" placeholder="0" value="0">' +
      '<button type="button" class="pf-del remove-size" title="Quitar talla"><i class="fas fa-trash-alt"></i></button>';
    sizeBox.appendChild(fila);
    sizeIndex++;
    enlazar(fila, sizeBox, 'size-row');
    actualizarBorrar(sizeBox, 'size-row');
    fila.querySelector('input').focus();
  });

  document.getElementById('add-color').addEventListener('click', function () {
    var fila = document.createElement('div');
    fila.className = 'pf-row color-row';
    fila.innerHTML =
      '<input type="text" name="colores[' + colorIndex + '][color]" class="pf-input" placeholder="Ej: Rosa palo" maxlength="50">' +
      '<div class="pf-color-pick"><input type="color" name="colores[' + colorIndex + '][hex]" value="#ffffff"><code>#ffffff</code></div>' +
      '<button type="button" class="pf-del remove-color" title="Quitar color"><i class="fas fa-trash-alt"></i></button>';
    colorBox.appendChild(fila);
    colorIndex++;
    enlazar(fila, colorBox, 'color-row');
    actualizarBorrar(colorBox, 'color-row');
    fila.querySelector('input').focus();
  });

  actualizarBorrar(sizeBox, 'size-row');
  actualizarBorrar(colorBox, 'color-row');

  // ---------- Imágenes: vista previa + compresión ----------
  // Vercel limita el cuerpo de la petición a ~4.5 MB; se reducen las fotos grandes antes de enviarlas.
  var MAX_LADO = 1600;
  var UMBRAL = 900 * 1024;

  function comprimir(archivo) {
    return new Promise(function (resolve) {
      if (archivo.size <= UMBRAL || !/^image\/(jpeg|png|webp)$/.test(archivo.type)) return resolve(archivo);
      var img = new Image();
      var url = URL.createObjectURL(archivo);
      img.onload = function () {
        var escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          function (blob) {
            URL.revokeObjectURL(url);
            if (!blob || blob.size >= archivo.size) return resolve(archivo);
            var nombre = archivo.name.replace(/\.[^.]+$/, '') + '.jpg';
            resolve(new File([blob], nombre, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(archivo); };
      img.src = url;
    });
  }

  document.querySelectorAll('.pf-drop input[type=file]').forEach(function (input) {
    input.addEventListener('change', function () {
      var caja = input.closest('.pf-drop');
      var archivo = input.files && input.files[0];
      if (!archivo) return;

      comprimir(archivo).then(function (final) {
        if (final !== archivo) {
          var dt = new DataTransfer();
          dt.items.add(final);
          input.files = dt.files;
        }
        var img = caja.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.alt = '';
          caja.appendChild(img);
        }
        img.src = URL.createObjectURL(final);
        caja.classList.add('has-img');
      });
    });
  });
})();
