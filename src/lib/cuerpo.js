/** Lee el cuerpo de una petición, sea JSON o formulario, y lo devuelve como objeto plano */
export async function leerCuerpo(request) {
  const tipo = request.headers.get('content-type') || '';
  try {
    if (tipo.includes('application/json')) {
      const data = await request.json();
      return data && typeof data === 'object' ? data : {};
    }
    const fd = await request.formData();
    const o = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === 'string') o[k] = v;
    }
    return o;
  } catch {
    return {};
  }
}

/** ¿La petición viene de fetch() y espera JSON? */
export function esAjax(request) {
  return (
    request.headers.get('x-requested-with') === 'XMLHttpRequest' ||
    (request.headers.get('accept') || '').includes('application/json')
  );
}
