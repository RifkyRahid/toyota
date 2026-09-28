import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Tipe payload per-varian dari request body
interface BulkPriceItem {
  id: string;    // CarVariant.id
  price: number; // Harga OTR baru dalam Rupiah (integer penuh)
}

// ── PUT /api/cars/bulk-price ──────────────────────────────────
// Memperbarui harga OTR massal untuk banyak varian sekaligus.
// Menggunakan prisma.$transaction agar bersifat atomik — jika satu
// update gagal, seluruh perubahan dibatalkan (rollback otomatis).
//
// Setelah update varian, otomatis menyinkronisasi field startingPrice
// pada CarModel terkait (diambil dari harga varian terendah).
//
// Body: [{ id: "variant-cuid", price: 437700000 }, ...]
export async function PUT(req: NextRequest) {
  try {
    const updates: BulkPriceItem[] = await req.json();

    // ── Validasi payload ────────────────────────────────────
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Payload tidak valid. Kirim array berisi minimal 1 item.' },
        { status: 400 }
      );
    }

    for (const item of updates) {
      if (!item.id || typeof item.price !== 'number' || item.price <= 0) {
        return NextResponse.json(
          {
            error: `Item tidak valid: id="${item.id}", price=${item.price}. Harga harus berupa angka positif.`,
          },
          { status: 400 }
        );
      }
    }

    // ── Eksekusi update massal dalam satu transaksi atomik ──
    await prisma.$transaction(
      updates.map((item) =>
        prisma.carVariant.update({
          where: { id: item.id },
          data: { price: BigInt(item.price) },
        })
      )
    );

    // ── Sinkronisasi startingPrice pada CarModel terkait ───
    // Ambil daftar carModelId yang variannya baru diupdate
    const affectedVariants = await prisma.carVariant.findMany({
      where: { id: { in: updates.map((u) => u.id) } },
      select: { carModelId: true },
      distinct: ['carModelId'],
    });

    // Update startingPrice setiap model dengan harga varian terendah
    await Promise.all(
      affectedVariants.map(async ({ carModelId }) => {
        const minResult = await prisma.carVariant.aggregate({
          where: { carModelId },
          _min: { price: true },
        });

        if (minResult._min.price !== null) {
          await prisma.carModel.update({
            where: { id: carModelId },
            data: { startingPrice: minResult._min.price },
          });
        }
      })
    );

    // ── Revalidasi cache halaman publik ────────────────────
    revalidatePath('/');
    revalidatePath('/daftar-harga');

    return NextResponse.json({
      message: `Harga OTR ${updates.length} varian berhasil diperbarui.`,
    });
  } catch (error) {
    console.error('[PUT /api/cars/bulk-price] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui harga. Semua perubahan telah dibatalkan.' },
      { status: 500 }
    );
  }
}
