"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createFile(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const name = String(formData.get("name") || "").trim();
  const driveUrl = String(formData.get("driveUrl") || "").trim();
  if (!clientId || !name) throw new Error("Faltan datos obligatorios");

  await prisma.file.create({
    data: { clientId, name, driveUrl: driveUrl || null, uploadedById: userId },
  });

  await prisma.activity.create({
    data: { clientId, userId, type: "ARCHIVO", message: `Archivo "${name}" vinculado` },
  });

  revalidatePath(`/clientes/${clientId}`);
}
