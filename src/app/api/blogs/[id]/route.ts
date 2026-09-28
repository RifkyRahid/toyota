import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import DOMPurify from 'isomorphic-dompurify';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const blog = await prisma.blog.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('[GET /api/blogs/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil artikel.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, isPublished } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (excerpt !== undefined) dataToUpdate.excerpt = excerpt;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
    if (isPublished !== undefined) dataToUpdate.isPublished = isPublished;

    if (content !== undefined) {
      dataToUpdate.content = DOMPurify.sanitize(content);
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath('/promo');
    revalidatePath('/');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/blogs/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui artikel.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await prisma.blog.delete({ where: { id } });

    revalidatePath('/promo');
    revalidatePath('/');

    return NextResponse.json({ message: 'Artikel berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/blogs/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus artikel.' }, { status: 500 });
  }
}
