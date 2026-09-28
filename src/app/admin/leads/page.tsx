import { prisma } from '@/lib/prisma';
import LeadsClient, { LeadItem } from '@/components/admin/LeadsClient';

export const revalidate = 0;

export default async function AdminLeadsPage() {
  const leadsRaw = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formatted: LeadItem[] = leadsRaw.map((l) => ({
    id: l.id,
    name: l.name,
    whatsapp: l.whatsapp,
    sourcePage: l.sourcePage,
    carInterest: l.carInterest,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
  }));

  return <LeadsClient initialLeads={formatted} />;
}
