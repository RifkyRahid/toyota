'use client';

import { useState, useMemo } from 'react';
import CarCard from '@/components/public/CarCard';
import type { SerializedCarModel, CarCategory } from '@/types';

// ── Types ──────────────────────────────────────────────────────
type TabLabel = 'SEMUA' | CarCategory;

const TABS: TabLabel[] = [
  'SEMUA',
  'MPV',
  'SUV',
  'HATCHBACK',
  'SEDAN',
  'COMMERCIAL',
  'HYBRID_EV',
];

const TAB_LABELS: Record<TabLabel, string> = {
  SEMUA: 'Semua',
  MPV: 'MPV',
  SUV: 'SUV',
  HATCHBACK: 'Hatchback',
  SEDAN: 'Sedan',
  COMMERCIAL: 'Commercial',
  HYBRID_EV: 'Hybrid / EV',
};

interface CatalogSectionProps {
  cars: SerializedCarModel[];
  salesWhatsapp: string;
}

// ── Component ─────────────────────────────────────────────────
export default function CatalogSection({ cars, salesWhatsapp }: CatalogSectionProps) {
  const [activeCategory, setActiveCategory] = useState<TabLabel>('SEMUA');

  // Filter cars based on active tab
  const filteredCars = useMemo(() => {
    if (activeCategory === 'SEMUA') return cars;
    return cars.filter((car) => car.category === activeCategory);
  }, [cars, activeCategory]);

  // Only show tabs that have at least one car (plus SEMUA)
  const availableTabs = useMemo<TabLabel[]>(() => {
    const categoriesWithCars = new Set(cars.map((c) => c.category as TabLabel));
    return TABS.filter((tab) => tab === 'SEMUA' || categoriesWithCars.has(tab));
  }, [cars]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Section header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-gray-900 text-xl sm:text-2xl md:text-3xl font-bold">
          Katalog Unit Toyota Batam
        </h2>
        <p className="text-gray-500 mt-1 text-xs sm:text-sm">
          Pilih unit Toyota sesuai kebutuhan dan gaya hidup Anda
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
              activeCategory === tab
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-red-400 hover:text-red-600'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Car grid */}
      {filteredCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} salesWhatsapp={salesWhatsapp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-base">Tidak ada unit tersedia untuk kategori ini.</p>
        </div>
      )}
    </div>
  );
}
