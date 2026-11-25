import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { validateIndonesianWa, validateLeadName } from '@/lib/lead-validation';

export const dynamic = 'force-dynamic';

// ── Rate Limiter untuk Form Lead Publik (Anti-Spam Bot) ───────
const leadRateMap = new Map<string, { count: number; resetAt: number }>();

function checkLeadRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = leadRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    leadRateMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); // 10 menit
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

// ── POST /api/leads ───────────────────────────────────────────
// Endpoint publik: menerima data prospek dari form Lead Gate.
// Tidak memerlukan autentikasi, dilengkapi rate-limit & validasi anti-spam.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      whatsapp,
      carInterest,
      sourcePage,
      domisili,
      leadSource,
      website, // hidden honeypot field
    } = body;

    // ── 1. Honeypot check (saring bot otomatis) ───────────────
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json(
        { error: 'Permintaan tidak dapat diproses.' },
        { status: 400 }
      );
    }

    // ── 2. Rate limiting per IP ───────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!checkLeadRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak pengiriman formulir. Silakan coba beberapa saat lagi.' },
        { status: 429 }
      );
    }

    // ── 3. Validasi Nama & Nomor WhatsApp ─────────────────────
    const nameError = validateLeadName(name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const waCheck = validateIndonesianWa(whatsapp);
    if (!waCheck.valid) {
      return NextResponse.json(
        { error: waCheck.error || 'Format nomor WhatsApp tidak valid.' },
        { status: 400 }
      );
    }

    // ── 4. Format catatan domisili & sumber klik (zero-migration) ──
    const cleanDomisili =
      typeof domisili === 'string' && domisili.trim() !== ''
        ? domisili.trim().slice(0, 50)
        : null;

    const cleanSourcePageBase = sourcePage ? String(sourcePage).trim() : '';
    const cleanLeadSource = leadSource ? String(leadSource).trim() : '';
    const combinedSourcePage =
      cleanLeadSource && !cleanSourcePageBase.includes(cleanLeadSource)
        ? `${cleanSourcePageBase || '/'} [${cleanLeadSource}]`
        : cleanSourcePageBase || null;

    const lead = await prisma.lead.create({
      data: {
        name: String(name).trim().slice(0, 100),
        whatsapp: waCheck.cleaned.slice(0, 20),
        carInterest: carInterest ? String(carInterest).trim().slice(0, 100) : null,
        sourcePage: combinedSourcePage ? combinedSourcePage.slice(0, 200) : null,
        notes: cleanDomisili ? `Domisili: ${cleanDomisili}` : null,
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

// ── DELETE /api/leads ─────────────────────────────────────────
// Hapus satu atau banyak data prospek (misal data testing).
// Body: { id?: string, ids?: string[] }
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Akses ditolak. Sesi admin tidak valid.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const singleId = typeof body?.id === 'string' ? body.id.trim() : '';
    const rawIds = Array.isArray(body?.ids)
      ? body.ids.filter((item: unknown): item is string => typeof item === 'string' && item.trim() !== '')
      : [];

    const targetIds = singleId ? [singleId] : rawIds;
    if (targetIds.length === 0) {
      return NextResponse.json(
        { error: 'ID prospek yang akan dihapus wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await prisma.lead.deleteMany({
      where: {
        id: { in: targetIds },
      },
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');

    return NextResponse.json({
      message: `${result.count} data prospek berhasil dihapus.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('[DELETE /api/leads] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data prospek.' },
      { status: 500 }
    );
  }
}
