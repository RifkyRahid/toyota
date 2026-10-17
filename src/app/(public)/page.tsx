/**
 * Homepage — Server Component
 * Agung Toyota Batam
 *
 * Fetch paralel dengan ISR 1 jam:
 *  - Semua mobil aktif (katalog)
 *  - Site settings (sales info, WA)
 *  - Banners (fallback [] jika endpoint belum tersedia)
 *  - Blog posts (fallback [] jika endpoint belum tersedia)
 *
 * Promo cars difilter di sisi server dari hasil fetch katalog.
 */

import HeroSlider, { type Banner } from '@/components/public/HeroSlider';
import PromoFlyerSection from '@/components/public/PromoFlyerSection';
import CatalogSection from '@/components/public/CatalogSection';
import SalesSection from '@/components/public/SalesSection';
import BlogSection from '@/components/public/BlogSection';
import type { SerializedCarModel, SiteSetting, PromoFlyerItem } from '@/types';
import { formatRupiah } from '@/lib/format';

// ── Fetch helpers ─────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const REVALIDATE = 3600; // 1 hour ISR

async function fetchAllCars(): Promise<SerializedCarModel[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/cars?active=true&includeVariants=false`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchSettings(): Promise<Partial<SiteSetting>> {
  try {
    const res = await fetch(`${BASE_URL}/api/settings`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/banners`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchFlyers(): Promise<PromoFlyerItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/flyers`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
}

async function fetchBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/blogs?limit=4`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────

export default async function HomePage() {
  // Parallel fetch — semua request berjalan bersamaan
  const [allCars, settings, banners, flyers, blogs] = await Promise.all([
    fetchAllCars(),
    fetchSettings(),
    fetchBanners(),
    fetchFlyers(),
    fetchBlogs(),
  ]);

  // Fallback otomatis dari mobil bertanda Promo jika tabel promo_flyers masih kosong
  const themes: Array<'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT'> = [
    'RED_WHITE',
    'DARK_LUXURY',
    'SILVER_SPORT',
  ];
  const fallbackFlyers: PromoFlyerItem[] = allCars
    .filter((car) => car.isPromo)
    .slice(0, 6)
    .map((car, idx) => ({
      id: `fallback-${car.id}`,
      mode: 'AUTO',
      theme: themes[idx % themes.length],
      title: car.name,
      eventTag: 'TOYOTA SPEKTAKULER',
      subtitle: `OTR Batam Mulai ${formatRupiah(car.startingPrice)}`,
      carSlug: car.slug,
      carImageUrl: car.heroImage,
      customImageUrl: null,
      highlight1Label: 'Penawaran Spesial',
      highlight1Value: car.promoLabel || 'Cicilan Ringan',
      highlight2Label: 'DP Mulai',
      highlight2Value: '15%',
      benefits: [
        'Bunga 0%',
        'Cash Bertahap 50:50',
        'Gratis Aksesoris',
        'Trade-In All Brand',
      ],
      waCustomMessage: null,
      viewCount: 0,
      waClickCount: 0,
      displayOrder: idx,
      isActive: true,
    }));

  const activeFlyers = flyers.length > 0 ? flyers : fallbackFlyers;

  // Otomatis buat banner dari mobil aktif yang memiliki bannerImage atau bannerImageMobile
  const carBanners: Banner[] = allCars
    .filter((car) =>
      Boolean(
        (car.bannerImage && car.bannerImage.trim() !== '') ||
          (car.bannerImageMobile && car.bannerImageMobile.trim() !== '')
      )
    )
    .map((car) => {
      const subtitle = car.promoLabel
        ? `${car.promoLabel} • OTR Batam Mulai ${formatRupiah(car.startingPrice)}`
        : `Harga OTR Batam Mulai ${formatRupiah(car.startingPrice)}`;

      return {
        id: `car-banner-${car.id}`,
        title: car.name,
        subtitle,
        ctaText: 'Lihat Detail Unit',
        ctaUrl: `/mobil/${car.slug}`,
        imageUrl: (car.bannerImage || car.bannerImageMobile) as string,
        imageUrlMobile: car.bannerImageMobile || null,
      };
    });

  // Gabungkan: Banner promo/event umum di awal, disusul oleh banner mobil dari katalog
  const combinedBanners: Banner[] = [...banners, ...carBanners];

  const salesWhatsapp = settings.salesWhatsapp ?? '';

  return (
    <main>
      {/* ── 1. Hero Slider (Event Banners + Mobil Banners) ── */}
      <HeroSlider banners={combinedBanners} />

      {/* ── 2. Section Flyer Promo & Paket Kredit (Menggantikan Promo Bulan Ini lama) ── */}
      <PromoFlyerSection flyers={activeFlyers} salesWhatsapp={salesWhatsapp} />

      {/* ── 3. Section Katalog dengan Tab Filter (Badge PROMO tetap tampil di kartu katalog) ── */}
      <section id="katalog" className="py-10 md:py-14 bg-gray-50">
        <CatalogSection cars={allCars} salesWhatsapp={salesWhatsapp} />
      </section>

      {/* ── 4. Section Sales Representative ────────────── */}
      <SalesSection settings={settings} />

      {/* ── 5. Section Blog (kondisional) ───────────────── */}
      {blogs.length > 0 && <BlogSection blogs={blogs} />}
    </main>
  );
}
