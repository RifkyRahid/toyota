'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Star,
  CheckCircle2,
  MapPin,
  Car,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Quote,
  HeartHandshake,
} from 'lucide-react';
import type { TestimonialItem } from '@/types';

interface TestimonialSectionProps {
  testimonials: TestimonialItem[];
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  const [selectedItem, setSelectedItem] = useState<TestimonialItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const count = testimonials?.length || 0;

  // Fungsi geser ke kartu ke-i
  const scrollToCard = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || count === 0) return;
      const firstCard = el.firstElementChild as HTMLElement | null;
      if (!firstCard) return;

      const gap = window.innerWidth >= 768 ? 24 : 16;
      const step = firstCard.offsetWidth + gap;

      // Di layar desktop (3 kolom), batas index geser maksimal adalah count - 3 (jika count > 3)
      const isDesktop = window.innerWidth >= 768;
      const maxStartIndex = isDesktop ? Math.max(0, count - 3) : count - 1;
      const clampedIndex = index > maxStartIndex ? 0 : Math.max(0, index);

      el.scrollTo({
        left: clampedIndex * step,
        behavior: 'smooth',
      });
      setActiveIndex(clampedIndex);
    },
    [count]
  );

  // Auto-slide setiap 4.5 detik (berhenti sementara saat mouse hover / touch / lightbox buka)
  useEffect(() => {
    if (count <= 1 || isPaused || selectedItem) return;

    const timer = setInterval(() => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      // Jika di desktop jumlah kartu <= 3, tidak perlu auto-scroll karena semua sudah terlihat
      if (isDesktop && count <= 3) return;

      const maxStartIndex = isDesktop ? Math.max(0, count - 3) : count - 1;
      const nextIndex = activeIndex >= maxStartIndex ? 0 : activeIndex + 1;
      scrollToCard(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [count, isPaused, selectedItem, activeIndex, scrollToCard]);

  // Tutup Lightbox dengan tombol Escape
  useEffect(() => {
    if (!selectedItem) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedItem]);

  if (!testimonials || testimonials.length === 0) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return;
    const gap = window.innerWidth >= 768 ? 24 : 16;
    const step = firstCard.offsetWidth + gap;
    const idx = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.min(Math.max(idx, 0), count - 1));
  };

  return (
    <section
      id="testimoni"
      className="py-12 md:py-16 bg-white border-t border-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 4000);
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-extrabold uppercase tracking-wider mb-1">
              <HeartHandshake size={14} />
              Bukti Kepercayaan Pelanggan Batam
            </span>
            <h2 className="text-gray-900 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Momen Serah Terima & Testimoni Pembeli
            </h2>
            <p className="text-gray-500 mt-1 text-xs sm:text-sm max-w-2xl">
              Terima kasih kepada keluarga dan pelanggan Toyota di Batam yang telah mempercayakan pembelian unit barunya bersama kami.
            </p>
          </div>

          {/* Tombol Navigasi Panah (Muncul jika > 1 di HP atau > 3 di Desktop) */}
          <div className="flex items-center justify-between md:justify-end gap-2">
            <span className="text-xs text-gray-400 md:hidden">
              Geser untuk lihat lainnya →
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
                aria-label="Testimoni sebelumnya"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollToCard(activeIndex + 1)}
                aria-label="Testimoni berikutnya"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Track Carousel 3 Kolom di Desktop & Swipe di Mobile ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="w-[84vw] max-w-[330px] md:max-w-none md:w-[calc((100%-48px)/3)] shrink-0 snap-center md:snap-start group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Foto Serah Terima (Portrait 3:4) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedItem(item);
                  }
                }}
                className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer select-none"
                title="Klik untuk memperbesar foto serah terima"
              >
                <img
                  src={item.imageUrl}
                  alt={`Serah terima Toyota ${item.carName} - ${item.customerName}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient Halus di Bawah Foto */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Badge Unit Mobil di Kiri Atas */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-sm">
                    <Car size={12} />
                    <span>{item.carName}</span>
                  </span>
                </div>

                {/* Tombol Perbesar di Kanan Atas */}
                <div className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/75 backdrop-blur-xs text-white p-1.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={13} />
                </div>

                {/* Nama Pembeli di Atas Gradient Bawah Foto */}
                <div className="absolute bottom-3 left-3.5 right-3.5 z-10 text-white">
                  <p className="font-bold text-sm sm:text-base leading-snug drop-shadow-xs truncate">
                    {item.customerName}
                  </p>
                  {item.location && (
                    <p className="text-[11px] text-zinc-200 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-red-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Bagian Bawah: Bintang 5 & Kutipan Review */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-white relative">
                <Quote
                  size={28}
                  className="absolute top-3 right-3 text-gray-100 pointer-events-none"
                />

                <div>
                  {/* Bintang & Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < (item.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }
                        />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} />
                      <span>Terverifikasi</span>
                    </span>
                  </div>

                  {/* Kalimat Review */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3 italic">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Indikator Dot di Bawah ── */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                aria-label={`Ke testimoni ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex ? 'w-6 bg-red-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL LIGHTBOX FOTO SERAH TERIMA ── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                  Serah Terima Unit • {selectedItem.carName}
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedItem.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full bg-gray-200/70 hover:bg-gray-300 text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Foto Ukuran Penuh */}
            <div className="bg-zinc-900 max-h-[65vh] flex items-center justify-center overflow-hidden">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.customerName}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            {/* Isi Review Lengkap */}
            <div className="p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < (selectedItem.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
                {selectedItem.location && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} className="text-red-600" />
                    {selectedItem.location}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic">
                &ldquo;{selectedItem.review}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

