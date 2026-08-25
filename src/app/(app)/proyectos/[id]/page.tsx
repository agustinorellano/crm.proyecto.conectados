import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectDetail } from "./project-detail";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true } },
      owner: { select: { firstName: true, lastName: true } },
      tasks: {
        orderBy: { createdAt: "asc" },
        include: { assignee: { select: { firstName: true, lastName: true } } },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-2">
      <Link href="/proyectos" className="text-sm text-ink-500 hover:text-brand-600">
        ← Proyectos
      </Link>
      <ProjectDetail project={project} />
    </div>
  );
}
