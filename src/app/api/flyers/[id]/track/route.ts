import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/flyers/[id]/track
 * Body: { action: 'VIEW' | 'WA_CLICK' | 'RESET' }
 * - VIEW: tambah viewCount + 1 (saat pengunjung klik perbesar / Lightbox Preview)
 * - WA_CLICK: tambah waClickCount + 1 (saat pengunjung klik tombol Klaim Promo via WA)
 * - RESET: reset viewCount = 0 dan waClickCount = 0
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'VIEW';

    // Abaikan jika ID adalah fallback statis (bukan ID database)
    if (id.startsWith('fallback-')) {
      return NextResponse.json({ success: true, fallback: true });
    }

    if (action === 'RESET') {
      const updated = await prisma.promoFlyer.update({
        where: { id },
        data: { viewCount: 0, waClickCount: 0 },
      });
      return NextResponse.json({ success: true, flyer: updated });
    }

    if (action === 'WA_CLICK') {
      const updated = await prisma.promoFlyer.update({
        where: { id },
        data: { waClickCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true, waClickCount: updated.waClickCount });
    }

    // Default: VIEW (Lightbox preview opened)
    const updated = await prisma.promoFlyer.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true, viewCount: updated.viewCount });
  } catch (error) {
    console.error('[POST /api/flyers/[id]/track] Error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

