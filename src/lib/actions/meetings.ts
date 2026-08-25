"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { MeetingType } from "@prisma/client";

export async function createMeeting(formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "10:00");
  if (!title || !date) throw new Error("Faltan datos obligatorios");

  const clientId = (formData.get("clientId") as string) || null;
  const startsAt = new Date(`${date}T${time}:00`);

  await prisma.meeting.create({
    data: {
      title,
      type: (formData.get("type") as MeetingType) || MeetingType.REUNION,
      clientId,
      startsAt,
      location: (formData.get("location") as string) || null,
      notes: (formData.get("notes") as string) || null,
      ownerId: userId,
    },
  });

  if (clientId) {
    await prisma.activity.create({
      data: {
        clientId,
        userId,
        type: "REUNION",
        message: `Reunión "${title}" agendada`,
      },
    });
  }

  revalidatePath("/calendario");
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}
