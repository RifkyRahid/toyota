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

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (existing && body.imageUrl && body.imageUrl !== existing.imageUrl) {
      await deleteUploadedFile(existing.imageUrl);
    }
    if (existing && body.imageUrlMobile !== undefined && body.imageUrlMobile !== existing.imageUrlMobile && existing.imageUrlMobile) {
      await deleteUploadedFile(existing.imageUrlMobile);
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: body,
    });

    revalidatePath('/');
    return NextResponse.json(banner);
  } catch (error) {
    console.error('[PUT /api/banners/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui banner.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const existing = await prisma.banner.findUnique({ where: { id } });

    await prisma.banner.delete({ where: { id } });

    if (existing?.imageUrl) {
      await deleteUploadedFile(existing.imageUrl);
    }
    if (existing?.imageUrlMobile) {
      await deleteUploadedFile(existing.imageUrlMobile);
    }

    revalidatePath('/');
    return NextResponse.json({ message: 'Banner berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/banners/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus banner.' }, { status: 500 });
  }
}
