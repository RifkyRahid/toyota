import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET /api/testimonials ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get('all') === 'true';

    const testimonials = await prisma.testimonial.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('[GET /api/testimonials] Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// ── POST /api/testimonials ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      carName,
      location,
      rating = 5,
      review,
      imageUrl,
      displayOrder = 0,
      isActive = true,
    } = body;

    if (!customerName || !carName || !review || !imageUrl) {
      return NextResponse.json(
        { error: 'Nama pelanggan, unit mobil, kalimat review, dan foto serah terima wajib diisi.' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: String(customerName).trim(),
        carName: String(carName).trim(),
        location: location ? String(location).trim() : null,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        review: String(review).trim(),
        imageUrl: String(imageUrl).trim(),
        displayOrder: Number(displayOrder) || 0,
        isActive: Boolean(isActive),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/testimoni');

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('[POST /api/testimonials] Error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan testimoni.' }, { status: 500 });
  }
}

