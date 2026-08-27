import { prisma } from "@/lib/prisma";
import { FacturacionExplorer } from "./facturacion-explorer";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { client: { select: { id: true, name: true } } },
  });

  const serializable = invoices.map((i) => ({ ...i, amount: Number(i.amount) }));

  return <FacturacionExplorer invoices={serializable} />;
}
