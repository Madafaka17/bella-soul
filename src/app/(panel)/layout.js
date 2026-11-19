import { requireAdmin } from '@/lib/admin';
import AdminNav from '@/components/admin/AdminNav';

export const metadata = {
  title: { default: 'Panel — bella.soul2024', template: '%s — bella.soul2024' },
  robots: { index: false, follow: false },
};

/** Layout del panel administrativo (exige sesión de admin) */
export default async function PanelLayout({ children }) {
  const admin = await requireAdmin();

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
      <body className="admin-body" suppressHydrationWarning>
        <div className="admin-layout">
          <aside className="admin-sidebar" id="adminSidebar">
            <div className="admin-sidebar-logo">
              <div className="nav-logo">BELLA<span>.</span>SOUL</div>
              <small>Panel administrativo</small>
            </div>
            <nav className="admin-nav">
              <AdminNav />
              <div className="nav-spacer"></div>
              <a href="/admin/logout" className="nav-danger">
                <i className="fas fa-sign-out-alt"></i> <span>Cerrar sesión</span>
              </a>
            </nav>
            <div className="admin-userbox">
              <div className="admin-avatar">{admin.nombre.charAt(0).toUpperCase()}</div>
              <div>
                <strong>{admin.nombre}</strong>
                <small>{admin.rol}</small>
              </div>
            </div>
          </aside>
          <div className="admin-overlay" id="adminOverlay"></div>
          <div className="admin-main">{children}</div>
        </div>
        <script src="/assets/js/admin.js" defer></script>
      </body>
    </html>
  );
}
