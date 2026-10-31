import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

