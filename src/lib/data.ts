import { prisma } from '@/lib/prisma';
import type { SerializedCarModel, SerializedCarVariant, SiteSetting, PromoFlyerItem } from '@/types';

// Default fallback settings jika database belum ada data
export const DEFAULT_SITE_SETTINGS: SiteSetting = {
  id: 1,
  dealershipName: 'Agung Toyota Batam',
  dealershipAddress: 'Jl. Yos Sudarso, Batu Ampar, Kota Batam, Kepulauan Riau',
  googleMapsUrl: null,
  salesName: 'Lidya Toyota',
  salesTitle: 'Sales Resmi Agung Toyota Batam',
  salesPhone: '0853-5574-6543',
  salesWhatsapp: '6285355746543',
  salesPhotoUrl: '/images/sales-default.webp',
  salesBio: 'Siap melayani konsultasi pembelian & tukar tambah mobil Toyota OTR Batam. Pelayanan profesional, transparan, cepat, dan terpercaya.',
  headerLogoUrl: '/images/toyota-logo.webp',
  footerLogoUrl: '/images/toyota-logo-white.webp',
  faviconUrl: '/favicon.ico',
  pricelistPdfUrl: '/uploads/pricelist-batam-2026.pdf',
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_TUKAR_TAMBAH_FLYER: PromoFlyerItem = {
  id: 'default-tukar-tambah-batam',
  mode: 'IMAGE',
  theme: 'RED_WHITE',
  title: 'Promo Tukar Tambah Mobil - Agung Toyota Batam',
  eventTag: 'PROMO TOYOTA BULAN INI',
  subtitle: 'DP Ringan • Cicilan Super Ringan & Fleksibel • Diskon hingga Puluhan Juta',
  carSlug: null,
  carImageUrl: null,
  customImageUrl: '/images/promo-tukar-tambah-batam.jpg',
  highlight1Label: 'Program Spesial',
  highlight1Value: 'Tukar Tambah',
  highlight2Label: 'Diskon Menarik',
  highlight2Value: 'Puluhan Juta',
  benefits: [
    'DP Ringan',
    'Cicilan Super Ringan & Fleksibel',
    'Diskon Menarik hingga Puluhan Juta',
    'Bonus Aksesoris & Paket Servis',
    'Proses Cepat & Mudah',
    'Terima Tukar Tambah Mobil Lama',
  ],
  waCustomMessage:
    'Halo Lidya Agung Toyota Batam, saya tertarik klaim Promo Tukar Tambah Mobil Bulan Ini. Mohon info harga & simulasi kreditnya.',
  viewCount: 0,
  waClickCount: 0,
  displayOrder: 0,
  isPopup: true,
  isActive: true,
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

/**
 * Memastikan poster default "Promo Tukar Tambah Mobil - Agung Toyota Batam"
 * sudah terdaftar di tabel promo_flyers (hanya dibuat 1x jika belum pernah ada).
 */
export async function ensureDefaultPromoFlyer(): Promise<void> {
  try {
    // Pastikan kolom isPopup sudah ada di tabel promo_flyers (auto-migrate aman)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "promo_flyers" ADD COLUMN IF NOT EXISTS "isPopup" BOOLEAN NOT NULL DEFAULT false;`
    );

    const existing = await prisma.promoFlyer.findFirst({
      where: {
        OR: [
          { customImageUrl: '/images/promo-tukar-tambah-batam.jpg' },
          { customImageUrl: '/uploads/promo-tukar-tambah-batam.jpg' },
          { isPopup: true },
        ],
      },
    });

    if (!existing) {
      await prisma.promoFlyer.create({
        data: {
          mode: 'IMAGE',
          theme: 'RED_WHITE',
          title: DEFAULT_TUKAR_TAMBAH_FLYER.title,
          eventTag: DEFAULT_TUKAR_TAMBAH_FLYER.eventTag,
          subtitle: DEFAULT_TUKAR_TAMBAH_FLYER.subtitle,
          customImageUrl: '/images/promo-tukar-tambah-batam.jpg',
          highlight1Label: DEFAULT_TUKAR_TAMBAH_FLYER.highlight1Label,
          highlight1Value: DEFAULT_TUKAR_TAMBAH_FLYER.highlight1Value,
          highlight2Label: DEFAULT_TUKAR_TAMBAH_FLYER.highlight2Label,
          highlight2Value: DEFAULT_TUKAR_TAMBAH_FLYER.highlight2Value,
          benefits: DEFAULT_TUKAR_TAMBAH_FLYER.benefits,
          waCustomMessage: DEFAULT_TUKAR_TAMBAH_FLYER.waCustomMessage,
          displayOrder: 0,
          isPopup: true,
          isActive: true,
        },
      });
    }
  } catch {
    // Abaikan jika DB belum siap saat build time
  }
}

/**
 * Mengambil seluruh Flyer Promo yang aktif untuk ditampilkan di Beranda
 */
export async function getActiveFlyers(): Promise<PromoFlyerItem[]> {
  try {
    await ensureDefaultPromoFlyer();

    const flyers = await prisma.promoFlyer.findMany({
      where: { isActive: true },
      orderBy: [{ isPopup: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return flyers.map((f) => ({
      ...f,
      mode: f.mode === 'IMAGE' ? 'IMAGE' : 'AUTO',
      theme: (['RED_WHITE', 'DARK_LUXURY', 'SILVER_SPORT'].includes(f.theme)
        ? f.theme
        : 'RED_WHITE') as 'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT',
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('[getActiveFlyers] Fallback to default poster:', error);
    return [DEFAULT_TUKAR_TAMBAH_FLYER];
  }
}

/**
 * Mengambil Flyer yang ditandai sebagai Popup Utama (isPopup: true & isActive: true)
 */
export async function getActivePopupFlyer(): Promise<PromoFlyerItem | null> {
  try {
    await ensureDefaultPromoFlyer();

    const popupFlyer = await prisma.promoFlyer.findFirst({
      where: { isActive: true, isPopup: true },
      orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    if (!popupFlyer) return null;

    return {
      ...popupFlyer,
      mode: popupFlyer.mode === 'IMAGE' ? 'IMAGE' : 'AUTO',
      theme: (['RED_WHITE', 'DARK_LUXURY', 'SILVER_SPORT'].includes(popupFlyer.theme)
        ? popupFlyer.theme
        : 'RED_WHITE') as 'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT',
      createdAt: popupFlyer.createdAt.toISOString(),
      updatedAt: popupFlyer.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('[getActivePopupFlyer] Fallback to default poster:', error);
    return DEFAULT_TUKAR_TAMBAH_FLYER;
  }
}


