import { prisma } from '@/lib/prisma';
import KatalogListClient from '@/components/admin/KatalogListClient';
import type { SerializedCarModel } from '@/types';

export const revalidate = 0;

export default async function AdminKatalogPage() {
  const cars = await prisma.carModel.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serializedCars: SerializedCarModel[] = cars.map((car) => ({
    ...car,
    startingPrice: car.startingPrice.toString(),
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
  }));

  return <KatalogListClient cars={serializedCars} />;
}
