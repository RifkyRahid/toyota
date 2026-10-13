import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Endpoint khusus SUPERADMIN:
 * Membersihkan riwayat klik CTA / grafik jam sibuk yang terakumulasi selama proses testing/input unit.
 * Opsional: dapat menyertakan pembersihan leads testing jika includeLeads === true.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // Verifikasi otorisasi Superadmin
    if (!session || session.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Fitur ini hanya untuk Superadmin.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { includeLeads = false } = body;

    // Bersihkan seluruh riwayat klik CTA (acuan grafik jam sibuk)
    const deletedClicks = await prisma.ctaClick.deleteMany({});

    let deletedLeadsCount = 0;
    if (includeLeads) {
      const deletedLeads = await prisma.lead.deleteMany({});
      deletedLeadsCount = deletedLeads.count;
    }

    // Revalidasi dasbor admin
    revalidatePath('/admin/dashboard');

    return NextResponse.json({
      message: 'Riwayat analitik & grafik berhasil dibersihkan.',
      deletedClicks: deletedClicks.count,
      deletedLeads: deletedLeadsCount,
    });
  } catch (error) {
    console.error('[POST /api/admin/analytics/reset] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membersihkan riwayat grafik analitik.' },
      { status: 500 }
    );
  }
}

