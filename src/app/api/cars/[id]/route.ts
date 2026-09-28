import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/cars/[id] ────────────────────────────────────────
// Mengambil detail satu model mobil beserta semua variannya.
// Mendukung pencarian berdasarkan id CUID atau slug.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const car = await prisma.carModel.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        variants: { orderBy: { price: 'asc' } },
      },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(car));
  } catch (error) {
    console.error('[GET /api/cars/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail mobil.' },
      { status: 500 }
    );
  }
}

// ── PUT /api/cars/[id] ────────────────────────────────────────
// Memperbarui data model mobil. Jika array `variants` disertakan,
// operasinya adalah REPLACE FULL (hapus lama, buat baru) untuk
// menjaga konsistensi data varian.
// Body: Semua field CarModel bersifat opsional + variants?: []
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
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
      variants,
    } = body;

    // ── Pastikan mobil ada ─────────────────────────────────
    const existing = await prisma.carModel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan.' },
        { status: 404 }
      );
    }

    // ── Cek slug unik jika diubah ─────────────────────────
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.carModel.findUnique({ where: { slug } });
      if (slugConflict) {
        return NextResponse.json(
          { error: `Slug "${slug}" sudah digunakan oleh mobil lain.` },
          { status: 409 }
        );
      }
    }

    // ── Hitung startingPrice dari variants baru (jika ada) ─
    let finalStartingPrice: bigint | undefined;
    if (variants && variants.length > 0) {
      finalStartingPrice = BigInt(
        Math.min(...variants.map((v: { price: number }) => v.price))
      );
    } else if (startingPrice !== undefined) {
      finalStartingPrice = BigInt(startingPrice);
    }

    // ── Update dalam transaksi: model + replace variants ──
    const updatedCar = await prisma.$transaction(async (tx) => {
      // Replace variants jika disertakan
      if (variants !== undefined) {
        await tx.carVariant.deleteMany({ where: { carModelId: id } });
        if (variants.length > 0) {
          await tx.carVariant.createMany({
            data: variants.map(
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
                carModelId: id,
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
          });
        }
      }

      // Update model
      return tx.carModel.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(category && { category }),
          ...(heroImage && { heroImage }),
          ...(finalStartingPrice !== undefined && {
            startingPrice: finalStartingPrice,
          }),
          ...(isPromo !== undefined && { isPromo }),
          ...(promoLabel !== undefined && { promoLabel }),
          ...(brochurePdfUrl !== undefined && { brochurePdfUrl }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(isActive !== undefined && { isActive }),
        },
        include: { variants: { orderBy: { price: 'asc' } } },
      });
    });

    // ── Revalidasi cache halaman publik ────────────────────
    revalidatePath('/');
    revalidatePath('/daftar-harga');
    revalidatePath(`/mobil/${updatedCar.slug}`);

    return NextResponse.json(serializeBigInt(updatedCar));
  } catch (error) {
    console.error('[PUT /api/cars/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data mobil.' },
      { status: 500 }
    );
  }
}

// ── DELETE /api/cars/[id] ─────────────────────────────────────
// Menghapus model mobil beserta semua variannya (Cascade via schema).
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const existing = await prisma.carModel.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Mobil tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.carModel.delete({ where: { id } });

    // ── Revalidasi cache ───────────────────────────────────
    revalidatePath('/');
    revalidatePath('/daftar-harga');
    revalidatePath(`/mobil/${existing.slug}`);

    return NextResponse.json({ message: 'Mobil berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /api/cars/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data mobil.' },
      { status: 500 }
    );
  }
}
