import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/session';
import { leerFlash } from '@/lib/http';
import FlashClear from '@/components/FlashClear';

export const metadata = { title: 'Ingresar — bella.soul2024' };

export default async function AdminLogin() {
  if (await getAdmin()) redirect('/admin/dashboard');
  const flash = await leerFlash();

  return (
    <main className="admin-login-wrap">
      <div className="admin-login-box">
        <div className="admin-login-brand">
          <h1>BELLA<span>.</span>SOUL</h1>
          <p>Panel administrativo</p>
        </div>

        {flash.texto ? (
          <div className="admin-login-err">
            {flash.texto}
            <FlashClear />
          </div>
        ) : null}

        <form method="POST" action="/api/admin/login">
          <div className="lf">
            <label htmlFor="login-email">Correo electrónico</label>
            <div className="iw">
              <i className="far fa-envelope"></i>
              <input id="login-email" type="email" name="email" placeholder="tucorreo@ejemplo.com" defaultValue={flash.old?.email || ''} autoComplete="username" required autoFocus />
            </div>
          </div>

          <div className="lf">
            <label htmlFor="login-pass">Contraseña</label>
            <div className="iw">
              <i className="fas fa-lock"></i>
              <input id="login-pass" type="password" name="password" placeholder="••••••••" autoComplete="current-password" required />
            </div>
          </div>

          <button type="submit" className="go">Ingresar al panel</button>
        </form>

        <div className="admin-login-foot">
          <a href="/"><i className="fas fa-arrow-left"></i> Volver a la tienda</a>
        </div>
      </div>
    </main>
  );
}
