'use client';

import { trackClickToWa } from '@/lib/analytics';

interface PromoWaButtonProps {
  href: string;
  articleTitle: string;
}

export default function PromoWaButton({ href, articleTitle }: PromoWaButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackClickToWa({
          source_button: 'PROMO_DETAIL',
          car_name: `Promo: ${articleTitle}`,
        })
      }
      className="inline-flex items-center justify-center shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors text-sm"
    >
      Chat WhatsApp Sekarang
    </a>
  );
}

