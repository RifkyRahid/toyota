import { prisma } from '@/lib/prisma';
import BulkPriceClient from '@/components/admin/BulkPriceClient';

export const revalidate = 0;

export default async function AdminBulkPricePage() {
  const variants = await prisma.carVariant.findMany({
    include: {
      carModel: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: [
      { carModel: { name: 'asc' } },
      { price: 'asc' },
    ],
  });

  const formatted = variants.map((v) => ({
    id: v.id,
    name: v.name,
    price: v.price.toString(),
    carModelId: v.carModelId,
    carName: v.carModel.name,
    category: v.carModel.category,
  }));

  return <BulkPriceClient initialVariants={formatted} />;
}
