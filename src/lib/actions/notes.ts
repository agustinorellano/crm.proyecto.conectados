"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");

  const clientId = String(formData.get("clientId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!clientId || !body) throw new Error("Faltan datos obligatorios");

  await prisma.note.create({ data: { clientId, authorId: userId, body } });

  await prisma.activity.create({
    data: { clientId, userId, type: "NOTA", message: "Se agregó una nota" },
  });

  revalidatePath(`/clientes/${clientId}`);
}
