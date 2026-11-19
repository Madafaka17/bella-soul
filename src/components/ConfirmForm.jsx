'use client';

/**
 * Formulario POST que pide confirmación antes de enviarse.
 * Úsalo para acciones como "Vaciar carrito" o "Desactivar producto".
 */
export default function ConfirmForm({ action, mensaje, children, className, style }) {
  return (
    <form
      action={action}
      method="POST"
      className={className}
      style={style}
      onSubmit={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
