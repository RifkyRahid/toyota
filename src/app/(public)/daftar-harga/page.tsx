import type { Metadata } from 'next';
import DaftarHargaClient from '@/components/public/DaftarHargaClient';
import { getCars, getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daftar Harga OTR Toyota Batam 2026 — Pricelist Resmi | Agung Toyota Batam',
  description:
    'Daftar harga OTR resmi seluruh tipe mobil Toyota di Batam tahun 2026. Download pricelist PDF gratis.',
};

export default async function DaftarHargaPage() {
  const [cars, settings] = await Promise.all([
    getCars({ active: true, includeVariants: true }),
    getSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gray-50 py-10 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Daftar Harga OTR Toyota Batam
          </h1>
          <p className="text-gray-500 mt-2">
            Harga OTR resmi seluruh tipe mobil Toyota untuk wilayah Batam dan Kepulauan Riau
          </p>
        </div>
      </section>
      <section className="py-12">
        <DaftarHargaClient cars={cars} settings={settings} />
      </section>
    </main>
  );
}
