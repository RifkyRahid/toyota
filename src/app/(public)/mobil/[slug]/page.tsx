import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SerializedCarModel, SerializedCarVariant, SiteSetting } from '@/types';
import { formatRupiah } from '@/lib/format';
import CarDetailClient from '@/components/public/CarDetailClient';

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

type CarWithVariants = SerializedCarModel & { variants: SerializedCarVariant[] };

// ── Data Fetchers ──────────────────────────────────────────────────────────────

async function fetchCar(slug: string): Promise<CarWithVariants | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/cars/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CarWithVariants;
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<SiteSetting | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteSetting;
  } catch {
    return null;
  }
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await fetchCar(slug);

  if (!car) {
    return { title: 'Mobil Tidak Ditemukan — Toyota Batam' };
  }

  return {
    title: `Toyota ${car.name} — Harga OTR Batam ${new Date().getFullYear()} | Agung Toyota Batam`,
    description: `Harga OTR Toyota ${car.name} di Batam mulai ${formatRupiah(car.startingPrice)}. Tersedia ${car.variants.length} pilihan varian. Hubungi sales kami untuk penawaran terbaik.`,
    openGraph: {
      images: [{ url: car.bannerImage || car.heroImage }],
    },
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;

  const [car, settings] = await Promise.all([fetchCar(slug), fetchSettings()]);

  if (!car || !car.variants || car.variants.length === 0) {
    notFound();
  }

  // Sudah diurutkan by price asc dari API
  const lowestVariant = car.variants[0];

  return (
    <main className="bg-white min-h-screen pb-24 md:pb-0">
      {/* ── Banner Hero Widescreen (Full-Width Maksimal Layar seperti Toyota Astra) ── */}
      {car.bannerImage ? (
        <section className="relative w-full bg-zinc-950 overflow-hidden">
          <div className="w-full relative aspect-[16/9] sm:aspect-[21/9] md:h-[520px] lg:h-[620px] max-h-[720px]">
            <img
              src={car.bannerImage}
              alt={`Banner Toyota ${car.name}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </section>
      ) : (
        /* Fallback: Jika model belum memiliki banner khusus, tampilkan foto studio */
        <section className="py-10 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64 md:h-80 overflow-hidden">
              <img
                src={car.heroImage}
                alt={`Toyota ${car.name}`}
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Header Informasi Produk ────────────────────────────── */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs md:text-sm font-bold text-red-600 uppercase tracking-wider">
              {car.category.replace(/_/g, ' ')}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mt-1">
              Toyota {car.name}
            </h1>
            <p className="text-gray-500 mt-2 text-base md:text-lg">
              Harga OTR Batam Mulai{' '}
              <span className="text-red-600 font-extrabold">
                {formatRupiah(car.startingPrice)}
              </span>
            </p>
          </div>
          {car.isPromo && car.promoLabel && (
            <div className="shrink-0">
              <span className="inline-block bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-xs">
                {car.promoLabel}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Quick Summary Bar ──────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-4 hidden md:block">
        <div className="container mx-auto px-4 flex flex-wrap gap-6 text-sm text-gray-600">
          {lowestVariant.transmission && (
            <span>
              <span className="font-medium text-gray-900">Transmisi:</span>{' '}
              {lowestVariant.transmission}
            </span>
          )}
          {lowestVariant.fuelType && (
            <span>
              <span className="font-medium text-gray-900">Bahan Bakar:</span>{' '}
              {lowestVariant.fuelType}
            </span>
          )}
          {lowestVariant.seatingCapacity && (
            <span>
              <span className="font-medium text-gray-900">Kapasitas:</span>{' '}
              {lowestVariant.seatingCapacity} Penumpang
            </span>
          )}
          {car.variants.length > 1 && (
            <span>
              <span className="font-medium text-gray-900">Pilihan Varian:</span>{' '}
              {car.variants.length} Tipe
            </span>
          )}
        </div>
      </section>

      {/* ── Variant Selector + Spec Accordion + Mobile Bottom Bar ─ */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pilih Tipe &amp; Varian
          </h2>
          {settings ? (
            <CarDetailClient car={car} settings={settings} />
          ) : (
            /* Fallback jika settings gagal di-fetch */
            <CarDetailClient
              car={car}
              settings={{
                id: 1,
                dealershipName: 'Agung Toyota Batam',
                dealershipAddress: '',
                googleMapsUrl: null,
                salesName: 'Sales Toyota',
                salesTitle: 'Certified Sales Executive',
                salesPhone: '',
                salesWhatsapp: '6281234567890',
                salesPhotoUrl: '',
                salesBio: null,
                headerLogoUrl: '/images/toyota-logo.webp',
                footerLogoUrl: '/images/toyota-logo-white.webp',
                faviconUrl: '/favicon.ico',
                pricelistPdfUrl: '/uploads/pricelist-batam-2026.pdf',
                instagramUrl: null,
                facebookUrl: null,
                tiktokUrl: null,
                updatedAt: new Date().toISOString(),
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
