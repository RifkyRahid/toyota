import type { Metadata } from 'next';
import CatalogSection from '@/components/public/CatalogSection';
import { getCars, getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Katalog Mobil Toyota Batam — Daftar Lengkap Unit | Agung Toyota Batam',
  description:
    'Lihat seluruh katalog mobil Toyota terbaru di Batam. MPV, SUV, Sedan, Hatchback, Commercial, dan Hybrid/EV. Hubungi sales untuk harga OTR terbaik.',
};

export default async function KatalogPage() {
  const [cars, settings] = await Promise.all([
    getCars({ active: true, includeVariants: false }),
    getSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12">
      <CatalogSection cars={cars} salesWhatsapp={settings.salesWhatsapp} />
    </main>
  );
}
