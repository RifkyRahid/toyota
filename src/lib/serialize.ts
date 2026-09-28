/**
 * Helper untuk serialisasi nilai BigInt sebelum dikembalikan sebagai JSON response.
 *
 * Masalah: JSON.stringify() tidak dapat memproses nilai BigInt secara native
 * dan akan melempar error "Do not know how to serialize a BigInt".
 *
 * Solusi: Konversi setiap nilai BigInt ke String sebelum JSON.parse ulang.
 * Nilai harga (price, startingPrice) yang bernilai ratusan juta akan
 * direpresentasikan sebagai string di sisi klien.
 *
 * Penggunaan di route handler:
 * @example
 * const cars = await prisma.carModel.findMany({ include: { variants: true } });
 * return NextResponse.json(serializeBigInt(cars));
 */
export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
