'use client';

import type { ReactNode } from 'react';
import { useWaLeadGate } from '@/components/public/WaLeadGateProvider';

interface WaGateButtonProps {
  carInterest?: string;
  leadSource: string;
  ctaButtonType?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export default function WaGateButton({
  carInterest,
  leadSource,
  ctaButtonType,
  className,
  ariaLabel,
  children,
}: WaGateButtonProps) {
  const { openLeadGate } = useWaLeadGate();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() =>
        openLeadGate({
          carInterest,
          leadSource,
          ctaButtonType,
        })
      }
      className={className}
    >
      {children}
    </button>
  );
}
