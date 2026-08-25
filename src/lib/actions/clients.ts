"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ClientStatus } from "@prisma/client";

export async function createClient(formData: FormData) {
  const userId = await getCurrentUserId();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const client = await prisma.client.create({
    data: {
      name,
      industry: (formData.get("industry") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      instagram: (formData.get("instagram") as string) || null,
      linkedin: (formData.get("linkedin") as string) || null,
      taxId: (formData.get("taxId") as string) || null,
      address: (formData.get("address") as string) || null,
      status: (formData.get("status") as ClientStatus) || ClientStatus.PROSPECTO,
      monthlyValue: formData.get("monthlyValue")
        ? Number(formData.get("monthlyValue"))
        : null,
      ownerId: userId,
    },
  });

  await prisma.activity.create({
    data: {
      clientId: client.id,
      userId,
      type: "CAMBIO_ESTADO",
      message: `Cliente "${client.name}" creado`,
    },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}

export async function updateClientStatus(clientId: string, status: ClientStatus) {
  const userId = await getCurrentUserId();
  const client = await prisma.client.update({
    where: { id: clientId },
    data: { status },
  });

  await prisma.activity.create({
    data: {
      clientId,
      userId,
      type: "CAMBIO_ESTADO",
      message: `Estado actualizado a "${status.replaceAll("_", " ")}"`,
    },
  });

  revalidatePath(`/clientes/${clientId}`);
  return client;
}
