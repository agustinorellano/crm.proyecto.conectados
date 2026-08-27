import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientProfile } from "./client-profile";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      contacts: { orderBy: { isPrimary: "desc" } },
      services: { include: { service: true } },
      projects: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" }, include: { assignee: { select: { firstName: true, lastName: true } } } },
      meetings: { orderBy: { startsAt: "asc" } },
      contentItems: { orderBy: { scheduledAt: "asc" } },
      metricValues: { orderBy: { periodEnd: "desc" }, take: 20 },
      proposals: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { issueDate: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { firstName: true, lastName: true } } } },
      files: { orderBy: { createdAt: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!client) notFound();

  const serializable = {
    ...client,
    monthlyValue: client.monthlyValue ? Number(client.monthlyValue) : null,
    annualValue: client.annualValue ? Number(client.annualValue) : null,
    services: client.services.map((s) => ({
      ...s,
      monthlyFee: s.monthlyFee ? Number(s.monthlyFee) : null,
    })),
    proposals: client.proposals.map((p) => ({ ...p, price: p.price ? Number(p.price) : null })),
    invoices: client.invoices.map((i) => ({ ...i, amount: Number(i.amount) })),
    metricValues: client.metricValues.map((m) => ({ ...m, value: Number(m.value) })),
  };

  return <ClientProfile client={serializable} />;
}
