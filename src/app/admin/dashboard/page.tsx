import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/admin/DashboardClient';
import type { Lead } from '@prisma/client';

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const [totalLeads, newLeads, dealLeads, carModels, recentLeadsRaw, ctaClicksRaw, allLeadsForStats] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'BARU' } }),
      prisma.lead.count({ where: { status: 'DEAL' } }),
      prisma.carModel.findMany({
        where: { isActive: true },
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.ctaClick.findMany({
        select: { carName: true, buttonType: true, createdAt: true },
      }),
      prisma.lead.findMany({
        select: { carInterest: true, createdAt: true },
      }),
    ]);

  // 1. Hitung distribusi aktivitas per jam (00:00 - 23:00) dari CTA Clicks & Leads
  const hourlyData = Array(24).fill(0);
  for (const click of ctaClicksRaw) {
    const h = new Date(click.createdAt).getHours();
    hourlyData[h] += 1;
  }
  for (const lead of allLeadsForStats) {
    const h = new Date(lead.createdAt).getHours();
    hourlyData[h] += 1;
  }

  // 2. Hitung skor minat per mobil dari klik CTA & prospek masuk
  const carScores: Record<string, number> = {};
  for (const car of carModels) {
    const carLower = car.name.toLowerCase();
    let score = 0;

    for (const click of ctaClicksRaw) {
      if (click.carName && click.carName.toLowerCase().includes(carLower)) {
        score += 1;
      }
    }

    for (const lead of allLeadsForStats) {
      if (lead.carInterest && lead.carInterest.toLowerCase().includes(carLower)) {
        score += 1;
      }
    }

    carScores[car.id] = score;
  }

  // Urutkan mobil berdasarkan skor minat terbanyak
  const sortedCars = [...carModels].sort((a, b) => {
    const scoreDiff = (carScores[b.id] || 0) - (carScores[a.id] || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return Number(a.startingPrice) - Number(b.startingPrice);
  });

  const serializedCars = sortedCars.slice(0, 10).map((car) => ({
    id: car.id,
    name: car.name,
    category: car.category as string,
    startingPrice: car.startingPrice.toString(),
    isPromo: car.isPromo,
    leadCount: carScores[car.id] || 0,
  }));

  const recentLeads = recentLeadsRaw.map((lead: Lead) => ({
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
      hourlyData={hourlyData}
      totalClicks={ctaClicksRaw.length}
    />
  );
}

