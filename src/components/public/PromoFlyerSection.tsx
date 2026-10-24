'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Maximize2,
  X,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import type { PromoFlyerItem } from '@/types';
import { trackClickToWa } from '@/lib/analytics';

// ── Reusable Poster Canvas (Dipakai di Publik, Lightbox, & Live Preview Admin) ──
export function FlyerPosterCanvas({
  flyer,
  isLarge = false,
}: {
  flyer: Partial<PromoFlyerItem>;
  isLarge?: boolean;
}) {
  const mode = flyer.mode || 'AUTO';
  const theme = flyer.theme || 'RED_WHITE';
  const title = flyer.title || 'Toyota Impian Anda';
  const eventTag = flyer.eventTag || 'TOYOTA SPEKTAKULER';
  const subtitle = flyer.subtitle || 'OTR Batam • Syarat & Ketentuan Berlaku';
  const h1Label = flyer.highlight1Label || 'Cicilan Mulai';
  const h1Value = flyer.highlight1Value || '3 Jtan';
  const h2Label = flyer.highlight2Label || 'DP Mulai';
  const h2Value = flyer.highlight2Value || '15%';
  const benefits =
    flyer.benefits && flyer.benefits.length > 0
      ? flyer.benefits
      : ['Bunga 0%', 'Cash Bertahap 50:50', 'Gratis Aksesoris', 'Trade-In All Brand'];

  // Opsi 1: Mode Upload Gambar Poster Siap Pakai (Tampil 100% Utuh Tanpa Terpotong)
  if (mode === 'IMAGE') {
    return (
      <div className="relative w-full bg-zinc-900 overflow-hidden select-none flex items-center justify-center">
        {flyer.customImageUrl ? (
          <img
            src={flyer.customImageUrl}
            alt={`${title} - ${eventTag}`}
            className="w-full h-auto block object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full aspect-[4/5] flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
            <Sparkles size={32} className="mb-2 text-red-500 opacity-70" />
            <p className="text-xs font-semibold">Belum ada gambar poster diunggah</p>
            <p className="text-[11px] text-zinc-500 mt-1">Poster akan tampil utuh sesuai rasio aslinya</p>
          </div>
        )}
      </div>
    );
  }

  // Opsi 2: Mode Auto-Flyer (Desain Otomatis Korporat Senada Website)
  const isDark = theme === 'DARK_LUXURY';
  const isSilver = theme === 'SILVER_SPORT';

  const bgClasses = isDark
    ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white'
    : isSilver
    ? 'bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200 text-zinc-900'
    : 'bg-gradient-to-br from-white via-zinc-50/90 to-zinc-100 text-zinc-900';

  return (
    <div
      className={`relative w-full aspect-[4/5] overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none ${bgClasses}`}
    >
      {/* Dekorasi Korporat Minimalis (Tidak Norak, Bersih & Modern) */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl ${
          isDark ? 'bg-red-600/20' : 'bg-red-600/10'
        }`}
      />
      <div
        className={`pointer-events-none absolute top-0 right-0 w-28 h-1.5 bg-red-600 rounded-bl-full`}
      />

      {/* Watermark Tipografi Halus di Latar Belakang */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-black tracking-tighter uppercase whitespace-nowrap text-5xl sm:text-6xl select-none ${
          isDark ? 'text-white/[0.04]' : 'text-zinc-900/[0.04]'
        }`}
      >
        TOYOTA
      </div>

      {/* ── BAGIAN ATAS: Tagline Event & Judul Mobil ── */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-xs">
            <Sparkles size={10} />
            {eventTag}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-zinc-400' : 'text-zinc-400'
            }`}
          >
            AGUNG TOYOTA
          </span>
        </div>

        <h3
          className={`font-black tracking-tight leading-tight line-clamp-1 ${
            isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          } ${isDark ? 'text-white' : 'text-zinc-900'}`}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ── BAGIAN TENGAH: Panggung Mobil + 2 Highlight Box Utama ── */}
      <div className="relative z-10 my-auto py-1 flex flex-col items-center">
        {/* Gambar Unit Mobil */}
        <div className="relative w-full h-32 sm:h-36 flex items-center justify-center">
          {/* Efek Bayangan Lantai Studio */}
          <div
            className={`absolute bottom-1 w-3/4 h-3.5 rounded-full blur-md ${
              isDark ? 'bg-black/70' : 'bg-zinc-900/20'
            }`}
          />
          {flyer.carImageUrl ? (
            <img
              src={flyer.carImageUrl}
              alt={title}
              className="relative z-10 max-h-full max-w-[92%] object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-xs text-zinc-400 italic">Pilih / Unggah Foto Mobil</div>
          )}
        </div>

        {/* 2 Kotak Highlight Utama (Cicilan & DP) */}
        <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
          {/* Box 1: Primary Toyota Red */}
          <div className="bg-red-600 text-white rounded-xl px-3 py-2 shadow-sm flex flex-col justify-center border border-red-500/30">
            <span className="text-[10px] uppercase tracking-wider font-bold text-red-100 leading-none">
              {h1Label}
            </span>
            <span
              className={`font-black tracking-tight leading-tight mt-0.5 truncate ${
                isLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {h1Value}
            </span>
          </div>

          {/* Box 2: Contrast Studio Box */}
          <div
            className={`rounded-xl px-3 py-2 shadow-sm flex flex-col justify-center border ${
              isDark
                ? 'bg-zinc-800/90 border-zinc-700 text-white'
                : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 leading-none">
              {h2Label}
            </span>
            <span
              className={`font-black tracking-tight leading-tight mt-0.5 truncate text-amber-400 ${
                isLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {h2Value}
            </span>
          </div>
        </div>
      </div>

      {/* ── BAGIAN BAWAH: Benefit Pills (Maks 4 Ditampilkan di Kartu) ── */}
      <div className="relative z-10 pt-2 border-t border-dashed border-zinc-300/60 dark:border-zinc-700/60">
        <div className="grid grid-cols-2 gap-1.5">
          {benefits.slice(0, 4).map((benefit, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold truncate ${
                isDark
                  ? 'bg-white/10 text-zinc-100 border border-white/10'
                  : 'bg-white text-zinc-700 border border-zinc-200/80 shadow-2xs'
              }`}
            >
              <CheckCircle2 size={12} className="text-red-600 shrink-0" />
              <span className="truncate">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Public Section Component ─────────────────────────────
interface PromoFlyerSectionProps {
  flyers: PromoFlyerItem[];
  salesWhatsapp: string;
}

export default function PromoFlyerSection({
  flyers,
  salesWhatsapp,
}: PromoFlyerSectionProps) {
  const [selectedFlyer, setSelectedFlyer] = useState<PromoFlyerItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tutup lightbox dengan tombol Escape
  useEffect(() => {
    if (!selectedFlyer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFlyer(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFlyer]);

  if (!flyers || flyers.length === 0) return null;

  const waNumber = salesWhatsapp.replace(/^\+/, '');

  const buildFlyerWaUrl = (flyer: PromoFlyerItem) => {
    const defaultMsg = `Halo Agung Toyota Batam, saya tertarik klaim promo flyer *${flyer.title}* (${flyer.highlight1Label} ${flyer.highlight1Value} | ${flyer.highlight2Label} ${flyer.highlight2Value}). Boleh minta info simulasi & syarat lengkapnya?`;
    const msg = flyer.waCustomMessage?.trim() || defaultMsg;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Catat klik ke database flyer & analytics global
  const recordFlyerAction = (flyer: PromoFlyerItem, action: 'VIEW' | 'WA_CLICK') => {
    try {
      const url = `/api/flyers/${flyer.id}/track`;
      const payload = JSON.stringify({ action });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }

    if (action === 'WA_CLICK') {
      trackClickToWa({
        source_button: 'PROMO_FLYER',
        car_name: flyer.title,
      });
    }
  };

  const handleOpenLightbox = (flyer: PromoFlyerItem) => {
    setSelectedFlyer(flyer);
    recordFlyerAction(flyer, 'VIEW');
  };

  // Handler scroll mobile carousel untuk update indikator dot aktif
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstElementChild?.clientWidth || 300;
    const index = Math.round(scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.min(Math.max(index, 0), flyers.length - 1));
  };

  const scrollToSlide = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || 300;
    el.scrollTo({
      left: index * (cardWidth + 16),
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const renderFlyerCard = (flyer: PromoFlyerItem) => (
    <div
      key={flyer.id}
      className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Area Gambar Flyer (Klik untuk Perbesar / Lightbox) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleOpenLightbox(flyer)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenLightbox(flyer);
          }
        }}
        className="relative cursor-pointer overflow-hidden"
        title="Klik untuk memperbesar poster promo"
      >
        <FlyerPosterCanvas flyer={flyer} />

        {/* Tombol Hover / Badge Perbesar */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shadow-sm">
          <Maximize2 size={12} />
          <span className="hidden sm:inline">Perbesar</span>
        </div>
      </div>

      {/* Bar Aksi Bawah Kartu */}
      <div className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-2 mt-auto">
        {flyer.carSlug ? (
          <Link
            href={`/mobil/${flyer.carSlug}`}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shrink-0"
            title={`Lihat spesifikasi ${flyer.title}`}
          >
            <span>Unit</span>
            <ArrowUpRight size={13} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => handleOpenLightbox(flyer)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
          >
            <Maximize2 size={12} />
            <span>Detail</span>
          </button>
        )}

        <a
          href={buildFlyerWaUrl(flyer)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordFlyerAction(flyer, 'WA_CLICK')}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <MessageCircle size={15} className="shrink-0" />
          <span>Klaim Promo via WA</span>
        </a>
      </div>
    </div>
  );

  return (
    <section id="promo" className="py-10 md:py-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-extrabold uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              Penawaran Spesial Dealer Resmi
            </span>
            <h2 className="text-gray-900 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Program Promo & Paket Kredit Bulan Ini
            </h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm">
              Klik poster untuk memperbesar detail promo atau langsung klaim penawaran via WhatsApp.
            </p>
          </div>

          {/* Navigasi Panah Mobile / Info Geser */}
          {flyers.length > 1 && (
            <div className="flex md:hidden items-center justify-between text-xs text-gray-400 pt-1">
              <span>Geser ke samping untuk melihat promo lainnya →</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  aria-label="Slide sebelumnya"
                  className="p-1.5 rounded-full border border-gray-200 text-gray-600 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSlide(Math.min(flyers.length - 1, activeIndex + 1))}
                  disabled={activeIndex === flyers.length - 1}
                  aria-label="Slide berikutnya"
                  className="p-1.5 rounded-full border border-gray-200 text-gray-600 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── TAMPILAN MOBILE: Swipeable Carousel ── */}
        <div className="md:hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {flyers.map((flyer) => (
              <div
                key={flyer.id}
                className="w-[84vw] max-w-[330px] shrink-0 snap-center"
              >
                {renderFlyerCard(flyer)}
              </div>
            ))}
          </div>

          {/* Indikator Dot Carousel Mobile */}
          {flyers.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {flyers.map((f, idx) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
                  aria-label={`Ke promo ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-6 bg-red-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── TAMPILAN DESKTOP: Grid 3 Kolom Rapi ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {flyers.map((flyer) => renderFlyerCard(flyer))}
        </div>
      </div>

      {/* ── MODAL LIGHTBOX PREVIEW (Perbesar Flyer) ── */}
      {selectedFlyer && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedFlyer(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal Lightbox */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                  {selectedFlyer.eventTag}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {selectedFlyer.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlyer(null)}
                aria-label="Tutup pratinjau"
                className="p-1.5 rounded-full bg-gray-200/70 hover:bg-gray-300 text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Isi Poster Ukuran Penuh */}
            <div className="max-h-[70vh] overflow-y-auto">
              <FlyerPosterCanvas flyer={selectedFlyer} isLarge />
            </div>

            {/* Footer Modal dengan Tombol Klaim WA */}
            <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2.5">
              {selectedFlyer.carSlug && (
                <Link
                  href={`/mobil/${selectedFlyer.carSlug}`}
                  onClick={() => setSelectedFlyer(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold text-center transition-colors"
                >
                  Lihat Spesifikasi Unit
                </Link>
              )}
              <a
                href={buildFlyerWaUrl(selectedFlyer)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordFlyerAction(selectedFlyer, 'WA_CLICK')}
                className="w-full flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-sm font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={17} />
                <span>Klaim Promo Ini via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

