'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
}

interface HeroSliderProps {
  banners: Banner[];
}

// ── Static fallback hero ────────────────────────────────────────
function StaticHero() {
  return (
    <div className="relative w-full aspect-[21/9] min-h-[300px] bg-gray-900 flex items-end overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/toyota-bg-placeholder.jpg')] bg-cover bg-center opacity-40" />
      <div className="relative z-20 container mx-auto px-4 pb-12 md:pb-16">
        <h1 className="text-white text-2xl md:text-5xl font-bold max-w-2xl leading-tight drop-shadow-md">
          Temukan Toyota Impian Anda di Batam
        </h1>
        <p className="text-gray-200 text-sm md:text-xl mt-2 max-w-xl">
          Harga OTR terbaik, promo menarik, dan layanan sales berpengalaman.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="#katalog"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-colors"
          >
            Lihat Katalog
          </Link>
          <Link
            href="#promo"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base transition-colors backdrop-blur-sm"
          >
            Lihat Promo
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main HeroSlider ─────────────────────────────────────────────
export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [banners.length, goToNext]);

  // Touch gesture support on mobile (swipe left/right)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
    setTouchStart(null);
  };

  if (banners.length === 0) {
    return <StaticHero />;
  }

  return (
    <div
      className="relative w-full overflow-hidden bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container: Tinggi mengikuti rasio poster asli secara proporsional */}
      <div className="relative w-full">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={banner.id}
              className={`w-full transition-opacity duration-700 ease-in-out ${
                isActive
                  ? 'relative opacity-100 z-10 pointer-events-auto'
                  : 'absolute inset-0 opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Full-slide clickable link */}
              <Link
                href={banner.ctaUrl}
                className="block w-full cursor-pointer relative group"
                tabIndex={isActive ? 0 : -1}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className={`w-full ${isActive ? 'h-auto' : 'h-full object-cover'} block select-none`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle gradient di desktop agar teks terbaca tanpa menutupi/menggelapkan mobil */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-colors" />
              </Link>

              {/* Text content overlay — Tampil di desktop (md ke atas), di mobile bersih penuh poster */}
              <div className="hidden md:flex absolute inset-0 items-end z-10 pointer-events-none">
                <div className="container mx-auto px-6 pb-8 lg:pb-12">
                  <Link
                    href={banner.ctaUrl}
                    className="pointer-events-auto inline-block group"
                    tabIndex={isActive ? 0 : -1}
                  >
                    <h2 className="text-white text-2xl lg:text-4xl font-black max-w-2xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-red-400 transition-colors">
                      {banner.title}
                    </h2>
                  </Link>
                  {banner.subtitle && (
                    <p className="text-gray-100 text-sm lg:text-base mt-1.5 max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                      {banner.subtitle}
                    </p>
                  )}
                  <div className="mt-3.5 pointer-events-auto">
                    <Link
                      href={banner.ctaUrl}
                      className="inline-block bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg"
                      tabIndex={isActive ? 0 : -1}
                    >
                      {banner.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot navigation */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-2.5 sm:bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 z-20"
          role="tablist"
          aria-label="Slide navigation"
        >
          {banners.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentSlide
                  ? 'bg-red-600 w-5 md:w-6 shadow-sm'
                  : 'bg-white/70 w-1.5 md:w-2 hover:bg-white shadow-xs'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows (visible on md+) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Slide sebelumnya"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Slide berikutnya"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
