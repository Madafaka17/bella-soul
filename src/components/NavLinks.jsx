'use client';

import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', texto: 'Inicio' },
  { href: '/catalogo', texto: 'Catálogo' },
  { href: '/sobre-nosotras', texto: 'Nosotras' },
  { href: '/envios-entregas', texto: 'Envíos' },
];

export default function NavLinks() {
  const ruta = usePathname();
  return (
    <>
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} className={ruta === l.href ? 'active' : ''}>
          {l.texto}
        </a>
      ))}
    </>
  );
}
