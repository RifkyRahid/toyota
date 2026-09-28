import { prisma } from '@/lib/prisma';
import BannerClient, { BannerItem } from '@/components/admin/BannerClient';

export const revalidate = 0;

export default async function AdminBannerPage() {
  const bannersRaw = await prisma.banner.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  const formatted: BannerItem[] = bannersRaw.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    ctaText: b.ctaText,
    ctaUrl: b.ctaUrl,
    imageUrl: b.imageUrl,
    displayOrder: b.displayOrder,
    isActive: b.isActive,
  }));

  return <BannerClient initialBanners={formatted} />;
}
