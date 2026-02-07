"use server";

import { signIn } from "@/auth";
import { auth } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  AppointmentFormError,
  CreateAppointmentState,
  CreateOperationState,
  OperationFormError,
} from "@/types/common";
import { AuthError } from "next-auth";
import { parseDateTimeLocalValue } from "./utils";

export const signInUser = async (formData: FormData) => {
  await signIn("resend", formData);
};

export const createOperation = async (
  _prevState: CreateOperationState,
  formData: FormData,
): Promise<CreateOperationState> => {
  const name = formData.get("name")?.toString().trim() ?? "";
  const price = Number(formData.get("price")?.toString().trim() ?? "");

  const errors: OperationFormError = {
    name: [],
    price: [],
  };

  if (!name) {
    errors.name.push("Hibás név");
  }

  if (Number.isNaN(price) || price < 0) {
    errors.price.push("Hibás ár");
  }

  if (errors.name.length || errors.price.length) {
    return { error: errors };
  }

  try {
    await prisma.operation.create({
      data: { name, price },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/operations");
};

export const createAppointment = async (
  _prevState: CreateAppointmentState,
  formData: FormData,
): Promise<CreateAppointmentState> => {
  const title = formData.get("title")?.toString().trim() ?? "";
  const patientId = formData.get("patient")?.toString().trim() ?? "";
  const operationId = formData.get("operation")?.toString().trim() ?? "";
  const start = formData.get("start")?.toString().trim() ?? "";
  const end = formData.get("end")?.toString().trim() ?? "";

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError();
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  const operation = await prisma.operation.findUnique({
    where: { id: operationId },
  });
  const startDate = parseDateTimeLocalValue(start);
  const endDate = parseDateTimeLocalValue(end);

  const errors: AppointmentFormError = {
    title: [],
    patient: [],
    operation: [],
    date: [],
  };

  if (!title) {
    errors.title.push("Hiányzó cím");
  }

  if (!patient) {
    errors.patient.push("Nincs hozzárendelt páciens");
  }

  if (!operation) {
    errors.operation.push("Nincs hozzárendelt kezelés");
  }

  if (!startDate || !endDate) {
    errors.date.push("Hibás dátum");
  }

  if (startDate && endDate && endDate <= startDate) {
    errors.date.push("Hibás dátum");
  }

  if (
    errors.date.length ||
    errors.operation.length ||
    errors.patient.length ||
    errors.title.length
  ) {
    return { error: errors };
  }

  try {
    await prisma.appointment.create({
      data: {
        title,
        start: startDate!,
        end: endDate!,
        userId,
        patientId: patient!.id,
        operationId: operation!.id,
      },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
};
