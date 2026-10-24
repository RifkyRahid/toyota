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
import TestimonialSection from '@/components/public/TestimonialSection';
import BlogSection from '@/components/public/BlogSection';
import type { SerializedCarModel, SiteSetting, PromoFlyerItem, TestimonialItem } from '@/types';
import { formatRupiah } from '@/lib/format';
import { getActiveFlyers } from '@/lib/data';

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
  return getActiveFlyers();
}

async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/testimonials`, {
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
  const [allCars, settings, banners, flyers, testimonials, blogs] = await Promise.all([
    fetchAllCars(),
    fetchSettings(),
    fetchBanners(),
    fetchFlyers(),
    fetchTestimonials(),
    fetchBlogs(),
  ]);

  // Otomatis buat banner dari mobil aktif yang memiliki bannerImage atau bannerImageMobile
  const carBanners: Banner[] = allCars
    .filter((car) =>
      Boolean(
        (car.bannerImage && car.bannerImage.trim() !== '') ||
          (car.bannerImageMobile && car.bannerImageMobile.trim() !== '')
      )
    )
    .map((car) => ({
      id: `car-banner-${car.id}`,
      title: car.name,
      subtitle: `Harga OTR Batam Mulai ${formatRupiah(car.startingPrice)}`,
      ctaText: 'Lihat Detail Unit',
      ctaUrl: `/mobil/${car.slug}`,
      imageUrl: (car.bannerImage || car.bannerImageMobile) as string,
      imageUrlMobile: car.bannerImageMobile || null,
    }));

  // Gabungkan: Banner promo/event umum di awal, disusul oleh banner mobil dari katalog
  const combinedBanners: Banner[] = [...banners, ...carBanners];

  const salesWhatsapp = settings.salesWhatsapp ?? '';

  return (
    <main>
      {/* ── 1. Hero Slider (Event Banners + Mobil Banners) ── */}
      <HeroSlider banners={combinedBanners} />

      {/* ── 2. Section Flyer Promo & Paket Kredit ── */}
      <PromoFlyerSection flyers={flyers} salesWhatsapp={salesWhatsapp} />

      {/* ── 3. Section Katalog dengan Tab Filter ── */}
      <section id="katalog" className="py-10 md:py-14 bg-gray-50">
        <CatalogSection cars={allCars} salesWhatsapp={salesWhatsapp} />
      </section>

      {/* ── 4. Section Sales Representative ────────────── */}
      <SalesSection settings={settings} />

      {/* ── 5. Section Testimoni & Serah Terima Unit ───── */}
      <TestimonialSection testimonials={testimonials} />

      {/* ── 6. Section Blog (kondisional) ───────────────── */}
      {blogs.length > 0 && <BlogSection blogs={blogs} />}
    </main>
  );
}
