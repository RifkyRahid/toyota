import { NextRequest, NextResponse } from 'next/server';
import sharp, { type Sharp } from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';

// ── Konfigurasi ────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const WEBP_QUALITY = 80;

// Batas lebar maksimal sesuai 1_ARCHITECTURE_STACK.md §3.B
const MAX_WIDTH_BANNER = 1920;
const MAX_WIDTH_CAR = 1080;
const MAX_WIDTH_LOGO = 800;

type UploadContext = 'banner' | 'car' | 'general' | 'logo';

function getMaxWidth(context: UploadContext): number {
  if (context === 'banner') return MAX_WIDTH_BANNER;
  if (context === 'car') return MAX_WIDTH_CAR;
  if (context === 'logo') return MAX_WIDTH_LOGO;
  return MAX_WIDTH_CAR; // default
}

// Resolusi direktori upload dari env, fallback ke ./public/uploads
function getUploadDir(): string {
  return process.env.UPLOAD_DESTINATION ?? './public/uploads';
}

/**
 * POST /api/upload
 *
 * Body: multipart/form-data
 *   - file: File (image/jpeg | image/png | image/webp)
 *   - context?: "banner" | "car" | "general"  (opsional, default: "car")
 *
 * Response: { url: "/uploads/filename.webp" }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const context = (formData.get('context') as UploadContext) ?? 'car';

    // ── 1. Validasi: file harus ada dan berupa File object ────
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah.' },
        { status: 400 }
      );
    }

    // ── 2. Validasi ukuran file (Maks 10 MB) ───────────────────
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10 MB.' },
        { status: 413 }
      );
    }

    // ── 3. Validasi MIME Type ─────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipe file tidak didukung. Hanya menerima: ${ALLOWED_MIME_TYPES.join(', ')}.`,
        },
        { status: 415 }
      );
    }

    // ── 3. Konversi ke Buffer ─────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── 4. Validasi buffer via sharp (menangkal file palsu) ───
    let sharpInstance: Sharp;
    try {
      sharpInstance = sharp(buffer);
      await sharpInstance.metadata(); // Akan throw jika bukan gambar valid
    } catch {
      return NextResponse.json(
        { error: 'File tidak dapat diproses sebagai gambar yang valid.' },
        { status: 422 }
      );
    }

    // ── 5. Resize + Konversi ke WebP ──────────────────────────
    const maxWidth = getMaxWidth(context);

    // Otomatis trim ruang kosong (padding transparan/putih) jika context adalah logo
    if (context === 'logo') {
      sharpInstance = sharpInstance.trim();
    }

    const processedBuffer = await sharpInstance
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    // ── 6. Generate nama file unik berbasis timestamp + hash ──
    const hash = crypto.randomBytes(6).toString('hex');
    const filename = `${Date.now()}-${hash}.webp`;

    // ── 7. Pastikan direktori upload ada ──────────────────────
    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    // ── 8. Simpan file ke disk ────────────────────────────────
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, processedBuffer);

    // ── 9. Kembalikan URL relatif standar ─────────────────────
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/upload] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses upload. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
