"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DealStage } from "@prisma/client";

const STAGE_PROBABILITY: Record<DealStage, number> = {
  LEAD: 10,
  CONTACTADO: 20,
  REUNION_AGENDADA: 30,
  REUNION_REALIZADA: 40,
  PROPUESTA_ENVIADA: 55,
  NEGOCIACION: 70,
  GANADO: 100,
  PERDIDO: 0,
};

export async function createDeal(formData: FormData) {
  const userId = await getCurrentUserId();
  const clientId = String(formData.get("clientId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!clientId || !title) throw new Error("Faltan datos obligatorios");

  const stage = (formData.get("stage") as DealStage) || DealStage.LEAD;

  await prisma.deal.create({
    data: {
      clientId,
      title,
      stage,
      value: formData.get("value") ? Number(formData.get("value")) : null,
      probability: STAGE_PROBABILITY[stage],
      nextAction: (formData.get("nextAction") as string) || null,
      nextActionAt: formData.get("nextActionAt")
        ? new Date(formData.get("nextActionAt") as string)
        : null,
      ownerId: userId,
    },
  });

  revalidatePath("/pipeline");
  redirect("/pipeline");
}

export async function moveDealStage(dealId: string, stage: DealStage) {
  await prisma.deal.update({
    where: { id: dealId },
    data: { stage, probability: STAGE_PROBABILITY[stage] },
  });
  revalidatePath("/pipeline");
}
