'use client';

import { usePathname } from 'next/navigation';

const GRUPOS = [
  { seccion: 'Principal', items: [{ href: '/admin/dashboard', icono: 'fa-chart-pie', texto: 'Dashboard', activo: (r) => r === '/admin/dashboard' }] },
  {
    seccion: 'Catálogo',
    items: [
      { href: '/admin/productos', icono: 'fa-box', texto: 'Productos', activo: (r) => r.startsWith('/admin/productos') && r !== '/admin/productos/crear' },
      { href: '/admin/productos/crear', icono: 'fa-plus-circle', texto: 'Agregar producto', activo: (r) => r === '/admin/productos/crear' },
    ],
  },
  {
    seccion: 'Ventas',
    items: [
      { href: '/admin/pedidos', icono: 'fa-shopping-bag', texto: 'Pedidos', activo: (r) => r.startsWith('/admin/pedidos') },
      { href: '/admin/ventas', icono: 'fa-chart-line', texto: 'Ventas', activo: (r) => r.startsWith('/admin/ventas') },
      { href: '/admin/pagos', icono: 'fa-money-bill-wave', texto: 'Pagos', activo: (r) => r.startsWith('/admin/pagos') },
      { href: '/admin/boletas', icono: 'fa-receipt', texto: 'Boletas', activo: (r) => r.startsWith('/admin/boletas') },
    ],
  },
  {
    seccion: 'Clientas',
    items: [
      { href: '/admin/clientes', icono: 'fa-users', texto: 'Clientes', activo: (r) => r.startsWith('/admin/clientes') },
      { href: '/admin/consultas', icono: 'fa-envelope', texto: 'Consultas', activo: (r) => r.startsWith('/admin/consultas') },
    ],
  },
  {
    seccion: 'Sistema',
    items: [
      { href: '/admin/configuracion', icono: 'fa-cog', texto: 'Configuración', activo: (r) => r.startsWith('/admin/configuracion') },
      { href: '/', icono: 'fa-external-link-alt', texto: 'Ver tienda', activo: () => false, nuevaPestana: true },
    ],
  },
];

export default function AdminNav() {
  const ruta = usePathname() || '';
  return (
    <>
      {GRUPOS.map((g) => (
        <div key={g.seccion}>
          <div className="admin-nav-section">{g.seccion}</div>
          {g.items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className={i.activo(ruta) ? 'active' : ''}
              {...(i.nuevaPestana ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <i className={`fas ${i.icono}`}></i> <span>{i.texto}</span>
            </a>
          ))}
        </div>
      ))}
    </>
  );
}
