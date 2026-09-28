import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import { CarCategory } from '@prisma/client';

// ── GET /api/cars ─────────────────────────────────────────────
// Mengambil daftar semua model mobil beserta variannya.
// Query params:
//   - category: CarCategory  (opsional, filter kategori)
//   - active: "true" | "false"  (opsional, default: tampilkan semua)
//   - includeVariants: "true" | "false" (opsional, default: false)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') as CarCategory | null;
    const active = searchParams.get('active');
    const includeVariants = searchParams.get('includeVariants') === 'true';

    const cars = await prisma.carModel.findMany({
      where: {
        ...(category && { category }),
        ...(active !== null && { isActive: active === 'true' }),
      },
      include: {
        variants: includeVariants
          ? { orderBy: { price: 'asc' } }
          : false,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(serializeBigInt(cars));
  } catch (error) {
    console.error('[GET /api/cars] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data katalog mobil.' },
      { status: 500 }
    );
  }
}

// ── POST /api/cars ────────────────────────────────────────────
// Membuat model mobil baru beserta variannya sekaligus (relasi nested).
// Body (JSON):
// {
//   name, slug, category, heroImage, startingPrice,
//   isPromo?, promoLabel?, brochurePdfUrl?, displayOrder?, isActive?,
//   variants: [{ name, price, image?, keyFeatures?, engineType?, ... }]
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      category,
      heroImage,
      startingPrice,
      isPromo,
      promoLabel,
      brochurePdfUrl,
      displayOrder,
      isActive,
      variants = [],
    } = body;

    // ── Validasi field wajib ────────────────────────────────
    if (!name || !slug || !heroImage || startingPrice === undefined) {
      return NextResponse.json(
        { error: 'Field wajib tidak lengkap: name, slug, heroImage, startingPrice.' },
        { status: 400 }
      );
    }

    // ── Cek duplikat slug ───────────────────────────────────
    const existing = await prisma.carModel.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan. Gunakan slug yang berbeda.` },
        { status: 409 }
      );
    }

    // ── Hitung startingPrice dari variants jika tidak disupply ─
    const computedStartingPrice =
      variants.length > 0
        ? Math.min(...variants.map((v: { price: number }) => v.price))
        : Number(startingPrice);

    // ── Buat CarModel + variants dalam satu transaksi ───────
    const car = await prisma.carModel.create({
      data: {
        name,
        slug,
        category: category ?? 'MPV',
        heroImage,
        startingPrice: BigInt(computedStartingPrice),
        isPromo: isPromo ?? false,
        promoLabel: promoLabel ?? null,
        brochurePdfUrl: brochurePdfUrl ?? null,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        variants: {
          create: variants.map(
            (v: {
              name: string;
              price: number;
              image?: string;
              keyFeatures?: string[];
              engineType?: string;
              displacement?: number;
              transmission?: string;
              fuelType?: string;
              maxPower?: string;
              maxTorque?: string;
              seatingCapacity?: number;
            }) => ({
              name: v.name,
              price: BigInt(v.price),
              image: v.image ?? null,
              keyFeatures: v.keyFeatures ?? [],
              engineType: v.engineType ?? null,
              displacement: v.displacement ?? null,
              transmission: v.transmission ?? null,
              fuelType: v.fuelType ?? null,
              maxPower: v.maxPower ?? null,
              maxTorque: v.maxTorque ?? null,
              seatingCapacity: v.seatingCapacity ?? null,
            })
          ),
        },
      },
      include: { variants: true },
    });

    // ── Revalidasi halaman publik ───────────────────────────
    revalidatePath('/');
    revalidatePath('/daftar-harga');

    return NextResponse.json(serializeBigInt(car), { status: 201 });
  } catch (error) {
    console.error('[POST /api/cars] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat data mobil baru.' },
      { status: 500 }
    );
  }
}
