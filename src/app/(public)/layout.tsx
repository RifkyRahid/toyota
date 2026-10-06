import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import { getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar
        salesWhatsapp={settings.salesWhatsapp}
        logoUrl={settings.headerLogoUrl}
      />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
      <FloatingWhatsApp salesWhatsapp={settings.salesWhatsapp} />
      <Toaster richColors position="top-right" />
    </>
  );
}
