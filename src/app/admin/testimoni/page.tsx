import { prisma } from '@/lib/prisma';
import TestimonialClient from '@/components/admin/TestimonialClient';
import type { TestimonialItem } from '@/types';

export const revalidate = 0;

export default async function AdminTestimonialPage() {
  const [testimonialsRaw, carsRaw] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.carModel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { name: true },
    }),
  ]);

  const formatted: TestimonialItem[] = testimonialsRaw.map((t) => ({
    id: t.id,
    customerName: t.customerName,
    carName: t.carName,
    location: t.location,
    rating: t.rating,
    review: t.review,
    imageUrl: t.imageUrl,
    displayOrder: t.displayOrder,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  const carNames = carsRaw.map((c) => c.name);

  return <TestimonialClient initialTestimonials={formatted} carNames={carNames} />;
}

