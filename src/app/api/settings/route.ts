import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// ── GET /api/settings ─────────────────────────────────────────
// Mengambil data pengaturan diler & profil sales (baris singleton id=1).
// Endpoint ini bisa dipanggil dari Server Component publik (logo, WA, dll).
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'Pengaturan belum diinisialisasi. Jalankan perintah: npm run db:seed' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[GET /api/settings] Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan diler.' },
      { status: 500 }
    );
  }
}

// ── PUT /api/settings ─────────────────────────────────────────
// Memperbarui pengaturan diler (upsert pada id=1).
// Semua field bersifat opsional — hanya field yang dikirim yang diperbarui.
// (Proteksi autentikasi via middleware — Tahap 3)
//
// Body (JSON) — semua opsional kecuali saat create pertama kali:
// {
//   dealershipName?, dealershipAddress?, googleMapsUrl?,
//   salesName?, salesTitle?, salesPhone?, salesWhatsapp?,
//   salesPhotoUrl?, salesBio?,
//   headerLogoUrl?, footerLogoUrl?, faviconUrl?, pricelistPdfUrl?,
//   instagramUrl?, facebookUrl?, tiktokUrl?
// }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Destrukturisasi semua field yang mungkin dikirim
    const {
      dealershipName,
      dealershipAddress,
      googleMapsUrl,
      salesName,
      salesTitle,
      salesPhone,
      salesWhatsapp,
      salesPhotoUrl,
      salesBio,
      headerLogoUrl,
      footerLogoUrl,
      faviconUrl,
      pricelistPdfUrl,
      instagramUrl,
      facebookUrl,
      tiktokUrl,
    } = body;

    // Bangun objek update — hanya field yang tidak undefined
    const updateData: Record<string, unknown> = {};
    if (dealershipName !== undefined) updateData.dealershipName = dealershipName;
    if (dealershipAddress !== undefined) updateData.dealershipAddress = dealershipAddress;
    if (googleMapsUrl !== undefined) updateData.googleMapsUrl = googleMapsUrl;
    if (salesName !== undefined) updateData.salesName = salesName;
    if (salesTitle !== undefined) updateData.salesTitle = salesTitle;
    if (salesPhone !== undefined) updateData.salesPhone = salesPhone;
    if (salesWhatsapp !== undefined) updateData.salesWhatsapp = salesWhatsapp;
    if (salesPhotoUrl !== undefined) updateData.salesPhotoUrl = salesPhotoUrl;
    if (salesBio !== undefined) updateData.salesBio = salesBio;
    if (headerLogoUrl !== undefined) updateData.headerLogoUrl = headerLogoUrl;
    if (footerLogoUrl !== undefined) updateData.footerLogoUrl = footerLogoUrl;
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;
    if (pricelistPdfUrl !== undefined) updateData.pricelistPdfUrl = pricelistPdfUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada field yang dikirim untuk diperbarui.' },
        { status: 400 }
      );
    }

    // Upsert: update jika ada, create jika belum ada (id selalu 1)
    const settings = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        dealershipName: dealershipName ?? 'Agung Toyota Batam',
        dealershipAddress: dealershipAddress ?? '',
        salesName: salesName ?? '',
        salesTitle: salesTitle ?? 'Certified Sales Executive',
        salesPhone: salesPhone ?? '',
        salesWhatsapp: salesWhatsapp ?? '',
        salesPhotoUrl: salesPhotoUrl ?? '/images/sales-default.webp',
        headerLogoUrl: headerLogoUrl ?? '/images/toyota-logo.webp',
        footerLogoUrl: footerLogoUrl ?? '/images/toyota-logo-white.webp',
        faviconUrl: faviconUrl ?? '/favicon.ico',
        pricelistPdfUrl: pricelistPdfUrl ?? '/uploads/pricelist-batam-2026.pdf',
        ...updateData,
      },
    });

    // ── Revalidasi seluruh layout publik ───────────────────
    revalidatePath('/', 'layout');

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[PUT /api/settings] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pengaturan diler.' },
      { status: 500 }
    );
  }
}
