export const metadata = {
  robots: { index: false, follow: false },
};

/** Layout mínimo (sin menú de la tienda): boleta imprimible y login del admin */
export default function BareLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/estilos.css" />
        <link rel="stylesheet" href="/assets/css/admin.css" />
      </head>
      <body className="admin-body">{children}</body>
    </html>
  );
}
