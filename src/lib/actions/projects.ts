"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Priority, ProjectStatus } from "@prisma/client";

export async function createProject(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const name = String(formData.get("name") || "").trim();
  if (!clientId || !name) throw new Error("Faltan datos obligatorios");

  const project = await prisma.project.create({
    data: {
      clientId,
      name,
      description: (formData.get("description") as string) || null,
      priority: (formData.get("priority") as Priority) || Priority.MEDIA,
      status: ProjectStatus.BACKLOG,
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : null,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      ownerId: userId,
    },
  });

  await prisma.activity.create({
    data: {
      clientId,
      projectId: project.id,
      userId,
      type: "PROYECTO",
      message: `Proyecto "${project.name}" creado`,
    },
  });

  revalidatePath("/proyectos");
  revalidatePath(`/clientes/${clientId}`);
  redirect(`/proyectos/${project.id}`);
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath("/proyectos");
  return project;
}
