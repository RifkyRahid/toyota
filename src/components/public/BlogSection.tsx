import Link from 'next/link';
import Image from 'next/image';

// ── Types ──────────────────────────────────────────────────────
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
}

interface BlogSectionProps {
  blogs: BlogPost[];
}

// ── Helper ─────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ── Component ─────────────────────────────────────────────────
export default function BlogSection({ blogs }: BlogSectionProps) {
  if (blogs.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold">
            Artikel &amp; Promo Terbaru
          </h2>
          <p className="text-gray-500 mt-2">
            Info terkini seputar Toyota, promo, dan tips otomotif di Batam
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Cover image */}
              <Link href={`/promo/${blog.slug}`} className="block relative aspect-video overflow-hidden">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </Link>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1 gap-2">
                {/* Date */}
                <time
                  dateTime={blog.createdAt}
                  className="text-xs text-gray-400 uppercase tracking-wide"
                >
                  {formatDate(blog.createdAt)}
                </time>

                {/* Title */}
                <h3 className="text-gray-900 font-bold text-base leading-snug line-clamp-2">
                  <Link href={`/promo/${blog.slug}`} className="hover:text-red-600 transition-colors">
                    {blog.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                  {blog.excerpt}
                </p>

                {/* CTA */}
                <Link
                  href={`/promo/${blog.slug}`}
                  className="mt-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors self-start"
                >
                  Baca Selengkapnya →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
