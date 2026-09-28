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
import CarCard from '@/components/public/CarCard';
import CatalogSection from '@/components/public/CatalogSection';
import SalesSection from '@/components/public/SalesSection';
import BlogSection from '@/components/public/BlogSection';
import type { SerializedCarModel, SiteSetting } from '@/types';

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
    // Endpoint belum tersedia — gunakan fallback kosong
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
    // Endpoint belum tersedia — gunakan fallback kosong
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────

export default async function HomePage() {
  // Parallel fetch — semua request berjalan bersamaan
  const [allCars, settings, banners, blogs] = await Promise.all([
    fetchAllCars(),
    fetchSettings(),
    fetchBanners(),
    fetchBlogs(),
  ]);

  // Filter promo cars dari hasil fetch (max 3)
  const promoCars: SerializedCarModel[] = allCars
    .filter((car) => car.isPromo)
    .slice(0, 3);

  const salesWhatsapp = settings.salesWhatsapp ?? '';

  return (
    <main>
      {/* ── 1. Hero Slider ─────────────────────────────── */}
      <HeroSlider banners={banners} />

      {/* ── 2. Section Promo ───────────────────────────── */}
      {promoCars.length > 0 && (
        <section id="promo" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-gray-900 text-2xl md:text-3xl font-bold">
                Promo Bulan Ini
              </h2>
              <p className="text-gray-500 mt-2">
                Penawaran terbaik Toyota untuk Anda di Batam
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {promoCars.map((car) => (
                <CarCard key={car.id} car={car} salesWhatsapp={salesWhatsapp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Section Katalog dengan Tab Filter ───────── */}
      <section id="katalog" className="py-16 bg-gray-50">
        <CatalogSection cars={allCars} salesWhatsapp={salesWhatsapp} />
      </section>

      {/* ── 4. Section Sales Representative ────────────── */}
      <SalesSection settings={settings} />

      {/* ── 5. Section Blog (kondisional) ───────────────── */}
      {blogs.length > 0 && <BlogSection blogs={blogs} />}
    </main>
  );
}
