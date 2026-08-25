"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createProposal(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const description = String(formData.get("description") || "").trim();
  if (!clientId || !description) throw new Error("Faltan datos obligatorios");

  await prisma.proposal.create({
    data: {
      clientId,
      description,
      price: formData.get("price") ? Number(formData.get("price")) : null,
      frequency: (formData.get("frequency") as string) || null,
      ownerId: userId,
    },
  });

  await prisma.activity.create({
    data: { clientId, userId, type: "PROPUESTA", message: "Se registró una propuesta" },
  });

  revalidatePath(`/clientes/${clientId}`);
}
