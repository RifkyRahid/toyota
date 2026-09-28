import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

// Tipe minimal yang diperlukan dari SiteSetting
interface SiteSettingData {
  dealershipName: string;
  dealershipAddress: string;
  salesWhatsapp: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
}

// Fallback jika fetch gagal
const DEFAULT_SETTINGS: SiteSettingData = {
  dealershipName: 'Agung Toyota Batam',
  dealershipAddress: 'Batam, Kepulauan Riau',
  salesWhatsapp: '6281200000000',
  headerLogoUrl: '/images/toyota-logo.webp',
  footerLogoUrl: '/images/toyota-logo-white.webp',
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
};

async function getSiteSettings(): Promise<SiteSettingData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings`, {
      cache: 'force-cache',
      next: { tags: ['site-settings'] },
    });
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = await res.json();
    return data as SiteSettingData;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

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
