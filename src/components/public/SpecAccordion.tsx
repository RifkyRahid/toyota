'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SerializedCarVariant } from '@/types';

interface SpecAccordionProps {
  variant: SerializedCarVariant;
}

interface SpecRow {
  label: string;
  value: string | number | null | undefined;
}

export default function SpecAccordion({ variant }: SpecAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const specs: SpecRow[] = [
    { label: 'Tipe Mesin', value: variant.engineType },
    { label: 'Kapasitas Mesin (cc)', value: variant.displacement },
    { label: 'Transmisi', value: variant.transmission },
    { label: 'Bahan Bakar', value: variant.fuelType },
    { label: 'Tenaga Maksimal', value: variant.maxPower },
    { label: 'Torsi Maksimal', value: variant.maxTorque },
    { label: 'Kapasitas Penumpang', value: variant.seatingCapacity },
  ];

  const visibleSpecs = specs.filter(
    (s) => s.value !== null && s.value !== undefined && s.value !== ''
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900">Lihat Spesifikasi Lengkap</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accordion Body */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        {visibleSpecs.length > 0 ? (
          <table className="w-full text-sm border-t border-gray-200">
            <tbody>
              {visibleSpecs.map((spec, index) => (
                <tr key={spec.label} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-5 py-3 text-gray-500 w-1/2">{spec.label}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">{String(spec.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-4 text-gray-500 text-sm border-t border-gray-200">
            Spesifikasi belum tersedia untuk varian ini.
          </p>
        )}
      </div>
    </div>
  );
}
