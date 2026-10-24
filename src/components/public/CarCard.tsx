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
    <div className="group bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col overflow-hidden">
      {/* ── Image section ── */}
      <div className="relative bg-gradient-to-b from-gray-50/80 to-gray-50/20 w-full h-36 sm:h-40 md:h-44 flex items-center justify-center p-3 overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={car.heroImage}
            alt={car.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </div>

      {/* ── Info section ── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 gap-1.5">
        {/* Category pill */}
        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
          {car.category.replace('_', ' ')}
        </span>

        {/* Car name */}
        <h3 className="text-gray-900 font-bold text-base md:text-lg leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
          {car.name}
        </h3>

        {/* Price */}
        <div className="mt-0.5">
          <p className="text-gray-400 text-[11px]">Harga OTR Mulai</p>
          <p className="text-red-600 font-bold text-base sm:text-lg leading-tight">
            {formatRupiah(car.startingPrice)}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-auto pt-3 flex gap-2">
          <Link
            href={`/mobil/${car.slug}`}
            className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            Lihat Detail
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClickToWa({ source_button: 'KATALOG_CARD', car_name: car.name })}
            className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            Tanya WA
          </a>
        </div>
      </div>
    </div>
  );
}
