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
import { ToothStatus } from "@/generated/prisma/enums";
import { ALLOWED_COLORS } from "@/lib/colors";
import { TOOTH_STATUS_OPTIONS } from "@/lib/tooth-status";
import { OPERATION_STATUS_MAP } from "@/lib/operation-status-map";

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
    const allOperationIds = [
      ...new Set(toothOperations.flatMap((t) => t.operationIds)),
    ];
    const operationRows = await prisma.operation.findMany({
      where: { id: { in: allOperationIds } },
      select: { id: true, name: true },
    });
    const operationNameById = new Map(operationRows.map((o) => [o.id, o.name]));

    await prisma.$transaction(async (tx) => {
      const currentAppointment = await tx.appointment.create({
        data: {
          title: patient!.name,
          start: startDate!,
          end: endDate!,
          userId,
          patientId: patient!.id,
          clinicId: clinicId!,
        },
      });

      await Promise.all(
        toothOperations.map((t) =>
          tx.patientTooth.upsert({
            where: {
              patientId_toothCode: {
                patientId: patient!.id,
                toothCode: t.toothCode,
              },
            },
            update: {},
            create: {
              patientId: patient!.id,
              toothCode: t.toothCode,
            },
          }),
        ),
      );

      const toothOpData = toothOperations.flatMap((t) =>
        t.operationIds.map((operationId) => ({
          appointmentId: currentAppointment.id,
          toothCode: t.toothCode,
          operationId,
          patientId: patient!.id,
        })),
      );
      await tx.appointmentToothOperation.createMany({ data: toothOpData });

      const statusUpdates: { toothCode: string; status: ToothStatus }[] = [];
      for (const t of toothOperations) {
        let resultingStatus: ToothStatus | null = null;
        for (const opId of t.operationIds) {
          const name = operationNameById.get(opId);
          if (name && name in OPERATION_STATUS_MAP) {
            resultingStatus = OPERATION_STATUS_MAP[name];
          }
        }
        if (resultingStatus) {
          statusUpdates.push({
            toothCode: t.toothCode,
            status: resultingStatus,
          });
        }
      }
      await Promise.all(
        statusUpdates.map((u) =>
          tx.patientTooth.update({
            where: {
              patientId_toothCode: {
                patientId: patient!.id,
                toothCode: u.toothCode,
              },
            },
            data: { status: u.status },
          }),
        ),
      );
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/appointments");
  redirect("/dashboard/appointments");
};

export const updateMemberColor = async (
  _prevState: { message?: string },
  formData: FormData,
): Promise<{ message?: string }> => {
  const color = formData.get("color")?.toString().trim() ?? "";

  if (!(ALLOWED_COLORS as readonly string[]).includes(color)) {
    return { message: "Érvénytelen szín" };
  }

  const { userId, clinicId } = await getUserClinicContext();

  if (!clinicId) {
    return { message: "Nincs aktív rendelő" };
  }

  try {
    await prisma.clinicMember.updateMany({
      where: { clinicId, userId },
      data: { color },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard", "layout");
  return { message: "Szín frissítve" };
};

export const updateToothStatus = async (
  _prevState: { message?: string },
  formData: FormData,
): Promise<{ message?: string }> => {
  const patientId = formData.get("patientId")?.toString().trim() ?? "";
  const toothCode = formData.get("toothCode")?.toString().trim() ?? "";
  const status = formData.get("status")?.toString().trim() ?? "";

  if (!patientId || !toothCode) {
    return { message: "Hiányzó adatok" };
  }

  if (!(TOOTH_STATUS_OPTIONS as readonly string[]).includes(status)) {
    return { message: "Érvénytelen státusz" };
  }

  const { clinicId } = await getUserClinicContext();

  if (!clinicId) {
    return { message: "Nincs aktív rendelő" };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
  });

  if (!patient) {
    return { message: "Ismeretlen páciens" };
  }

  try {
    await prisma.patientTooth.upsert({
      where: {
        patientId_toothCode: { patientId, toothCode },
      },
      update: { status: status as ToothStatus },
      create: {
        patientId,
        toothCode,
        status: status as ToothStatus,
      },
    });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  return { message: "Státusz frissítve" };
};
