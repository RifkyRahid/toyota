'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X, MessageCircle, Sparkles, Flame } from 'lucide-react';
import type { PromoFlyerItem } from '@/types';
import { FlyerPosterCanvas } from '@/components/public/PromoFlyerSection';
import { useWaLeadGate } from '@/components/public/WaLeadGateProvider';

interface PromoPopupModalProps {
  flyer: PromoFlyerItem | null;
  salesWhatsapp: string;
}

const SESSION_STORAGE_KEY = 'toyota_promo_popup_seen_v1';
const AUTO_POPUP_DELAY_MS = 6000; // 6 detik
const AUTO_POPUP_SCROLL_RATIO = 0.25; // 25% scroll halaman

export default function PromoPopupModal({
  flyer,
}: PromoPopupModalProps) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { openLeadGate } = useWaLeadGate();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosingToLeft, setIsClosingToLeft] = useState(false);
  const [showFloatingMini, setShowFloatingMini] = useState(false);
  const hasTriggeredRef = useRef(false);

  const trackFlyerView = useCallback(() => {
    if (!flyer?.id || flyer.id.startsWith('default-') || flyer.id.startsWith('fallback-')) {
      return;
    }
    fetch(`/api/flyers/${flyer.id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'VIEW' }),
    }).catch(() => {
      // Abaikan error jaringan
    });
  }, [flyer]);

  // Opsi A: Auto-popup HANYA aktif di halaman utama (/)
  // Muncul setelah 6 detik ATAU setelah scroll 25-30% halaman (mana lebih dulu).
  useEffect(() => {
    if (!flyer || !flyer.isActive || !isHomepage) {
      setIsOpen(false);
      setShowFloatingMini(false);
      return;
    }

    try {
      const alreadySeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (alreadySeen) {
        setShowFloatingMini(true);
        return;
      }
    } catch {
      setShowFloatingMini(true);
      return;
    }

    hasTriggeredRef.current = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const triggerPopupOnce = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      if (timerId) clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);

      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
      } catch {
        // Abaikan jika sessionStorage diblokir
      }

      setIsOpen(true);
      trackFlyerView();
    };

    const handleScroll = () => {
      const docEl = document.documentElement;
      const scrollableHeight = docEl.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const currentRatio = window.scrollY / scrollableHeight;
      if (currentRatio >= AUTO_POPUP_SCROLL_RATIO) {
        triggerPopupOnce();
      }
    };

    timerId = setTimeout(triggerPopupOnce, AUTO_POPUP_DELAY_MS);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [flyer, isHomepage, trackFlyerView]);

  // Tutup popup dengan animasi meluncur & mengecil ke sisi kiri tengah layar
  const handleClosePopup = useCallback(() => {
    if (isClosingToLeft) return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    } catch {
      // ignore
    }

    setIsClosingToLeft(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosingToLeft(false);
      if (isHomepage) {
        setShowFloatingMini(true);
      }
    }, 420);
  }, [isClosingToLeft, isHomepage]);

  // Buka kembali popup saat Floating Mini-Poster diklik
  const handleOpenFromMini = () => {
    setShowFloatingMini(false);
    setIsClosingToLeft(false);
    setIsOpen(true);
    trackFlyerView();
  };

  // Tutup dengan tombol Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClosePopup();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClosePopup]);

  if (!flyer || !flyer.isActive || !isHomepage) return null;

  const handleClaimPromoClick = () => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setIsOpen(false);
    setIsClosingToLeft(false);
    setShowFloatingMini(true);

    openLeadGate({
      carInterest: flyer.title,
      leadSource: 'popup_flyer',
      ctaButtonType: 'PROMO_POPUP_WA',
      flyerId: flyer.id,
    });
  };

  const miniPosterThumb =
    flyer.mode === 'IMAGE'
      ? flyer.customImageUrl || '/images/promo-tukar-tambah-batam.jpg'
      : flyer.carImageUrl || '/images/promo-tukar-tambah-batam.jpg';

  return (
    <>
      {/* ── 1. FLOATING MINI-POSTER DI SISI KIRI TENGAH (Hanya di Beranda setelah popup ditutup) ── */}
      {showFloatingMini && !isOpen && (
        <div className="fixed left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-40 select-none animate-in fade-in zoom-in-75 duration-300">
          <button
            type="button"
            onClick={handleOpenFromMini}
            title={`Buka ${flyer.title}`}
            aria-label={`Buka Popup ${flyer.title}`}
            className="group relative flex flex-col items-center w-[62px] sm:w-[74px] md:w-[86px] rounded-xl bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border-2 border-red-600 hover:border-red-500 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
          >
            {/* Indikator titik merah berdenyut di pojok kanan atas */}
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white" />
            </span>

            {/* Label Header Atas Mini-Poster */}
            <div className="w-full bg-red-600 text-white text-[8px] sm:text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-1 rounded-t-lg flex items-center justify-center gap-0.5 leading-none">
              <Flame size={10} className="shrink-0 fill-amber-300 text-amber-300" />
              <span>PROMO</span>
            </div>

            {/* Thumbnail Poster Utuh */}
            <div className="w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
              <img
                src={miniPosterThumb}
                alt={flyer.title}
                className="w-full h-auto max-h-[105px] sm:max-h-[120px] md:max-h-[135px] object-contain block group-hover:brightness-105 transition-all"
              />
            </div>

            {/* Label Bawah Mini-Poster */}
            <div className="w-full bg-zinc-900 group-hover:bg-red-600 text-white text-[8px] sm:text-[9px] font-bold py-1 px-1 rounded-b-lg text-center leading-none transition-colors">
              Lihat Promo
            </div>
          </button>
        </div>
      )}

      {/* ── 2. POPUP MODAL PROMO OTOMATIS (6 detik / scroll 25%) ── */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 transition-colors duration-400 ${
            isClosingToLeft
              ? 'bg-black/0 backdrop-blur-none pointer-events-none'
              : 'bg-black/80 backdrop-blur-xs'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={flyer.title}
          onClick={handleClosePopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-[390px] sm:max-w-[430px] flex flex-col rounded-2xl overflow-hidden bg-zinc-950 shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-white/15 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isClosingToLeft
                ? '-translate-x-[43vw] scale-[0.16] opacity-15 rounded-3xl'
                : 'translate-x-0 scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-300'
            }`}
          >
            {/* Header Bar dengan Tombol Close (X) Besar & Terpisah Aman dari CTA Bawah */}
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gradient-to-r from-red-700 via-red-600 to-zinc-900 text-white">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles size={15} className="text-amber-300 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider truncate">
                  {flyer.eventTag || 'Promo Spesial Bulan Ini'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClosePopup}
                aria-label="Tutup Popup Promo"
                className="inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-3 rounded-full bg-black/45 hover:bg-black/75 active:scale-95 text-white text-xs font-bold border border-white/25 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <span>Tutup</span>
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Area Gambar Poster (Utuh Tanpa Terpotong, Dipisahkan dari CTA Bawah) */}
            <div className="relative w-full bg-zinc-950 flex items-center justify-center overflow-y-auto max-h-[58vh] sm:max-h-[64vh]">
              {flyer.mode === 'IMAGE' && flyer.customImageUrl ? (
                <img
                  src={flyer.customImageUrl}
                  alt={flyer.title}
                  className="w-full h-auto max-h-[58vh] sm:max-h-[64vh] object-contain block mx-auto select-none"
                />
              ) : (
                <div className="w-full">
                  <FlyerPosterCanvas flyer={flyer} />
                </div>
              )}
            </div>

            {/* Area Tombol CTA di Bawah Poster (Terpisah Aman dari Tombol Close di Atas) */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClaimPromoClick}
                className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 transition-all cursor-pointer"
              >
                <MessageCircle size={19} className="shrink-0" />
                <span>Klaim Promo via WA</span>
              </button>
              <p className="text-[11px] text-center text-gray-500 font-medium">
                Respon Cepat Sales Resmi Agung Toyota Batam • Lidya (0853-5574-6543)
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
