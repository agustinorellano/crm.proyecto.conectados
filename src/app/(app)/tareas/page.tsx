import { prisma } from "@/lib/prisma";
import { TasksExplorer } from "./tasks-explorer";

export const dynamic = "force-dynamic";

export default async function TareasPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ dueDate: "asc" }],
    include: {
      client: { select: { name: true } },
      project: { select: { id: true, name: true } },
      assignee: { select: { firstName: true, lastName: true } },
    },
  });

  return <TasksExplorer tasks={tasks} />;
}
