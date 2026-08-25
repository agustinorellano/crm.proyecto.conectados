"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { ContentPlatform } from "@prisma/client";

export async function createContentItem(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!clientId || !title) throw new Error("Faltan datos obligatorios");

  await prisma.contentItem.create({
    data: {
      clientId,
      title,
      platform: (formData.get("platform") as ContentPlatform) || ContentPlatform.INSTAGRAM,
      copy: (formData.get("copy") as string) || null,
      scheduledAt: formData.get("scheduledAt")
        ? new Date(formData.get("scheduledAt") as string)
        : null,
      ownerId: userId,
    },
  });

  revalidatePath("/contenido");
  revalidatePath(`/clientes/${clientId}`);
}
