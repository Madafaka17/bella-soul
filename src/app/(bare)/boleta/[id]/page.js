import { notFound } from 'next/navigation';
import { pedidoConDetalle, puedeVerPedido } from '@/lib/pedidos';
import { formatPrecio, fechaHora } from '@/lib/format';
import PrintButton from '@/components/PrintButton';

export const metadata = { title: 'Boleta — bella.soul2024' };

const css = `
  .receipt-page{font-family:Arial,sans-serif;font-size:14px;color:#333;padding:40px;background:#fff;min-height:100vh}
  .receipt{max-width:800px;margin:0 auto}
  .receipt-header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #333}
  .receipt-header h1{font-size:24px;margin-bottom:5px}
  .receipt-header p{color:#666}
  .receipt-section{margin-bottom:25px}
  .receipt-section h3{margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #ddd;font-size:16px}
  .receipt-section p{margin:4px 0}
  .receipt-table{width:100%;border-collapse:collapse;margin-bottom:20px}
  .receipt-table th,.receipt-table td{padding:10px;text-align:left;border-bottom:1px solid #ddd}
  .receipt-table th{background:#f5f5f5;font-weight:600}
  .receipt-table td:last-child,.receipt-table th:last-child{text-align:right}
  .totals{margin-top:20px;text-align:right}
  .totals p{margin:5px 0}
  .totals .grand-total{font-size:18px;font-weight:700;margin-top:10px;padding-top:10px;border-top:2px solid #333}
  .btn-print{display:inline-block;margin-top:30px;padding:12px 30px;background:#333;color:#fff;border:none;cursor:pointer;font-size:16px}
  .btn-print:hover{background:#555}
  @media print{.btn-print{display:none}}
`;

export default async function Boleta({ params }) {
  const { id } = await params;
  const pedido = await pedidoConDetalle(id);
  if (!pedido || !(await puedeVerPedido(pedido))) notFound();

  return (
    <div className="receipt-page">
      <style>{css}</style>
      <div className="receipt">
        <div className="receipt-header">
          <h1>bella.soul2024</h1>
          <p>Boleta de Venta</p>
        </div>

        <div className="receipt-section">
          <h3>Datos del Pedido</h3>
          <p><strong>N° Boleta:</strong> {pedido.numero_pedido}</p>
          <p><strong>Fecha:</strong> {fechaHora(pedido.created_at)}</p>
        </div>

        <div className="receipt-section">
          <h3>Datos del Cliente</h3>
          <p><strong>Nombre:</strong> {pedido.nombre_cliente}</p>
          <p><strong>Teléfono:</strong> {pedido.celular}</p>
          <p><strong>Dirección:</strong> {pedido.direccion_envio}</p>
        </div>

        <div className="receipt-section">
          <h3>Productos</h3>
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.detalle.map((d) => (
                <tr key={d.id}>
                  <td>{d.nombre_producto}</td>
                  <td>{d.talla || '-'}</td>
                  <td>{d.color || '-'}</td>
                  <td>{d.cantidad}</td>
                  <td>{formatPrecio(d.precio_unitario)}</td>
                  <td>{formatPrecio(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <p><strong>Subtotal:</strong> {formatPrecio(pedido.subtotal)}</p>
          <p><strong>Envío:</strong> {formatPrecio(pedido.costo_envio)}</p>
          <p className="grand-total"><strong>Total:</strong> {formatPrecio(pedido.total)}</p>
        </div>

        <div className="receipt-section">
          <h3>Método de Pago</h3>
          <p style={{ textTransform: 'capitalize' }}>{pedido.metodo_pago || 'Transferencia Bancaria'}</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
