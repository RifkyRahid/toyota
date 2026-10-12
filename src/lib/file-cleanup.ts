import fs from 'fs/promises';
import path from 'path';

/**
 * Menghapus file fisik yang diunggah ke disk (folder /public/uploads).
 * Aman dari path traversal dan hanya menghapus file dalam direktori uploads.
 *
 * @param fileUrl URL relatif file, contoh: "/uploads/1791445454115-55e4e8b1426e.webp"
 */
export async function deleteUploadedFile(fileUrl?: string | null): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string') return false;

  // Hanya proses file yang diawali /uploads/
  if (!fileUrl.startsWith('/uploads/')) return false;

  const filename = path.basename(fileUrl);
  // Tangkal path traversal
  if (!filename || filename.includes('..') || filename === '.' || filename === '/') {
    return false;
  }

  // Tentukan direktori upload
  const uploadDest = process.env.UPLOAD_DESTINATION ?? './public/uploads';
  const filePath = path.resolve(process.cwd(), uploadDest, filename);

  try {
    // Pastikan file berada di dalam folder yang dituju
    const resolvedUploadDir = path.resolve(process.cwd(), uploadDest);
    if (!filePath.startsWith(resolvedUploadDir)) {
      console.warn(`[File-Cleanup] Percobaan akses path di luar upload directory: ${filePath}`);
      return false;
    }

    await fs.unlink(filePath);
    console.log(`[File-Cleanup] Berhasil membersihkan file usang: ${filename}`);
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      console.warn(`[File-Cleanup] Gagal menghapus file ${filename}:`, error.message);
    }
    return false;
  }
}

/**
 * Menghapus kumpulan file yang diunggah sekaligus.
 */
export async function deleteUploadedFiles(fileUrls: (string | null | undefined)[]): Promise<void> {
  const validUrls = fileUrls.filter((u): u is string => Boolean(u && typeof u === 'string'));
  await Promise.allSettled(validUrls.map((url) => deleteUploadedFile(url)));
}

