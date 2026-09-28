import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET /api/banners ──────────────────────────────────────────
// Mengambil banner aktif terurut berdasarkan displayOrder asc
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get('all') === 'true';

    const banners = await prisma.banner.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('[GET /api/banners] Error:', error);
    return NextResponse.json([], { status: 200 }); // return fallback empty array instead of 500
  }
}

// ── POST /api/banners ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, ctaText, ctaUrl, imageUrl, displayOrder, isActive } = body;

    if (!title || !imageUrl || !ctaUrl) {
      return NextResponse.json(
        { error: 'Field title, imageUrl, dan ctaUrl wajib diisi.' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle ?? null,
        ctaText: ctaText ?? 'Minta Penawaran',
        ctaUrl,
        imageUrl,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    revalidatePath('/');

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('[POST /api/banners] Error:', error);
    return NextResponse.json({ error: 'Gagal membuat banner.' }, { status: 500 });
  }
}
