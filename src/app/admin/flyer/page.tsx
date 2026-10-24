import { prisma } from '@/lib/prisma';
import FlyerClient, { type CatalogCarOption } from '@/components/admin/FlyerClient';
import type { PromoFlyerItem } from '@/types';
import { ensureDefaultPromoFlyer, DEFAULT_TUKAR_TAMBAH_FLYER } from '@/lib/data';

export const revalidate = 0;

export default async function AdminFlyerPage() {
  await ensureDefaultPromoFlyer();

  const [flyersRaw, carsRaw] = await Promise.all([
    prisma.promoFlyer
      .findMany({
        orderBy: [{ isPopup: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
      })
      .catch(() => null),
    prisma.carModel
      .findMany({
        where: { isActive: true },
        orderBy: [{ isPromo: 'desc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          heroImage: true,
          startingPrice: true,
          promoLabel: true,
          isPromo: true,
        },
      })
      .catch(() => []),
  ]);

  const formattedFlyers: PromoFlyerItem[] =
    flyersRaw === null
      ? [DEFAULT_TUKAR_TAMBAH_FLYER]
      : flyersRaw.map((f) => ({
    id: f.id,
    mode: f.mode === 'IMAGE' ? 'IMAGE' : 'AUTO',
    theme: (['RED_WHITE', 'DARK_LUXURY', 'SILVER_SPORT'].includes(f.theme)
      ? f.theme
      : 'RED_WHITE') as 'RED_WHITE' | 'DARK_LUXURY' | 'SILVER_SPORT',
    title: f.title,
    eventTag: f.eventTag,
    subtitle: f.subtitle,
    carSlug: f.carSlug,
    carImageUrl: f.carImageUrl,
    customImageUrl: f.customImageUrl,
    highlight1Label: f.highlight1Label,
    highlight1Value: f.highlight1Value,
    highlight2Label: f.highlight2Label,
    highlight2Value: f.highlight2Value,
    benefits: f.benefits,
    waCustomMessage: f.waCustomMessage,
    viewCount: f.viewCount,
    waClickCount: f.waClickCount,
    displayOrder: f.displayOrder,
    isPopup: f.isPopup,
    isActive: f.isActive,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  const catalogCars: CatalogCarOption[] = carsRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    heroImage: c.heroImage,
    startingPrice: c.startingPrice.toString(),
    promoLabel: c.promoLabel,
    isPromo: c.isPromo,
  }));

  return <FlyerClient initialFlyers={formattedFlyers} catalogCars={catalogCars} />;
}

