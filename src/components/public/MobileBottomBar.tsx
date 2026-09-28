'use client';

import { buildWaUrl, formatRupiah } from '@/lib/format';

interface MobileBottomBarProps {
  price: string;
  carName: string;
  variantName: string;
  salesWhatsapp: string;
}

export default function MobileBottomBar({
  price,
  carName,
  variantName,
  salesWhatsapp,
}: MobileBottomBarProps) {
  const waMessage = `Halo, saya tertarik dengan Toyota ${carName} varian ${variantName}. Bisa minta info harga OTR Batam?`;
  const waUrl = buildWaUrl(salesWhatsapp, waMessage);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Harga */}
        <div>
          <p className="text-xs text-gray-500">Harga OTR Batam</p>
          <p className="text-lg font-bold text-red-600">{formatRupiah(price)}</p>
        </div>

        {/* CTA WA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
        >
          Tanya WA
        </a>
      </div>
    </div>
  );
}
