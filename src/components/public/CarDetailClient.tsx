'use client';

import { useState, useEffect } from 'react';
import type { SerializedCarModel, SerializedCarVariant, SiteSetting } from '@/types';
import VariantSelector from '@/components/public/VariantSelector';
import SpecAccordion from '@/components/public/SpecAccordion';
import MobileBottomBar from '@/components/public/MobileBottomBar';
import { trackViewCarDetail } from '@/lib/analytics';

interface CarDetailClientProps {
  car: SerializedCarModel & { variants: SerializedCarVariant[] };
  settings: SiteSetting;
}

export default function CarDetailClient({ car, settings }: CarDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<SerializedCarVariant>(
    car.variants[0]
  );

  useEffect(() => {
    trackViewCarDetail({
      car_name: car.name,
      category: car.category,
      price_starting: car.startingPrice,
    });
  }, [car.name, car.category, car.startingPrice]);

  return (
    <>
      {/* Variant Selector */}
      <VariantSelector
        variants={car.variants}
        heroImage={car.heroImage}
        carName={car.name}
        salesWhatsapp={settings.salesWhatsapp}
        onVariantChange={setSelectedVariant}
      />

      {/* Spec Accordion */}
      {selectedVariant && (
        <div className="mt-8">
          <SpecAccordion variant={selectedVariant} />
        </div>
      )}

      {/* Mobile Bottom Bar */}
      {selectedVariant && (
        <MobileBottomBar
          price={selectedVariant.price}
          carName={car.name}
          variantName={selectedVariant.name}
          salesWhatsapp={settings.salesWhatsapp}
        />
      )}
    </>
  );
}
