import { prisma } from '@/lib/prisma';
import BlogListClient, { BlogItem } from '@/components/admin/BlogListClient';

export const revalidate = 0;

export default async function AdminBlogPage() {
  const blogsRaw = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formatted: BlogItem[] = blogsRaw.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content,
    coverImage: b.coverImage,
    isPublished: b.isPublished,
    createdAt: b.createdAt.toISOString(),
  }));

  return <BlogListClient initialBlogs={formatted} />;
}
