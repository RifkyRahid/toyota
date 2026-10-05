import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildWaUrl } from '@/lib/format';
import { getBlogBySlug, getSiteSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return { title: 'Artikel Tidak Ditemukan — Agung Toyota Batam' };
  }

  return {
    title: `${blog.title} | Agung Toyota Batam`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [{ url: blog.coverImage }],
    },
  };
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([getBlogBySlug(slug), getSiteSettings()]);

  if (!blog) {
    notFound();
  }

  const salesWhatsapp = settings.salesWhatsapp ?? '6281234567890';
  const waMessage = `Halo Agung Toyota Batam, saya baru saja membaca artikel "${blog.title}". Saya ingin konsultasi lebih lanjut.`;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <Link href="/promo" className="hover:text-red-600 transition-colors">
            Promo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs inline-block align-bottom">
            {blog.title}
          </span>
        </nav>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="aspect-[21/9] w-full bg-gray-100 overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            {/* Date & Author */}
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              <time dateTime={blog.createdAt}>
                {new Date(blog.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span>•</span>
              <span>Agung Toyota Batam</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Content (Sanitized server-side via DOMPurify before saving) */}
            <div
              className="prose max-w-none text-gray-700 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Call to Action WhatsApp Box */}
            <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Tertarik dengan Promo Ini?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Hubungi sales representatif resmi Toyota Batam untuk informasi diskon dan perhitungan simulasi kredit.
                </p>
              </div>
              <a
                href={buildWaUrl(salesWhatsapp, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors text-sm"
              >
                Chat WhatsApp Sekarang
              </a>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

