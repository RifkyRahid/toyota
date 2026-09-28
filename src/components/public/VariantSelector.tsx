'use client';

import { useState } from 'react';
import Image from 'next/image';
import { buildWaUrl, formatRupiah } from '@/lib/format';
import type { SerializedCarVariant } from '@/types';

interface VariantSelectorProps {
  variants: SerializedCarVariant[];
  heroImage: string;
  carName: string;
  salesWhatsapp: string;
  onVariantChange?: (variant: SerializedCarVariant) => void;
}

export default function VariantSelector({
  variants,
  heroImage,
  carName,
  salesWhatsapp,
  onVariantChange,
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<SerializedCarVariant>(
    variants[0]
  );

  const handleSelect = (variant: SerializedCarVariant) => {
    setSelectedVariant(variant);
    onVariantChange?.(variant);
  };

  const buildWaMessage = (variant: SerializedCarVariant) =>
    `Halo, saya tertarik dengan Toyota ${carName} varian ${variant.name}. Bisa minta info harga OTR Batam dan promo terbaru?`;

  if (variants.length === 0) {
    return (
      <p className="text-gray-500 text-sm">Varian belum tersedia untuk model ini.</p>
    );
  }

  const CardContent = ({ variant }: { variant: SerializedCarVariant }) => {
    const isActive = selectedVariant.id === variant.id;
    const imageSrc = variant.image ?? heroImage;

    return (
      <button
        type="button"
        onClick={() => handleSelect(variant)}
        className={`text-left rounded-lg border-2 p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
          isActive
            ? 'border-red-600 bg-red-50'
            : 'border-gray-200 hover:border-gray-400 bg-white'
        }`}
      >
        {/* Variant Image */}
        <div className="relative w-full h-36 mb-3 bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={imageSrc}
            alt={variant.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 280px, 33vw"
          />
        </div>

        {/* Variant Name */}
        <p className="font-bold text-gray-900 text-sm mb-1">{variant.name}</p>

        {/* Price */}
        <p className="text-red-600 font-bold text-xl mb-3">
          {formatRupiah(variant.price)}
        </p>

        {/* Key Features Pills */}
        {variant.keyFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {variant.keyFeatures.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* WA Button */}
        <a
          href={buildWaUrl(salesWhatsapp, buildWaMessage(variant))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="block w-full text-center bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tanya Harga WA
        </a>
      </button>
    );
  };

  return (
    <>
      {/* Desktop grid — hidden on mobile */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => (
          <CardContent key={variant.id} variant={variant} />
        ))}
      </div>

      {/* Mobile horizontal scroll carousel */}
      <div className="flex md:hidden overflow-x-auto gap-4 snap-x snap-mandatory pb-4 -mx-4 px-4">
        {variants.map((variant) => (
          <div key={variant.id} className="snap-start min-w-[280px] flex-shrink-0">
            <CardContent variant={variant} />
          </div>
        ))}
      </div>
    </>
  );
}
