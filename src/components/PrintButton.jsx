'use client';

export default function PrintButton() {
  return (
    <button className="btn-print" type="button" onClick={() => window.print()}>
      Imprimir Boleta
    </button>
  );
}
