import { leerFlash } from '@/lib/http';
import FlashClear from '@/components/FlashClear';

/** Muestra el mensaje flash (éxito / error / info) si existe. */
export default async function Alertas({ estilo }) {
  const { tipo, texto } = await leerFlash();
  if (!texto) return null;
  const clase = tipo === 'success' ? 'alert-success' : tipo === 'error' ? 'alert-error' : 'alert-info';
  const icono = tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  return (
    <>
      <div className={`alert ${clase}`} style={estilo}>
        <i className={`fas ${icono}`}></i> {texto}
      </div>
      <FlashClear />
    </>
  );
}
