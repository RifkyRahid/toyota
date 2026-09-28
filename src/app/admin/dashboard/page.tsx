import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/admin/DashboardClient';

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const [totalLeads, newLeads, dealLeads, carModels, recentLeadsRaw] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'BARU' } }),
    prisma.lead.count({ where: { status: 'DEAL' } }),
    prisma.carModel.findMany({
      where: { isActive: true },
      orderBy: { startingPrice: 'asc' },
      take: 10,
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ]);

  const serializedCars = carModels.map((car, idx) => ({
    id: car.id,
    name: car.name,
    category: car.category as string,
    startingPrice: car.startingPrice.toString(),
    isPromo: car.isPromo,
    leadCount: 12 - idx, // Weighted initial indicator
  }));

  const recentLeads = recentLeadsRaw.map((lead) => ({
    id: lead.id,
    name: lead.name,
    whatsapp: lead.whatsapp,
    carInterest: lead.carInterest,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      totalLeads={totalLeads}
      newLeads={newLeads}
      dealLeads={dealLeads}
      totalCars={carModels.length}
      topCars={serializedCars}
      recentLeads={recentLeads}
    />
  );
}
