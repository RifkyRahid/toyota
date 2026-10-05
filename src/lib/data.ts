import { prisma } from '@/lib/prisma';
import type { SerializedCarModel, SerializedCarVariant, SiteSetting } from '@/types';

// Default fallback settings jika database belum ada data
export const DEFAULT_SITE_SETTINGS: SiteSetting = {
  id: 1,
  dealershipName: 'Agung Toyota Batam',
  dealershipAddress: 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau',
  googleMapsUrl: null,
  salesName: 'Official Sales Representative',
  salesTitle: 'Certified Sales Executive',
  salesPhone: '081234567890',
  salesWhatsapp: '6281234567890',
  salesPhotoUrl: '/images/sales-default.webp',
  salesBio: 'Siap melayani konsultasi pembelian mobil Toyota OTR Batam. Pelayanan profesional, transparan, cepat, dan terpercaya.',
  headerLogoUrl: '/images/toyota-logo.webp',
  footerLogoUrl: '/images/toyota-logo-white.webp',
  faviconUrl: '/favicon.ico',
  pricelistPdfUrl: '/uploads/pricelist-batam-2026.pdf',
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  updatedAt: new Date().toISOString(),
};

export interface SerializedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mengambil daftar mobil langsung dari database Prisma
 * Aman digunakan di Server Component (tidak gagal saat build time)
 */
export async function getCars(options?: {
  active?: boolean;
  includeVariants?: boolean;
}): Promise<SerializedCarModel[]> {
  try {
    const cars = await prisma.carModel.findMany({
      where: {
        ...(options?.active !== undefined ? { isActive: options.active } : {}),
      },
      include: {
        variants: options?.includeVariants
          ? { orderBy: { price: 'asc' } }
          : false,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return cars.map((car) => ({
      ...car,
      startingPrice: car.startingPrice.toString(),
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
      variants: Array.isArray(car.variants)
        ? car.variants.map((v) => ({
            ...v,
            price: v.price.toString(),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
          }))
        : undefined,
    })) as SerializedCarModel[];
  } catch (error) {
    console.error('[getCars] Error:', error);
    return [];
  }
}

/**
 * Mengambil satu model mobil berdasarkan slug
 */
export async function getCarBySlug(
  slug: string
): Promise<(SerializedCarModel & { variants: SerializedCarVariant[] }) | null> {
  try {
    const car = await prisma.carModel.findUnique({
      where: { slug },
      include: {
        variants: { orderBy: { price: 'asc' } },
      },
    });
    if (!car) return null;

    return {
      ...car,
      startingPrice: car.startingPrice.toString(),
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
      variants: car.variants.map((v) => ({
        ...v,
        price: v.price.toString(),
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      })),
    } as SerializedCarModel & { variants: SerializedCarVariant[] };
  } catch (error) {
    console.error('[getCarBySlug] Error:', error);
    return null;
  }
}

/**
 * Mengambil data SiteSetting dari database
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 1 },
    });
    if (!settings) return DEFAULT_SITE_SETTINGS;

    return {
      ...settings,
      updatedAt: settings.updatedAt.toISOString(),
    } as SiteSetting;
  } catch (error) {
    console.error('[getSiteSettings] Error:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Mengambil banner aktif
 */
export async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return banners;
  } catch (error) {
    console.error('[getBanners] Error:', error);
    return [];
  }
}

/**
 * Mengambil artikel blog/promo yang dipublikasikan
 */
export async function getBlogs(limit = 50): Promise<SerializedBlog[]> {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return blogs.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('[getBlogs] Error:', error);
    return [];
  }
}

/**
 * Mengambil satu artikel blog/promo berdasarkan slug
 */
export async function getBlogBySlug(slug: string): Promise<SerializedBlog | null> {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });
    if (!blog || !blog.isPublished) return null;
    return {
      ...blog,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('[getBlogBySlug] Error:', error);
    return null;
  }
}

