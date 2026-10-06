'use client';

import Image from 'next/image';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import type { SiteSetting } from '@/types';
import { trackClickToWa } from '@/lib/analytics';

interface SalesSectionProps {
  settings: Partial<SiteSetting>;
}

const SELLING_POINTS = [
  'Bantu Kredit Sampai Approved',
  'Penawaran Harga Terbaik Batam',
  'Layanan Purna Jual Terpercaya',
] as const;

export default function SalesSection({ settings }: SalesSectionProps) {
  const waNumber = (settings.salesWhatsapp ?? '').replace(/^\+/, '');
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo, saya ingin berkonsultasi mengenai Toyota di Batam.')}`
    : '#';

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold">
            Sales Representative Kami
          </h2>
          <p className="text-gray-500 mt-2">
            Konsultasikan kebutuhan mobil Toyota Anda langsung dengan tim kami
          </p>
        </div>

        {/* 2-column layout */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 max-w-4xl mx-auto">
          {/* Left — Photo */}
          <div className="flex-shrink-0 w-[220px] md:w-[280px]" style={{ width: '280px', maxWidth: '100%' }}>
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md" style={{ position: 'relative', width: '100%', aspectRatio: '3/4' }}>
              {settings.salesPhotoUrl ? (
                <Image
                  src={settings.salesPhotoUrl}
                  alt={settings.salesName ?? 'Sales Representative'}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              ) : (
                /* Placeholder avatar */
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex-1 flex flex-col gap-5 text-center md:text-left">
            {/* Verified badge */}
            <div className="inline-flex items-center gap-1.5 text-red-600 font-semibold text-sm self-center md:self-start">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{settings.salesTitle ?? 'Certified Sales Executive'}</span>
            </div>

            {/* Name */}
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">
              {settings.salesName ?? 'Sales Representative'}
            </h3>

            {/* Bio / slogan */}
            {settings.salesBio && (
              <p className="text-gray-500 text-base leading-relaxed">
                {settings.salesBio}
              </p>
            )}

            {/* Selling points */}
            <ul className="flex flex-col gap-3 mt-1">
              {SELLING_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 justify-center md:justify-start">
                  <CheckCircle
                    className="w-5 h-5 text-red-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-gray-700 font-medium">{point}</span>
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              {settings.salesPhone && (
                <a
                  href={`tel:${settings.salesPhone}`}
                  className="border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
                >
                  📞 Telepon Sekarang
                </a>
              )}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClickToWa({ source_button: 'SALES_SECTION' })}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                💬 Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
