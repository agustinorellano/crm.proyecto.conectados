"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";

export async function createInvoice(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const amount = Number(formData.get("amount") || 0);
  if (!clientId || !amount) throw new Error("Faltan datos obligatorios");

  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      amount,
      number: (formData.get("number") as string) || null,
      description: (formData.get("description") as string) || null,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      status: (formData.get("status") as InvoiceStatus) || InvoiceStatus.BORRADOR,
    },
  });

  await prisma.activity.create({
    data: {
      clientId,
      userId,
      type: "PROPUESTA",
      message: `Factura ${invoice.number ? `#${invoice.number} ` : ""}creada`,
    },
  });

  revalidatePath("/facturacion");
  revalidatePath(`/clientes/${clientId}`);
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt: status === "PAGADA" ? new Date() : null },
  });
  revalidatePath("/facturacion");
  revalidatePath(`/clientes/${invoice.clientId}`);
  return invoice;
}
