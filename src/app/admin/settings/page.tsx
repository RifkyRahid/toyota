import { prisma } from '@/lib/prisma';
import SettingsClient from '@/components/admin/SettingsClient';
import type { SiteSetting } from '@/types';
import { getSession } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, session] = await Promise.all([
    prisma.siteSetting.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        dealershipName: 'Agung Toyota Batam',
        dealershipAddress: 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau',
        salesName: 'Sales Representative',
        salesTitle: 'Certified Sales Executive',
        salesPhone: '081200000000',
        salesWhatsapp: '6281200000000',
        salesBio: 'Sales representatif resmi Agung Toyota Batam.',
        salesPhotoUrl: '/images/sales-default.webp',
        headerLogoUrl: '/images/toyota-logo.webp',
        footerLogoUrl: '/images/toyota-logo-white.webp',
        faviconUrl: '/favicon.ico',
        pricelistPdfUrl: '',
      },
    }),
    getSession(),
  ]);

  const serializedSettings: SiteSetting = {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  };

  return (
    <SettingsClient
      initialSettings={serializedSettings}
      initialAdminEmail={session?.email ?? ''}
    />
  );
}
