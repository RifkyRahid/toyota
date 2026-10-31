import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Deteksi domain otomatis (mendukung baik promoagungtoyota.com maupun www.promoagungtoyota.com)
  let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://promoagungtoyota.com').replace(
    /\/$/,
    ''
  );

  try {
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      baseUrl = `https://${host}`;
    }
  } catch {
    // Gunakan fallback baseUrl
  }

  const now = new Date();

  // 1. Daftar Halaman Statis Utama
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/daftar-harga`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/promo`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sales`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Daftar Halaman Dinamis Mobil (/mobil/[slug]) & Artikel Promo (/promo/[slug]) dari Database
  try {
    const [cars, blogs] = await Promise.all([
      prisma.carModel
        .findMany({
          where: { isActive: true },
          select: { slug: true, updatedAt: true },
          orderBy: { displayOrder: 'asc' },
        })
        .catch(() => []),
      prisma.blog
        .findMany({
          where: { isPublished: true },
          select: { slug: true, updatedAt: true },
          orderBy: { createdAt: 'desc' },
        })
        .catch(() => []),
    ]);

    const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
      url: `${baseUrl}/mobil/${car.slug}`,
      lastModified: car.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${baseUrl}/promo/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

    return [...staticPages, ...carPages, ...blogPages];
  } catch {
    return staticPages;
  }
}

