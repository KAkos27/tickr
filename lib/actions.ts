"use server";

import { signIn } from "@/auth";
import { auth } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  AppointmentFormError,
  ClinicFormError,
  CreateAppointmentState,
  CreateClinicState,
  InviteClinicMemberState,
} from "@/types/common";
import { AuthError } from "next-auth";
import { parseDateTimeLocalValue } from "./utils";
import { ClinicRole } from "@/generated/prisma/enums";

const getUserClinicContext = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      activeClinicId: true,
      clinicMemberships: {
        select: { clinicId: true, role: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    throw new AuthError();
  }

  let clinicId = user.activeClinicId;
  if (!clinicId && user.clinicMemberships.length > 0) {
    clinicId = user.clinicMemberships[0].clinicId;
    await prisma.user.update({
      where: { id: userId },
      data: { activeClinicId: clinicId },
    });
  }

  const membership = clinicId
    ? (user.clinicMemberships.find((item) => item.clinicId === clinicId) ??
      null)
    : null;

  return { userId, clinicId, membership };
};

export const signInUser = async (formData: FormData) => {
  await signIn("resend", formData);
};

export const createClinic = async (
  _prevState: CreateClinicState,
  formData: FormData,
): Promise<CreateClinicState> => {
  const name = formData.get("name")?.toString().trim() ?? "";

  const errors: ClinicFormError = {
    name: [],
    email: [],
  };

  if (!name) {
    errors.name.push("Hiányzó név");
  }

  if (errors.name.length) {
    return { error: errors };
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError();
  }

  try {
    const clinic = await prisma.clinic.create({
      data: {
        name,
        members: {
          create: { userId, role: ClinicRole.OWNER },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { activeClinicId: clinic.id },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
};

export const setActiveClinic = async (formData: FormData) => {
  const clinicId = formData.get("clinicId")?.toString().trim() ?? "";

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError();
  }

  if (!clinicId) {
    redirect("/dashboard/clinics");
  }

  const membership = await prisma.clinicMember.findFirst({
    where: { clinicId, userId },
  });

  if (!membership) {
    redirect("/dashboard/clinics");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { activeClinicId: clinicId },
  });

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
};

export const inviteClinicMember = async (
  _prevState: InviteClinicMemberState,
  formData: FormData,
): Promise<InviteClinicMemberState> => {
  const email = formData.get("email")?.toString().trim() ?? "";
  const clinicId = formData.get("clinicId")?.toString().trim() ?? "";

  const errors: ClinicFormError = {
    name: [],
    email: [],
  };

  if (!email) {
    errors.email.push("Hiányzó email");
  }

  if (!clinicId) {
    errors.email.push("Hiányzó rendelő");
  }

  if (errors.email.length) {
    return { error: errors };
  }

  const { membership } = await getUserClinicContext();

  if (!membership || membership.clinicId !== clinicId) {
    return { message: "Nincs jogosultság" };
  }

  if (membership.role === ClinicRole.MEMBER) {
    return { message: "Nincs jogosultság" };
  }

  const existing = await prisma.clinicMember.findFirst({
    where: {
      clinicId,
      OR: [{ email }, { user: { email } }],
    },
  });

  if (existing) {
    return { message: "Már tag" };
  }

  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  try {
    await prisma.clinicMember.create({
      data: {
        clinicId,
        email,
        userId: targetUser?.id ?? null,
        role: ClinicRole.MEMBER,
      },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/clinics");
  return { message: "Meghívó elküldve" };
};

export const createAppointment = async (
  _prevState: CreateAppointmentState,
  formData: FormData,
): Promise<CreateAppointmentState> => {
  const patientId = formData.get("patient")?.toString().trim() ?? "";
  const start = formData.get("start")?.toString().trim() ?? "";
  const end = formData.get("end")?.toString().trim() ?? "";
  const rawToothOperations =
    formData.get("toothOperations")?.toString().trim() ?? "[]";
  const { userId, clinicId, membership } = await getUserClinicContext();

  const patient = patientId
    ? await prisma.patient.findFirst({
        where: { id: patientId, clinicId: clinicId ?? "" },
      })
    : null;
  const startDate = parseDateTimeLocalValue(start);
  const endDate = parseDateTimeLocalValue(end);

  const errors: AppointmentFormError = {
    patient: [],
    date: [],
    teeth: [],
  };

  type ToothOperationInput = {
    toothCode: string;
    operationIds: string[];
  };

  let toothOperations: ToothOperationInput[] = [];
  try {
    toothOperations = JSON.parse(rawToothOperations);
  } catch {
    errors.teeth.push("Hibás fog adatok");
  }

  if (!clinicId || !membership) {
    errors.patient.push("Nincs aktív rendelő");
  }

  if (!patientId) {
    errors.patient.push("Hiányzó páciens");
  } else if (!patient) {
    errors.patient.push("Ismeretlen páciens");
  }

  if (!startDate || !endDate) {
    errors.date.push("Hibás dátum");
  }

  if (startDate && endDate && endDate <= startDate) {
    errors.date.push("Hibás dátum");
  }

  if (toothOperations.length === 0) {
    errors.teeth.push("Válassz legalább egy fogat");
  } else {
    const missingOperations = toothOperations.filter(
      (item) => item.operationIds.length === 0,
    );
    if (missingOperations.length > 0) {
      errors.teeth.push("Válassz beavatkozást minden kijelölt foghoz");
    }
  }

  if (startDate && endDate && clinicId) {
    const overlap = await prisma.appointment.findFirst({
      where: {
        clinicId,
        start: { lt: endDate },
        end: { gt: startDate },
      },
    });

    if (overlap) {
      errors.date.push("Az idősáv már foglalt");
    }
  }

  if (errors.date.length || errors.patient.length || errors.teeth.length) {
    return { error: errors };
  }

  try {
    const currentAppointment = await prisma.appointment.create({
      data: {
        title: patient!.name,
        start: startDate!,
        end: endDate!,
        userId,
        patientId: patient!.id,
        clinicId: clinicId!,
      },
    });

    toothOperations.forEach((operation) => {
      operation.operationIds.forEach(async (_id, i) => {
        await prisma.appointmentToothOperation.create({
          data: {
            appointmentId: currentAppointment.id,
            toothCode: operation.toothCode,
            operationId: operation.operationIds[i],
            patientId: patient!.id,
          },
        });
      });
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/appointments");
  redirect("/dashboard/appointments");
};
