import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogs } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Promo Toyota Batam — Penawaran & Artikel Terbaru | Agung Toyota Batam',
  description: 'Info promo terbaru, artikel, dan berita seputar Toyota Batam.',
};

export default async function PromoPage() {
  const blogs = await getBlogs(50);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Promo & Artikel</h1>
          <p className="text-gray-500 mt-2">Info terbaru seputar promo dan berita Toyota Batam</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Belum ada artikel. Nantikan update terbaru dari kami!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/promo/${blog.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <time className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                    <h2 className="text-gray-900 font-bold text-lg mt-1 line-clamp-2 group-hover:text-red-600 transition-colors">{blog.title}</h2>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{blog.excerpt}</p>
                    <span className="inline-block mt-3 text-red-600 text-sm font-semibold">Baca Selengkapnya →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
