import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { deleteUploadedFile } from '@/lib/file-cleanup';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Testimoni tidak ditemukan.' }, { status: 404 });
    }

    if (body.imageUrl && body.imageUrl !== existing.imageUrl) {
      await deleteUploadedFile(existing.imageUrl);
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: body,
    });

    revalidatePath('/');
    revalidatePath('/admin/testimoni');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/testimonials/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui testimoni.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });

    await prisma.testimonial.delete({ where: { id } });

    if (existing?.imageUrl) {
      await deleteUploadedFile(existing.imageUrl);
    }

    revalidatePath('/');
    revalidatePath('/admin/testimoni');

    return NextResponse.json({ message: 'Testimoni berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/testimonials/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus testimoni.' }, { status: 500 });
  }
}

