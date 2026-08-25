import { prisma } from "@/lib/prisma";
import { PipelineBoard } from "./pipeline-board";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const deals = await prisma.deal.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      owner: { select: { firstName: true, lastName: true } },
    },
  });

  const serializable = deals.map((d) => ({ ...d, value: d.value ? Number(d.value) : null }));

  return <PipelineBoard deals={serializable} />;
}
