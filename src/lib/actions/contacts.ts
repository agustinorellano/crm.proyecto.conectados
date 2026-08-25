"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContact(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  if (!clientId || !firstName) throw new Error("Faltan datos obligatorios");

  await prisma.contact.create({
    data: {
      clientId,
      firstName,
      lastName,
      role: (formData.get("role") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      isPrimary: formData.get("isPrimary") === "on",
    },
  });

  revalidatePath(`/clientes/${clientId}`);
}
