import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buttonType, carName, sourcePage } = body;

    if (!buttonType || typeof buttonType !== 'string') {
      return NextResponse.json({ error: 'buttonType is required' }, { status: 400 });
    }

    const cleanButtonType = buttonType.slice(0, 50);
    const cleanCarName = carName && typeof carName === 'string' ? carName.slice(0, 100) : null;
    const cleanSourcePage = sourcePage && typeof sourcePage === 'string' ? sourcePage.slice(0, 200) : null;

    // Catat data interaksi CTA ke tabel cta_clicks
    await prisma.ctaClick.create({
      data: {
        buttonType: cleanButtonType,
        carName: cleanCarName,
        sourcePage: cleanSourcePage,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/analytics/track] Error:', error);
    // Return 200 even on error so client experience is never disrupted
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

