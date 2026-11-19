import Script from 'next/script';
import { PromoBar, SearchBar, MobileNav, TrustBanner, Footer, WhatsAppFloat, ProductModalShell } from '@/components/site/Chrome';
import Navbar from '@/components/site/Navbar';

export const metadata = {
  title: { default: 'bella.soul2024 — Moda Femenina para Cada Ocasión', template: '%s' },
  description:
    'bella.soul2024 — Moda femenina moderna para cada ocasión. Vestidos, blusas, tops y prendas seleccionadas con estilo, calidad y dedicación.',
  keywords: 'moda femenina, vestidos, blusas, tops, ropa mujer, bella soul 2024',
  openGraph: { type: 'website', images: ['/assets/img/og-image.png'] },
};

export const viewport = { themeColor: '#1A1A1A' };

export default function SiteLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/estilos.css" />
        <style>{`body.has-fade{opacity:0;transition:opacity .3s ease}body.has-fade.loaded{opacity:1}`}</style>
        <noscript>
          <style>{`body.has-fade{opacity:1}`}</style>
        </noscript>
      </head>
      <body className="has-fade" suppressHydrationWarning>
        <PromoBar />
        <Navbar />
        <SearchBar />
        <MobileNav />
        <div className="toast-container" id="toastContainer"></div>

        <main>{children}</main>

        <TrustBanner />
        <Footer />
        <WhatsAppFloat />
        <ProductModalShell />

        <Script src="/assets/js/script.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
