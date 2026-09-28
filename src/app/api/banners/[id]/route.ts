import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();

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
    await prisma.banner.delete({ where: { id } });

    revalidatePath('/');
    return NextResponse.json({ message: 'Banner berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/banners/[id]] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus banner.' }, { status: 500 });
  }
}
