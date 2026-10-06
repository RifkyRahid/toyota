'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { SerializedCarModel } from '@/types';
import { trackClickToWa } from '@/lib/analytics';

// ── Helper ────────────────────────────────────────────────────
/**
 * Format angka ke format Rupiah.
 * Menerima string, number, atau bigint.
 * Contoh: 437700000 → "Rp 437.700.000"
 */
export function formatRupiah(price: string | number | bigint): string {
  const num = typeof price === 'bigint' ? Number(price) : Number(price);
  if (isNaN(num)) return 'Rp –';
  return 'Rp ' + num.toLocaleString('id-ID');
}

// ── Props ────────────────────────────────────────────────────
interface CarCardProps {
  car: SerializedCarModel;
  salesWhatsapp: string;
}

// ── Component ─────────────────────────────────────────────────
export default function CarCard({ car, salesWhatsapp }: CarCardProps) {
  // Build context-aware WA link
  const waMessage = encodeURIComponent(
    `Halo Agung Toyota Batam, saya tertarik informasi unit *${car.name}* OTR Batam.`
  );
  // Normalise WA number — remove leading + if present
  const waNumber = salesWhatsapp.replace(/^\+/, '');
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* ── Image section ── */}
      <div className="relative bg-gray-50 w-full aspect-[4/3] flex items-center justify-center">
        <Image
          src={car.heroImage}
          alt={car.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* PROMO badge */}
        {car.isPromo && (
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              PROMO
            </span>
            {car.promoLabel && (
              <span className="bg-red-600/90 text-white text-xs font-semibold px-2 py-0.5 rounded">
                {car.promoLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Info section ── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category pill */}
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {car.category.replace('_', ' ')}
        </span>

        {/* Car name */}
        <h3 className="text-gray-900 font-bold text-lg leading-snug line-clamp-2">
          {car.name}
        </h3>

        {/* Price */}
        <div className="mt-1">
          <p className="text-gray-500 text-xs">Harga OTR Mulai</p>
          <p className="text-red-600 font-bold text-lg leading-tight">
            {formatRupiah(car.startingPrice)}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-auto pt-3 flex gap-2">
          <Link
            href={`/mobil/${car.slug}`}
            className="flex-1 text-center border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Lihat Detail
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClickToWa({ source_button: 'KATALOG_CARD', car_name: car.name })}
            className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Tanya WA
          </a>
        </div>
      </div>
    </div>
  );
}
