'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="relative h-[60vh] md:h-[80vh] bg-gray-900 flex items-end overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/toyota-bg-placeholder.jpg')] bg-cover bg-center opacity-40" />
      <div className="relative z-20 container mx-auto px-4 pb-16 md:pb-20">
        <h1 className="text-white text-3xl md:text-5xl font-bold max-w-2xl leading-tight drop-shadow-md">
          Temukan Toyota Impian Anda di Batam
        </h1>
        <p className="text-gray-200 text-base md:text-xl mt-3 max-w-xl">
          Harga OTR terbaik, promo menarik, dan layanan sales berpengalaman.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#katalog"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Lihat Katalog
          </Link>
          <Link
            href="#promo"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
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

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [banners.length, goToNext]);

  if (banners.length === 0) {
    return <StaticHero />;
  }

  return (
    <div className="relative h-[60vh] md:h-[80vh] overflow-hidden bg-gray-900" style={{ position: 'relative', minHeight: '400px', maxHeight: '75vh', overflow: 'hidden' }}>
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 1 : 0 }}
          aria-hidden={index !== currentSlide}
        >
          {/* Background image */}
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark gradient overlay — bottom-to-top for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          {/* Text content overlay */}
          <div className="absolute inset-0 flex items-end z-10">
            <div className="container mx-auto px-4 pb-16 md:pb-20">
              <h2 className="text-white text-3xl md:text-5xl font-bold max-w-2xl leading-tight drop-shadow-md">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-gray-200 text-base md:text-xl mt-3 max-w-xl drop-shadow">
                  {banner.subtitle}
                </p>
              )}
              <div className="mt-6">
                <Link
                  href={banner.ctaUrl}
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  {banner.ctaText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dot navigation */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
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
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows (visible on md+) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Slide sebelumnya"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Slide berikutnya"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
