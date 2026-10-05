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
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Katalog Mobil Toyota Batam
          </h1>
          <p className="text-gray-500 mt-2">
            Temukan unit Toyota impian Anda dengan harga OTR terbaik di Batam
          </p>
        </div>
      </section>
      <section className="py-12">
        <CatalogSection cars={cars} salesWhatsapp={settings.salesWhatsapp} />
      </section>
    </main>
  );
}
