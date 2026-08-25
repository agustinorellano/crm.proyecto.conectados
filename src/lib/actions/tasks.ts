"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { Priority, TaskStatus } from "@prisma/client";

export async function createTask(formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("El título es obligatorio");

  const clientId = (formData.get("clientId") as string) || null;
  const projectId = (formData.get("projectId") as string) || null;

  const task = await prisma.task.create({
    data: {
      title,
      description: (formData.get("description") as string) || null,
      clientId,
      projectId,
      assigneeId: (formData.get("assigneeId") as string) || null,
      priority: (formData.get("priority") as Priority) || Priority.MEDIA,
      status: TaskStatus.POR_HACER,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
    },
  });

  if (clientId) {
    await prisma.activity.create({
      data: {
        clientId,
        projectId,
        userId,
        type: "TAREA",
        message: `Tarea "${task.title}" creada`,
      },
    });
  }

  revalidatePath("/tareas");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const task = await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/tareas");
  if (task.projectId) revalidatePath(`/proyectos/${task.projectId}`);
  if (task.clientId) revalidatePath(`/clientes/${task.clientId}`);
  return task;
}

export async function addTaskComment(taskId: string, body: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");
  if (!body.trim()) return;

  await prisma.taskComment.create({
    data: { taskId, authorId: userId, body: body.trim() },
  });
  revalidatePath("/tareas");
}
