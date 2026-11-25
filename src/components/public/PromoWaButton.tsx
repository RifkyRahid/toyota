'use client';

import { useWaLeadGate } from '@/components/public/WaLeadGateProvider';

interface PromoWaButtonProps {
  href?: string;
  articleTitle: string;
}

export default function PromoWaButton({ articleTitle }: PromoWaButtonProps) {
  const { openLeadGate } = useWaLeadGate();

  return (
    <button
      type="button"
      onClick={() =>
        openLeadGate({
          carInterest: articleTitle,
          leadSource: 'promo_article',
          ctaButtonType: 'PROMO_DETAIL',
        })
      }
      className="inline-flex items-center justify-center shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
    >
      Chat WhatsApp Sekarang
    </button>
  );
}

