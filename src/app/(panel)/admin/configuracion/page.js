import AdminShell from '@/components/admin/AdminShell';
import { query } from '@/lib/db';
import { leerFlash } from '@/lib/http';

export const metadata = { title: 'Configuración' };
export const dynamic = 'force-dynamic';

export default async function Configuracion() {
  const [filas, flash] = await Promise.all([query('SELECT clave, valor FROM configuracion'), leerFlash()]);
  const cfg = {};
  for (const f of filas) cfg[f.clave] = f.valor;
  const v = (k, def = '') => (flash.old?.[k] !== undefined ? flash.old[k] : cfg[k] ?? def);

  return (
    <AdminShell titulo="Configuración">
      <form className="pf-wrap pf-narrow" method="POST" action="/api/admin/configuracion">
        <div className="pf-main">
          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-store"></i>
              <h3>Información general<small>Datos de contacto que se muestran en la tienda</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c3">
                <label htmlFor="c-nombre">Nombre de la tienda</label>
                <input id="c-nombre" type="text" name="tienda_nombre" className="pf-input" defaultValue={v('tienda_nombre', 'bella.soul2024')} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="c-email">Email de contacto</label>
                <input id="c-email" type="email" name="email_contacto" className="pf-input" placeholder="correo@ejemplo.com" defaultValue={v('email_contacto')} />
              </div>
              <div className="pf-field">
                <label htmlFor="c-dir">Dirección</label>
                <input id="c-dir" type="text" name="direccion" className="pf-input" placeholder="Sorito, Moyobamba, San Martín" defaultValue={v('direccion')} />
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-share-alt"></i>
              <h3>Redes sociales<small>Enlaces completos a tus perfiles</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c2">
                <label htmlFor="c-ig"><i className="fab fa-instagram"></i> Instagram</label>
                <input id="c-ig" type="url" name="instagram_url" className="pf-input" placeholder="https://instagram.com/..." defaultValue={v('instagram_url')} />
              </div>
              <div className="pf-field c2">
                <label htmlFor="c-fb"><i className="fab fa-facebook"></i> Facebook</label>
                <input id="c-fb" type="url" name="facebook_url" className="pf-input" placeholder="https://facebook.com/..." defaultValue={v('facebook_url')} />
              </div>
              <div className="pf-field c2">
                <label htmlFor="c-tt"><i className="fab fa-tiktok"></i> TikTok</label>
                <input id="c-tt" type="url" name="tiktok_url" className="pf-input" placeholder="https://tiktok.com/@..." defaultValue={v('tiktok_url')} />
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fab fa-whatsapp"></i>
              <h3>WhatsApp<small>Número al que escriben tus clientas</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c3">
                <label htmlFor="c-wa">Número (con código de país)</label>
                <input id="c-wa" type="text" name="whatsapp_numero" className="pf-input" placeholder="51999999999" defaultValue={v('whatsapp_numero')} />
                <span className="hint">Solo números, sin espacios ni “+”</span>
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-truck"></i>
              <h3>Envíos<small>El costo se aplica según la ciudad que escribe la clienta al comprar</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-field c2">
                <label htmlFor="c-lima">Envío Moyobamba y alrededores</label>
                <div className="pf-money"><span>S/</span><input id="c-lima" type="number" step="0.01" min="0" name="costo_envio_lima" className="pf-input" defaultValue={v('costo_envio_lima', 8)} /></div>
                <span className="hint">Moyobamba, Soritor, Calzada, Habana, Jepelacio y Yantaló</span>
              </div>
              <div className="pf-field c2">
                <label htmlFor="c-prov">Envío resto del país</label>
                <div className="pf-money"><span>S/</span><input id="c-prov" type="number" step="0.01" min="0" name="costo_envio_provincia" className="pf-input" defaultValue={v('costo_envio_provincia', 15)} /></div>
                <span className="hint">Cualquier otra ciudad</span>
              </div>
              <div className="pf-field c2">
                <label htmlFor="c-gratis">Envío gratis desde</label>
                <div className="pf-money"><span>S/</span><input id="c-gratis" type="number" step="0.01" min="0" name="envio_gratis_minimo" className="pf-input" defaultValue={v('envio_gratis_minimo', 150)} /></div>
                <span className="hint">Compras de este monto o más. 0 = sin envío gratis</span>
              </div>
              <div className="pf-field">
                <span className="hint"><i className="fas fa-info-circle"></i> El recojo en tienda (Sorito, Moyobamba) no tiene costo de envío.</span>
              </div>
            </div>
          </section>

          <section className="pf-card">
            <header className="pf-card-head">
              <i className="fas fa-wallet"></i>
              <h3>Métodos de pago<small>Datos que verá la clienta al pagar</small></h3>
            </header>
            <div className="pf-card-body">
              <div className="pf-group-title">Yape</div>
              <div className="pf-field c3">
                <label htmlFor="c-yn">Nombre</label>
                <input id="c-yn" type="text" name="yape_nombre" className="pf-input" defaultValue={v('yape_nombre')} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="c-ynum">Número</label>
                <input id="c-ynum" type="text" name="yape_numero" className="pf-input" defaultValue={v('yape_numero')} />
              </div>

              <div className="pf-group-title">Plin</div>
              <div className="pf-field c3">
                <label htmlFor="c-pn">Nombre</label>
                <input id="c-pn" type="text" name="plin_nombre" className="pf-input" defaultValue={v('plin_nombre')} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="c-pnum">Número</label>
                <input id="c-pnum" type="text" name="plin_numero" className="pf-input" defaultValue={v('plin_numero')} />
              </div>

              <div className="pf-group-title">Transferencia BCP</div>
              <div className="pf-field c3">
                <label htmlFor="c-bcp">Cuenta</label>
                <input id="c-bcp" type="text" name="bcp_cuenta" className="pf-input" defaultValue={v('bcp_cuenta')} />
              </div>
              <div className="pf-field c3">
                <label htmlFor="c-cci">CCI</label>
                <input id="c-cci" type="text" name="bcp_cci" className="pf-input" defaultValue={v('bcp_cci')} />
              </div>
            </div>
          </section>

          <div className="pf-savebar">
            <span><i className="fas fa-info-circle"></i> Los cambios se aplican a toda la tienda al guardar.</span>
            <button type="submit" className="pf-btn primary"><i className="fas fa-save"></i> Guardar configuración</button>
          </div>
        </div>
      </form>

      <form className="pf-wrap pf-narrow" method="POST" action="/api/admin/clave" style={{ marginTop: '1.5rem' }}>
        <section className="pf-card">
          <header className="pf-card-head">
            <i className="fas fa-key"></i>
            <h3>Cambiar mi contraseña<small>Usa una contraseña larga y que no uses en otros sitios</small></h3>
          </header>
          <div className="pf-card-body">
            <div className="pf-field">
              <label htmlFor="k-actual">Contraseña actual</label>
              <input id="k-actual" type="password" name="actual" className="pf-input" autoComplete="current-password" required />
            </div>
            <div className="pf-field c3">
              <label htmlFor="k-nueva">Nueva contraseña</label>
              <input id="k-nueva" type="password" name="nueva" className="pf-input" autoComplete="new-password" minLength={8} required />
              <span className="hint">Mínimo 8 caracteres</span>
            </div>
            <div className="pf-field c3">
              <label htmlFor="k-confirmar">Repite la nueva contraseña</label>
              <input id="k-confirmar" type="password" name="confirmar" className="pf-input" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="pf-field">
              <button type="submit" className="pf-btn primary" style={{ alignSelf: 'flex-start' }}><i className="fas fa-lock"></i> Actualizar contraseña</button>
            </div>
          </div>
        </section>
      </form>
    </AdminShell>
  );
}
