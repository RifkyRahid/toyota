import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import DOMPurify from 'isomorphic-dompurify';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET /api/blogs ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const all = searchParams.get('all') === 'true';

    const blogs = await prisma.blog.findMany({
      where: all ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, Math.max(1, limit)),
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('[GET /api/blogs] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// ── POST /api/blogs ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, isPublished } = body;

    if (!title || !slug || !excerpt || !content || !coverImage) {
      return NextResponse.json(
        { error: 'Field title, slug, excerpt, content, dan coverImage wajib diisi.' },
        { status: 400 }
      );
    }

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan.` },
        { status: 409 }
      );
    }

    // Sanitize rich-text content using DOMPurify before saving
    const cleanContent = DOMPurify.sanitize(content);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content: cleanContent,
        coverImage,
        isPublished: isPublished ?? true,
      },
    });

    revalidatePath('/promo');
    revalidatePath('/');

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('[POST /api/blogs] Error:', error);
    return NextResponse.json({ error: 'Gagal membuat artikel blog.' }, { status: 500 });
  }
}
