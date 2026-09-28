/**
 * Utility functions untuk pemformatan data di seluruh aplikasi.
 */

/**
 * Format angka / string angka ke format Rupiah (ID locale).
 * Contoh: formatRupiah('300000000') → 'Rp 300.000.000'
 */
export function formatRupiah(value: string | number): string {
  return 'Rp ' + Number(value).toLocaleString('id-ID');
}

/**
 * Buat URL WhatsApp dengan nomor dan pesan yang sudah di-encode.
 * Nomor harus dalam format internasional, misal: '6281234567890'
 */
export function buildWaUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
