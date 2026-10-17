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

    const existing = await prisma.promoFlyer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Flyer tidak ditemukan.' }, { status: 404 });
    }

    // Bersihkan file poster lama jika diganti dengan yang baru
    if (
      body.customImageUrl !== undefined &&
      body.customImageUrl !== existing.customImageUrl &&
      existing.customImageUrl
    ) {
      await deleteUploadedFile(existing.customImageUrl);
    }

    const updated = await prisma.promoFlyer.update({
      where: { id },
      data: body,
    });

    revalidatePath('/');
    revalidatePath('/admin/flyer');
    revalidatePath('/admin/dashboard');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/flyers/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui flyer promo.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const existing = await prisma.promoFlyer.findUnique({ where: { id } });

    await prisma.promoFlyer.delete({ where: { id } });

    // Hanya hapus customImageUrl (karena carImageUrl sering merujuk ke foto katalog unit)
    if (existing?.customImageUrl) {
      await deleteUploadedFile(existing.customImageUrl);
    }

    revalidatePath('/');
    revalidatePath('/admin/flyer');
    revalidatePath('/admin/dashboard');

    return NextResponse.json({ message: 'Flyer promo berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/flyers/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus flyer promo.' }, { status: 500 });
  }
}

