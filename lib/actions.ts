"use server";

import { signIn } from "@/auth";
import { auth } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseDateTimeLocalValue } from "@/util/date-converter";
import { type ActionState, type FormAction } from "@/types/common";

export const signInUser = async (formData: FormData) => {
  await signIn("resend", formData);
};

export const createOperation: FormAction<ActionState> = async (
  _prevState,
  formData,
) => {
  const name = formData.get("name")?.toString().trim() ?? "";
  const price = Number(formData.get("price")?.toString().trim() ?? "");

  if (!name || Number.isNaN(price) || price < 0) {
    return { error: "Hibás név vagy ár" };
  }

  try {
    await prisma.operation.create({
      data: { name, price },
    });
  } catch {
    return { error: "Adatbázis hiba" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/operations");
};

export const createAppointment: FormAction<ActionState> = async (
  _prevState,
  formData,
) => {
  const title = formData.get("title")?.toString().trim() ?? "";
  const start = formData.get("start")?.toString().trim() ?? "";
  const end = formData.get("end")?.toString().trim() ?? "";

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Nincs bejelentkezve" };
  }

  const startDate = parseDateTimeLocalValue(start);
  const endDate = parseDateTimeLocalValue(end);

  if (!title) {
    return { error: "Hiányzó cím" };
  }
  if (!startDate || !endDate) {
    return { error: "Hibás dátum" };
  }
  if (endDate <= startDate) {
    return { error: "A befejezésnek későbbinek kell lennie" };
  }

  const patient = await prisma.patient.findFirst({
    where: { doctors: { some: { userId } } },
    select: { id: true },
  });

  if (!patient) {
    return { error: "Nincs hozzárendelt páciens" };
  }

  const operation =
    (await prisma.operation.findFirst({ select: { id: true } })) ??
    (await prisma.operation.create({
      data: { name: "Consultation", price: 0 },
      select: { id: true },
    }));

  try {
    await prisma.appointment.create({
      data: {
        title,
        start: startDate,
        end: endDate,
        userId,
        patientId: patient.id,
        operationId: operation.id,
      },
    });
  } catch {
    return { error: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
};
