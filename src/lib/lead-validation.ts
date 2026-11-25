/**
 * Shared validation & normalization utilities for WhatsApp Lead Gate
 * Used on both client (WaLeadGateModal) and server (POST /api/leads).
 */

export type DomisiliOption = 'Batam' | 'Luar Batam / Kepri';

export const DOMISILI_OPTIONS: DomisiliOption[] = ['Batam', 'Luar Batam / Kepri'];

/**
 * Ekstrak label domisili dari kolom notes Lead (format: "Domisili: Batam").
 */
export function extractDomisili(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/^Domisili:\s*([^\n|]+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Normalisasi input nomor WhatsApp Indonesia menjadi hanya angka.
 * - Menghapus spasi, tanda hubung, kurung, titik, dan simbol lain.
 * - Menangani awalan +628... -> 628... dan 6208... -> 628...
 */
export function normalizeIndonesianPhone(raw: string): string {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('6208')) {
    digits = '628' + digits.slice(4);
  }
  return digits;
}

/**
 * Validasi Nama Lengkap:
 * - Wajib diisi, minimal 2 karakter
 * - Wajib mengandung minimal 2 huruf alfabet
 * - Tidak boleh karakter berulang identik (mis. "aaaa")
 */
export function validateLeadName(raw: string): string | null {
  const trimmed = String(raw || '').trim();
  if (trimmed.length < 2) {
    return 'Nama lengkap wajib diisi minimal 2 karakter.';
  }

  const letters = trimmed.match(/[a-zA-Z\u00C0-\u024F]/g) || [];
  if (letters.length < 2) {
    return 'Masukkan nama asli yang valid (minimal 2 huruf).';
  }

  const compact = trimmed.replace(/\s+/g, '');
  if (/^(.)\1+$/i.test(compact)) {
    return 'Mohon masukkan nama lengkap yang valid.';
  }

  return null;
}

const KNOWN_DUMMY_SEQUENCES = [
  '12345678',
  '123456789',
  '1234567890',
  '234567890',
  '987654321',
  '876543210',
  '00000000',
  '11111111',
];

/**
 * Validasi Nomor WhatsApp Indonesia:
 * - Hanya angka setelah normalisasi
 * - Minimal 10 digit, maksimal 15 digit
 * - Wajib diawali 08... atau 628...
 * - Menolak pola angka asal-asalan (digit berulang / urutan dummy)
 */
export function validateIndonesianWa(raw: string): {
  valid: boolean;
  cleaned: string;
  error?: string;
} {
  const cleaned = normalizeIndonesianPhone(raw);

  if (!cleaned) {
    return { valid: false, cleaned, error: 'Nomor WhatsApp wajib diisi.' };
  }

  if (cleaned.length < 10) {
    return {
      valid: false,
      cleaned,
      error: 'Nomor WhatsApp minimal 10 digit angka.',
    };
  }

  if (cleaned.length > 15) {
    return {
      valid: false,
      cleaned,
      error: 'Nomor WhatsApp maksimal 15 digit angka.',
    };
  }

  if (!/^(08|628)\d+$/.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'Format nomor WhatsApp Indonesia harus diawali 08... atau 628...',
    };
  }

  const subscriberPart = cleaned.startsWith('628')
    ? cleaned.slice(3)
    : cleaned.slice(2);

  // Tolak jika semua digit setelah prefix sama, atau ada >= 7 digit sama berturut-turut
  if (/^(\d)\1+$/.test(subscriberPart) || /(\d)\1{6,}/.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'Mohon masukkan nomor WhatsApp aktif yang valid.',
    };
  }

  // Tolak deret angka dummy yang umum dipakai iseng
  if (KNOWN_DUMMY_SEQUENCES.some((seq) => subscriberPart.includes(seq))) {
    return {
      valid: false,
      cleaned,
      error: 'Mohon masukkan nomor WhatsApp aktif yang valid.',
    };
  }

  return { valid: true, cleaned };
}
