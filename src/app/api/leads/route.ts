import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ── POST /api/leads ───────────────────────────────────────────
// Endpoint publik: menerima data prospek dari form Lead Gate.
// Tidak memerlukan autentikasi.
//
// Body (JSON):
// {
//   name: string,           -- Nama calon pembeli (wajib)
//   whatsapp: string,       -- Nomor WA format 08xx atau 628xx (wajib)
//   carInterest?: string,   -- Unit yang diminati
//   sourcePage?: string,    -- URL halaman asal form di-submit
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, whatsapp, carInterest, sourcePage } = body;

    // ── Validasi field wajib ────────────────────────────────
    if (!name?.trim() || !whatsapp?.trim()) {
      return NextResponse.json(
        { error: 'Nama dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    // ── Validasi format nomor WA ────────────────────────────
    const waPattern = /^(08|628)\d{7,12}$/;
    if (!waPattern.test(whatsapp.replace(/\s/g, ''))) {
      return NextResponse.json(
        {
          error:
            'Format nomor WhatsApp tidak valid. Gunakan format 08xx atau 628xx.',
        },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        carInterest: carInterest?.trim() ?? null,
        sourcePage: sourcePage?.trim() ?? null,
        status: 'BARU',
      },
    });

    return NextResponse.json(
      { message: 'Terima kasih! Kami akan segera menghubungi Anda.', id: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/leads] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan data. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

// ── GET /api/leads ────────────────────────────────────────────
// Endpoint admin: mengambil daftar prospek dengan filter & pagination.
// (Proteksi autentikasi akan ditambahkan di middleware.ts — Tahap 3)
//
// Query params:
//   - status: LeadStatus  (opsional)
//   - search: string      (opsional, cari nama/WA)
//   - page: number        (default: 1)
//   - limit: number       (default: 20, max: 100)
//   - from: ISO date      (opsional, filter tanggal mulai)
//   - to: ISO date        (opsional, filter tanggal akhir)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') as LeadStatus | null;
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10));
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { whatsapp: { contains: search } },
          { carInterest: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/leads] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data prospek.' },
      { status: 500 }
    );
  }
}

// ── PATCH /api/leads ──────────────────────────────────────────
// Update status atau catatan lead tunggal.
// Body: { id: string, status?: LeadStatus, notes?: string }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID lead wajib disertakan.' },
        { status: 400 }
      );
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Prospek tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/leads] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data prospek.' },
      { status: 500 }
    );
  }
}
