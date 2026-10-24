import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ensureDefaultPromoFlyer, DEFAULT_TUKAR_TAMBAH_FLYER } from '@/lib/data';

export const dynamic = 'force-dynamic';

// ── GET /api/flyers ───────────────────────────────────────────
// Mengambil flyer promo terurut berdasarkan displayOrder asc
export async function GET(req: NextRequest) {
  try {
    await ensureDefaultPromoFlyer();

    const { searchParams } = req.nextUrl;
    const all = searchParams.get('all') === 'true';

    const flyers = await prisma.promoFlyer.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ isPopup: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(flyers);
  } catch (error) {
    console.error('[GET /api/flyers] Error:', error);
    return NextResponse.json([DEFAULT_TUKAR_TAMBAH_FLYER], { status: 200 });
  }
}

// ── POST /api/flyers ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = 'AUTO',
      theme = 'RED_WHITE',
      title,
      eventTag = 'TOYOTA SPEKTAKULER',
      subtitle,
      carSlug,
      carImageUrl,
      customImageUrl,
      highlight1Label = 'Cicilan Mulai',
      highlight1Value = '3 Jtan',
      highlight2Label = 'DP Mulai',
      highlight2Value = '15%',
      benefits = [],
      waCustomMessage,
      displayOrder = 0,
      isPopup = false,
      isActive = true,
    } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Judul / Nama Unit promo wajib diisi.' },
        { status: 400 }
      );
    }

    if (mode === 'IMAGE' && !customImageUrl) {
      return NextResponse.json(
        { error: 'Gambar poster flyer wajib diunggah untuk mode Upload Gambar.' },
        { status: 400 }
      );
    }

    if (mode === 'AUTO' && !carImageUrl) {
      return NextResponse.json(
        { error: 'Foto mobil wajib dipilih atau diunggah untuk mode Auto-Flyer.' },
        { status: 400 }
      );
    }

    if (isPopup) {
      await prisma.promoFlyer.updateMany({
        where: { isPopup: true },
        data: { isPopup: false },
      });
    }

    const flyer = await prisma.promoFlyer.create({
      data: {
        mode: mode === 'IMAGE' ? 'IMAGE' : 'AUTO',
        theme: ['RED_WHITE', 'DARK_LUXURY', 'SILVER_SPORT'].includes(theme) ? theme : 'RED_WHITE',
        title: title.trim(),
        eventTag: eventTag?.trim() || 'TOYOTA SPEKTAKULER',
        subtitle: subtitle?.trim() || null,
        carSlug: carSlug?.trim() || null,
        carImageUrl: carImageUrl || null,
        customImageUrl: customImageUrl || null,
        highlight1Label: highlight1Label?.trim() || 'Cicilan Mulai',
        highlight1Value: highlight1Value?.trim() || '3 Jtan',
        highlight2Label: highlight2Label?.trim() || 'DP Mulai',
        highlight2Value: highlight2Value?.trim() || '15%',
        benefits: Array.isArray(benefits)
          ? benefits.map((b: unknown) => String(b).trim()).filter(Boolean)
          : [],
        waCustomMessage: waCustomMessage?.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        isPopup: Boolean(isPopup),
        isActive: Boolean(isActive),
      },
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/flyer');
    revalidatePath('/admin/dashboard');

    return NextResponse.json(flyer, { status: 201 });
  } catch (error) {
    console.error('[POST /api/flyers] Error:', error);
    return NextResponse.json({ error: 'Gagal membuat flyer promo.' }, { status: 500 });
  }
}

