import Alertas from '@/components/Alertas';
import { fechaLargaLima } from '@/lib/format';
import { getAdmin } from '@/lib/session';

/**
 * Envoltorio de cada página del panel: cabecera con título + avisos + contenido.
 * (El menú lateral vive en el layout.)
 */
export default async function AdminShell({ titulo, children }) {
  const admin = await getAdmin();
  const nombre = admin?.nombre || 'Administrador';

  return (
    <>
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="admin-menu-btn" id="sidebarToggle" type="button" aria-label="Abrir menú">
            <i className="fas fa-bars"></i>
          </button>
          <div>
            <h2 className="admin-page-title">{titulo}</h2>
            <div className="admin-crumb">bella.soul2024 · Panel administrativo</div>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-date"><i className="far fa-calendar"></i> {fechaLargaLima()}</span>
          <div className="admin-avatar" title={nombre}>{nombre.charAt(0).toUpperCase()}</div>
        </div>
      </header>
      <div className="admin-content">
        <Alertas />
        {children}
      </div>
    </>
  );
}
