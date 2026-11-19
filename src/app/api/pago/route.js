import { NextResponse } from 'next/server';
import { transaction } from '@/lib/db';
import { guardarCarritoEn, hidratarCarrito, leerCarritoDeRequest, totales } from '@/lib/cart';
import { calcularEnvio, esZonaLocal, tarifas, ZONA_LOCAL_NOMBRE } from '@/lib/tienda';
import { formAObjeto, mismoOrigen, prohibido, redirigir, urlAbs } from '@/lib/http';
import { verificar, COOKIE_CLIENT } from '@/lib/session';
import { recordarPedidoEn, siguienteNumeroBoleta, siguienteNumeroPedido } from '@/lib/pedidos';

export const dynamic = 'force-dynamic';

const METODOS_PAGO = ['yape', 'plin', 'transferencia', 'efectivo', 'contraentrega'];
const METODOS_ENTREGA = ['domicilio', 'retiro'];
const COMPROBANTES = ['boleta', 'factura'];

const texto = (v, max) => String(v ?? '').trim().slice(0, max);

/** POST /api/pago — crea el pedido */
export async function POST(request) {
  if (!mismoOrigen(request)) return prohibido();

  const fd = await request.formData();
  const form = formAObjeto(fd);
  const volver = (mensaje) => redirigir(request, '/pago', { tipo: 'error', texto: mensaje, old: form });

  const crudo = leerCarritoDeRequest(request);
  const items = await hidratarCarrito(crudo);
  if (!items.length) return redirigir(request, '/carrito', { tipo: 'error', texto: 'Tu carrito está vacío.' });

  // ---- Validación ----
  const nombre = texto(form.nombre_cliente, 200);
  const celular = texto(form.celular, 20);
  const ciudad = texto(form.ciudad, 100);
  const direccion = texto(form.direccion_envio, 500);
  const metodoPago = texto(form.metodo_pago, 20);
  const metodoEntrega = texto(form.metodo_entrega, 20) || 'domicilio';
  const comprobante = texto(form.tipo_comprobante, 20) || 'boleta';

  if (!nombre) return volver('Ingresa tu nombre completo.');
  if (!celular) return volver('Ingresa tu número de celular.');
  if (!ciudad) return volver('Indica tu ciudad para calcular el envío.');
  if (!direccion) return volver('Ingresa la dirección de envío.');
  if (!METODOS_PAGO.includes(metodoPago)) return volver('Elige un método de pago.');
  if (!METODOS_ENTREGA.includes(metodoEntrega)) return volver('Elige un método de entrega.');
  if (!COMPROBANTES.includes(comprobante)) return volver('Elige el tipo de comprobante.');

  // Contraentrega solo en Moyobamba y alrededores
  if (metodoPago === 'contraentrega' && !esZonaLocal(ciudad)) {
    return volver(`El pago contraentrega solo está disponible en ${ZONA_LOCAL_NOMBRE}. Elige otro método de pago.`);
  }

  // Stock disponible
  for (const it of items) {
    if (it.stock <= 0) return volver(`"${it.nombre}" se agotó. Quítalo del carrito para continuar.`);
    if (it.cantidad > it.stock) return volver(`Solo quedan ${it.stock} unidades de "${it.nombre}".`);
  }

  // ---- Totales (siempre calculados en el servidor) ----
  const t = await tarifas();
  const { subtotal } = totales(items);
  const costoEnvio = calcularEnvio(subtotal, ciudad, metodoEntrega, t);
  const total = subtotal + costoEnvio;

  // Clienta con sesión
  const tokenCliente = await verificar(request.cookies.get(COOKIE_CLIENT)?.value);
  const clienteId = tokenCliente?.tipo === 'cliente' ? tokenCliente.id : null;

  let pedidoId;
  try {
    pedidoId = await transaction(async (db) => {
      // Reintenta si dos compras generan el mismo número a la vez
      let id = null;
      for (let intento = 0; intento < 3 && !id; intento++) {
        const numeroPedido = await siguienteNumeroPedido(db);
        try {
          const r = await db.exec(
            `INSERT INTO pedidos
              (cliente_id, numero_pedido, nombre_cliente, celular, ciudad, direccion_envio, referencia,
               metodo_pago, metodo_entrega, nota_cliente, subtotal, costo_envio, total, estado, tipo_comprobante, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, NOW(), NOW())`,
            [
              clienteId,
              numeroPedido,
              nombre,
              celular,
              ciudad,
              direccion,
              texto(form.referencia, 500) || null,
              metodoPago,
              metodoEntrega,
              texto(form.nota_cliente, 1000) || null,
              subtotal,
              costoEnvio,
              total,
              comprobante,
            ]
          );
          id = r.insertId;
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
      if (!id) throw new Error('No se pudo generar el número de pedido. Intenta de nuevo.');

      for (const it of items) {
        await db.exec(
          `INSERT INTO detalle_pedido (pedido_id, producto_id, nombre_producto, talla, color, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, it.producto_id, it.nombre, it.talla || null, it.color || null, it.cantidad, it.precio, it.precio * it.cantidad]
        );
        // Descuenta stock solo si alcanza (evita vender de más)
        const upd = await db.exec('UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?', [it.cantidad, it.producto_id, it.cantidad]);
        if (upd.affectedRows === 0) throw new Error(`"${it.nombre}" se agotó mientras comprabas.`);
        if (it.talla) {
          await db.exec('UPDATE producto_tallas SET stock = GREATEST(stock - ?, 0) WHERE producto_id = ? AND talla = ?', [it.cantidad, it.producto_id, it.talla]);
        }
      }

      await db.exec(
        `INSERT INTO pagos (pedido_id, metodo, monto, estado, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [id, metodoPago, total, metodoPago === 'contraentrega' ? 'verificado' : 'pendiente']
      );
      await db.exec(`INSERT INTO ventas (pedido_id, total, fecha_venta, created_at, updated_at) VALUES (?, ?, CURDATE(), NOW(), NOW())`, [id, total]);

      const numeroBoleta = await siguienteNumeroBoleta(db);
      await db.exec(
        `INSERT INTO boletas (pedido_id, numero_boleta, tipo, nombres, celular, direccion_fiscal, subtotal, igv, total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
        [id, numeroBoleta, comprobante, nombre, celular, direccion, subtotal, total]
      );

      return id;
    });
  } catch (e) {
    console.error('[pago] error al crear el pedido:', e);
    return volver(e.message && e.message.includes('agotó') ? e.message : 'No pudimos procesar tu pedido. Intenta de nuevo en unos minutos.');
  }

  const res = NextResponse.redirect(urlAbs(request, `/pago/confirmacion/${pedidoId}`), 303);
  guardarCarritoEn(res, []);
  await recordarPedidoEn(request, res, pedidoId);
  return res;
}
