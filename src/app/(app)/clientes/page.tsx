import { prisma } from "@/lib/prisma";
import { ClientsExplorer } from "./clients-explorer";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      _count: { select: { projects: true, tasks: true } },
    },
  });

  const serializable = clients.map((c) => ({
    ...c,
    monthlyValue: c.monthlyValue ? Number(c.monthlyValue) : null,
    annualValue: c.annualValue ? Number(c.annualValue) : null,
  }));

  return <ClientsExplorer clients={serializable} />;
}
