import { prisma } from "@/lib/prisma";
import { ProjectsExplorer } from "./projects-explorer";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      owner: { select: { firstName: true, lastName: true } },
      _count: { select: { tasks: true } },
    },
  });

  return <ProjectsExplorer projects={projects} />;
}
