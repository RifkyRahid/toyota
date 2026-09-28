import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CarForm from '@/components/admin/CarForm';
import type { SerializedCarModel, SerializedCarVariant } from '@/types';

interface EditMobilPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditMobilPage({ params }: EditMobilPageProps) {
  const { id } = await params;

  const car = await prisma.carModel.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!car) {
    notFound();
  }

  const serializedCar: SerializedCarModel & { variants: SerializedCarVariant[] } = {
    ...car,
    startingPrice: car.startingPrice.toString(),
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
    variants: car.variants.map((v) => ({
      ...v,
      price: v.price.toString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })),
  };

  return <CarForm initialData={serializedCar} isEdit={true} />;
}
