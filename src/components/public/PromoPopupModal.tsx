'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, MessageCircle, Sparkles, Flame } from 'lucide-react';
import type { PromoFlyerItem } from '@/types';
import { FlyerPosterCanvas } from '@/components/public/PromoFlyerSection';
import { trackClickToWa } from '@/lib/analytics';

interface PromoPopupModalProps {
  flyer: PromoFlyerItem | null;
  salesWhatsapp: string;
}

const SESSION_STORAGE_KEY = 'toyota_promo_popup_seen_v1';

export default function PromoPopupModal({
  flyer,
  salesWhatsapp,
}: PromoPopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosingToLeft, setIsClosingToLeft] = useState(false);
  const [showFloatingMini, setShowFloatingMini] = useState(false);

  // Gunakan nomor WA Lidya Toyota (6285355746543) jika salesWhatsapp kosong atau masih default dummy
  const cleanWa =
    salesWhatsapp &&
    salesWhatsapp.replace(/\D/g, '') !== '' &&
    salesWhatsapp.replace(/\D/g, '') !== '6281234567890'
      ? salesWhatsapp.replace(/\D/g, '')
      : '6285355746543';

  const trackFlyerInteraction = useCallback(
    (action: 'VIEW' | 'WA_CLICK') => {
      if (!flyer?.id || flyer.id.startsWith('default-')) return;
      fetch(`/api/flyers/${flyer.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }).catch(() => {
        // Abaikan error jaringan
      });
    },
    [flyer]
  );

  // Muncul otomatis 2 detik setelah halaman dibuka (1x per sesi kunjungan via sessionStorage)
  useEffect(() => {
    if (!flyer || !flyer.isActive) return;

    try {
      const alreadySeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!alreadySeen) {
        const timer = setTimeout(() => {
          sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
          setIsOpen(true);
          trackFlyerInteraction('VIEW');
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // Jika sudah pernah muncul di sesi ini, langsung tampilkan Floating Mini-Poster di kiri tengah
        setShowFloatingMini(true);
      }
    } catch {
      // Fallback jika sessionStorage diblokir browser
      setShowFloatingMini(true);
    }
  }, [flyer, trackFlyerInteraction]);

  // Tutup popup dengan animasi meluncur & mengecil ke sisi kiri tengah layar
  const handleClosePopup = useCallback(() => {
    if (isClosingToLeft) return;
    setIsClosingToLeft(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsClosingToLeft(false);
      setShowFloatingMini(true);
    }, 460);
  }, [isClosingToLeft]);

  // Buka kembali popup saat Floating Mini-Poster diklik
  const handleOpenFromMini = () => {
    setShowFloatingMini(false);
    setIsClosingToLeft(false);
    setIsOpen(true);
    trackFlyerInteraction('VIEW');
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

  if (!flyer || !flyer.isActive) return null;

  const getWaLink = () => {
    const defaultMsg =
      flyer.waCustomMessage && flyer.waCustomMessage.trim() !== ''
        ? flyer.waCustomMessage
        : `Halo Lidya Agung Toyota Batam, saya tertarik klaim *${flyer.title}* (${flyer.eventTag || 'Promo Bulan Ini'}). Mohon info lengkap & simulasi kreditnya.`;
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(defaultMsg)}`;
  };

  const handleWaClick = () => {
    trackFlyerInteraction('WA_CLICK');
    trackClickToWa({
      source_button: 'PROMO_POPUP_WA',
      car_name: flyer.title,
    });
  };

  const miniPosterThumb =
    flyer.mode === 'IMAGE'
      ? flyer.customImageUrl || '/images/promo-tukar-tambah-batam.jpg'
      : flyer.carImageUrl || '/images/promo-tukar-tambah-batam.jpg';

  return (
    <>
      {/* ── 1. FLOATING MINI-POSTER DI SISI KIRI TENGAH (Berseberangan dengan Floating WA) ── */}
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
                className="w-full h-auto max-h-[105px] sm:max-h-[120px] md:max-h-[135px] object-contain block group-hover: brightness-105 transition-all"
              />
            </div>

            {/* Label Bawah Mini-Poster */}
            <div className="w-full bg-zinc-900 group-hover:bg-red-600 text-white text-[8px] sm:text-[9px] font-bold py-1 px-1 rounded-b-lg text-center leading-none transition-colors">
              Lihat Promo
            </div>
          </button>
        </div>
      )}

      {/* ── 2. POPUP MODAL PROMO OTOMATIS (Dengan Animasi Meluncur ke Kiri Tengah Saat Ditutup) ── */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 transition-colors duration-450 ${
            isClosingToLeft
              ? 'bg-black/0 backdrop-blur-none pointer-events-none'
              : 'bg-black/80 backdrop-blur-xs'
          }`}
          onClick={handleClosePopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-[380px] sm:max-w-[420px] flex flex-col rounded-2xl overflow-hidden bg-zinc-950 shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-white/15 transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isClosingToLeft
                ? '-translate-x-[43vw] scale-[0.16] opacity-15 rounded-3xl'
                : 'translate-x-0 scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-300'
            }`}
          >
            {/* Header Bar Tipis + Tombol Close (X) */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-red-700 via-red-600 to-zinc-900 text-white">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles size={14} className="text-amber-300 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider truncate">
                  {flyer.eventTag || 'Promo Spesial Bulan Ini'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClosePopup}
                aria-label="Tutup Popup Promo"
                className="inline-flex items-center gap-1 bg-black/30 hover:bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <span>Tutup</span>
                <X size={14} />
              </button>
            </div>

            {/* Area Gambar Poster (100% Utuh Tanpa Terpotong) */}
            <div className="relative w-full bg-zinc-950 flex items-center justify-center overflow-y-auto max-h-[66vh] sm:max-h-[70vh]">
              {flyer.mode === 'IMAGE' && flyer.customImageUrl ? (
                <img
                  src={flyer.customImageUrl}
                  alt={flyer.title}
                  className="w-full h-auto max-h-[66vh] sm:max-h-[70vh] object-contain block mx-auto select-none"
                />
              ) : (
                <div className="w-full">
                  <FlyerPosterCanvas flyer={flyer} />
                </div>
              )}
            </div>

            {/* Area Tombol CTA di Bawah Poster */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
              <a
                href={getWaLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWaClick}
                className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 transition-all"
              >
                <MessageCircle size={19} className="shrink-0" />
                <span>Klaim Promo via WhatsApp</span>
              </a>
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

