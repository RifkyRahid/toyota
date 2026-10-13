'use client';

import { useState } from 'react';
import Image from 'next/image';
import { buildWaUrl, formatRupiah } from '@/lib/format';
import type { SerializedCarVariant } from '@/types';
import { trackClickToWa } from '@/lib/analytics';
import { Check, ChevronRight } from 'lucide-react';

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

  const selectedIndex = variants.findIndex((v) => v.id === selectedVariant.id);

  return (
    <div>
      {/* ── Desktop Grid Layout (Layar md ke atas) ─────────────── */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
        {variants.map((variant) => {
          const isActive = selectedVariant.id === variant.id;
          const imageSrc = variant.image ?? heroImage;

          return (
            <div
              key={variant.id}
              onClick={() => handleSelect(variant)}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'border-red-600 bg-red-50/40 shadow-sm ring-2 ring-red-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header Card: Status */}
                <div className="flex items-center justify-between mb-2 min-h-[24px]">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Tipe Terpilih
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      Klik untuk pilih
                    </span>
                  )}
                </div>

                {/* Gambar Varian */}
                <div className="relative w-full h-40 mb-3 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                  <Image
                    src={imageSrc}
                    alt={variant.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 280px, 33vw"
                  />
                </div>

                {/* Nama & Harga Varian */}
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {variant.name}
                </h3>
                <p className="text-red-600 font-extrabold text-xl mb-3">
                  {formatRupiah(variant.price)}
                </p>

                {/* Fitur Utama */}
                {variant.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {variant.keyFeatures.slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-md font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tombol Tanya WA */}
              <a
                href={buildWaUrl(salesWhatsapp, buildWaMessage(variant))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackClickToWa({
                    source_button: 'VARIAN_DETAIL',
                    car_name: `${carName} ${variant.name}`,
                  });
                }}
                className="mt-2 block w-full text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Tanya Promo WA
              </a>
            </div>
          );
        })}
      </div>

      {/* ── Mobile Layout (Tanpa Scroll Horizontal, Susunan Vertikal Modern) ── */}
      <div className="block md:hidden space-y-5">
        {/* 1. Spotlight Card: Varian yang Sedang Dipilih */}
        <div className="bg-white rounded-2xl border-2 border-red-600 shadow-sm p-4 overflow-hidden relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              <Check className="w-3.5 h-3.5" />
              Tipe Terpilih
            </span>
            {variants.length > 1 && (
              <span className="text-xs text-gray-500 font-medium">
                Pilihan {selectedIndex >= 0 ? selectedIndex + 1 : 1} dari {variants.length} Tipe
              </span>
            )}
          </div>

          {/* Foto Varian Aktif */}
          <div className="relative w-full h-44 bg-gradient-to-b from-gray-50 to-gray-100/70 rounded-xl overflow-hidden my-2 flex items-center justify-center border border-gray-100">
            <Image
              src={selectedVariant.image ?? heroImage}
              alt={selectedVariant.name}
              fill
              className="object-contain p-2"
              sizes="100vw"
              priority
            />
          </div>

          {/* Info Varian Aktif */}
          <div className="mt-3">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              {selectedVariant.name}
            </h3>
            <div className="mt-1 mb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Harga OTR Batam
              </span>
              <span className="text-2xl font-black text-red-600 tracking-tight">
                {formatRupiah(selectedVariant.price)}
              </span>
            </div>

            {/* Fitur Unggulan Varian Aktif */}
            {selectedVariant.keyFeatures.length > 0 && (
              <div className="pt-2 border-t border-gray-100 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Fitur Unggulan Tipe Ini:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVariant.keyFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-md font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* WA Button untuk Varian Aktif */}
            <a
              href={buildWaUrl(salesWhatsapp, buildWaMessage(selectedVariant))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackClickToWa({
                  source_button: 'VARIAN_DETAIL',
                  car_name: `${carName} ${selectedVariant.name}`,
                });
              }}
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.072-.511-1.636-.677-2.703-2.348-2.784-2.458-.083-.11-.664-.882-.664-1.682 0-.8.419-1.194.568-1.353.149-.16.326-.2.434-.2.109 0 .217.001.312.006.1.005.234-.038.365.279.136.329.464 1.134.505 1.218.041.084.068.182.013.292-.054.11-.082.179-.163.273-.082.095-.172.212-.246.284-.082.08-.168.167-.072.332.096.165.426.702.914 1.137.629.56 1.159.734 1.324.815.165.082.261.072.359-.041.098-.112.42-491.533-.66.113-.169.226-.14.37-.087.144.053.913.431 1.071.51.157.079.263.118.301.185.039.066.039.384-.105.789z" />
              </svg>
              <span>Konsultasi &amp; Penawaran Tipe Ini</span>
            </a>
          </div>
        </div>

        {/* 2. Daftar Semua Tipe / Varian (Vertical Stack) */}
        {variants.length > 1 && (
          <div className="pt-2">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-900">
                Pilih Tipe / Varian Lainnya
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Ketuk varian di bawah untuk melihat foto, harga &amp; spesifikasinya:
              </p>
            </div>

            <div className="space-y-2.5">
              {variants.map((v) => {
                const isItemActive = selectedVariant.id === v.id;
                const itemImg = v.image ?? heroImage;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelect(v)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center gap-3 border ${
                      isItemActive
                        ? 'border-2 border-red-600 bg-red-50/60 ring-1 ring-red-600/30 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isItemActive
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isItemActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-14 h-11 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      <Image
                        src={itemImg}
                        alt={v.name}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>

                    {/* Title & Price */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-bold text-sm truncate ${
                          isItemActive ? 'text-red-700' : 'text-gray-900'
                        }`}
                      >
                        {v.name}
                      </p>
                      <p className="text-red-600 font-extrabold text-sm">
                        {formatRupiah(v.price)}
                      </p>
                    </div>

                    {/* Status Pill or Chevron */}
                    {isItemActive ? (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        Aktif
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-gray-400 flex items-center gap-0.5">
                        Pilih <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
