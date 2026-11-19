import { redirect } from 'next/navigation';
import Alertas from '@/components/Alertas';
import { getClient } from '@/lib/session';
import { leerFlash } from '@/lib/http';
import { rutaInterna } from '@/lib/clave';

export const metadata = { title: 'Iniciar Sesión — bella.soul2024' };

const err = { color: 'var(--color-danger)', marginTop: 4, display: 'block', fontSize: '0.8rem' };
const tarjeta = { padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-white)', border: '1px solid var(--color-beige-d)' };
const tab = { flex: 1, padding: 'var(--space-md) 0', background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gray)', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', letterSpacing: '0.02em' };

export default async function Login({ searchParams }) {
  if (await getClient()) redirect('/mi-cuenta');

  const sp = await searchParams;
  const flash = await leerFlash();
  const old = flash.old || {};
  const mostrarRegistro = sp.registro === '1';
  const destino = rutaInterna(Array.isArray(sp.redirect) ? sp.redirect[0] : sp.redirect, '');

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + var(--promo-height) + var(--space-3xl))', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
            <a href="/" className="nav-logo" style={{ fontSize: '1.8rem', display: 'inline-block', marginBottom: 'var(--space-md)' }}>
              BELLA<span>.</span>SOUL
            </a>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem' }}>Ingresa o crea tu cuenta para continuar</p>
          </div>

          <div className="flex" style={{ borderBottom: '1.5px solid var(--color-beige-d)', marginBottom: 'var(--space-xl)' }}>
            <button type="button" className={`tab-auth ${mostrarRegistro ? '' : 'active'}`} data-tab="login" id="loginTabBtn" style={tab}>
              Iniciar sesión
            </button>
            <button type="button" className={`tab-auth ${mostrarRegistro ? 'active' : ''}`} data-tab="register" id="registerTabBtn" style={tab}>
              Crear cuenta
            </button>
          </div>

          <Alertas estilo={{ marginBottom: 'var(--space-lg)' }} />

          {/* Ingresar */}
          <div id="loginForm" className="auth-panel" style={mostrarRegistro ? { display: 'none' } : undefined}>
            <div className="form-card" style={tarjeta}>
              <form method="POST" action="/api/login">
                {destino ? <input type="hidden" name="redirect" value={destino} /> : null}
                <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <input type="email" name="email" id="email" className="form-input" defaultValue={mostrarRegistro ? '' : old.email || ''} required autoFocus={!mostrarRegistro} />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input type="password" name="password" id="password" className="form-input" required />
                </div>
                <div className="flex" style={{ marginBottom: 'var(--space-lg)' }}>
                  <label className="filter-check" style={{ fontSize: '0.85rem' }}>
                    <input type="checkbox" name="remember" id="remember" />
                    <span>Recordarme</span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-sign-in-alt"></i> Ingresar
                </button>
              </form>
            </div>
          </div>

          {/* Crear cuenta */}
          <div id="registerForm" className="auth-panel" style={mostrarRegistro ? undefined : { display: 'none' }}>
            <div className="form-card" style={tarjeta}>
              <form method="POST" action="/api/registro">
                <div className="form-grid" style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label htmlFor="nombres" className="form-label">Nombres</label>
                    <input type="text" name="nombres" id="nombres" className="form-input" defaultValue={old.nombres || ''} required maxLength={100} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apellidos" className="form-label">Apellidos</label>
                    <input type="text" name="apellidos" id="apellidos" className="form-input" defaultValue={old.apellidos || ''} required maxLength={100} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                  <label htmlFor="register_email" className="form-label">Correo electrónico</label>
                  <input type="email" name="email" id="register_email" className="form-input" defaultValue={mostrarRegistro ? old.email || '' : ''} required />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                  <label htmlFor="telefono" className="form-label">Teléfono</label>
                  <input type="tel" name="telefono" id="telefono" className="form-input" defaultValue={old.telefono || ''} maxLength={20} />
                </div>
                <div className="form-grid" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div className="form-group">
                    <label htmlFor="register_password" className="form-label">Contraseña</label>
                    <input type="password" name="password" id="register_password" className="form-input" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password_confirmation" className="form-label">Confirmar contraseña</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" className="form-input" required minLength={6} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-user-plus"></i> Crear cuenta
                </button>
              </form>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: 'var(--space-xl)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>
              ¿Prefieres comprar sin crear cuenta?
              <br />
              <a href="/catalogo" style={{ color: 'var(--color-primary-d)', fontWeight: 600 }}>
                Explora el catálogo directamente <i className="fas fa-arrow-right" style={{ marginLeft: '0.3rem' }}></i>
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .tab-auth::after{content:'';position:absolute;bottom:-1.5px;left:0;width:0;height:2.5px;background:var(--color-dark);transition:var(--transition);border-radius:2px 2px 0 0}
        .tab-auth.active{color:var(--color-dark)!important}
        .tab-auth.active::after{width:100%}
        .tab-auth:hover{color:var(--color-dark)!important}
      `}</style>
      <script src="/assets/js/auth-tabs.js" defer></script>
    </section>
  );
}
