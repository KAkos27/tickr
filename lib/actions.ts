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
  // const title = formData.get("title")?.toString().trim() ?? "";
  const patientId = formData.get("patient")?.toString().trim() ?? "";
  const start = formData.get("start")?.toString().trim() ?? "";
  const end = formData.get("end")?.toString().trim() ?? "";
  const rawToothOperations =
    formData.get("toothOperations")?.toString().trim() ?? "[]";

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthError();
  }

  const patient = patientId
    ? await prisma.patient.findUnique({ where: { id: patientId } })
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
    const parsed = JSON.parse(rawToothOperations);
    toothOperations = parsed;
  } catch {
    errors.teeth.push("Hibás fog adatok");
  }

  console.log(toothOperations);

  // if (!title) {
  //   errors.title.push("Hiányzó cím");
  // }

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

  // if (patient && userId) {
  //   const assignment = await prisma.userPatient.findUnique({
  //     where: { userId_patientId: { userId, patientId: patient.id } },
  //   });

  //   if (!assignment) {
  //     errors.patient.push("Nincs hozzárendelt páciens");
  //   }
  // }

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

  // if (patient && toothOperations.length > 0) {
  //   const patientTeeth = await prisma.patientTooth.findMany({
  //     where: { patientId: patient.id },
  //     select: { toothCode: true },
  //   });
  //   const allowedTeeth = new Set(patientTeeth.map((t) => t.toothCode));
  //   const invalidTeeth = toothOperations.filter(
  //     (item) => !allowedTeeth.has(item.toothCode),
  //   );
  //   if (invalidTeeth.length > 0) {
  //     errors.teeth.push("Ismeretlen fog(ak) a páciensnél");
  //   }
  // }

  // if (toothOperations.length > 0) {
  //   const uniqueOperationIds = Array.from(
  //     new Set(toothOperations.flatMap((item) => item.operationIds)),
  //   );
  //   if (uniqueOperationIds.length > 0) {
  //     const validOperations = await prisma.operation.findMany({
  //       where: { id: { in: uniqueOperationIds } },
  //       select: { id: true },
  //     });
  //     const validOperationIds = new Set(validOperations.map((op) => op.id));
  //     const invalidOperation = toothOperations.some((item) =>
  //       item.operationIds.some((opId) => !validOperationIds.has(opId)),
  //     );
  //     if (invalidOperation) {
  //       errors.teeth.push("Ismeretlen beavatkozás a foghoz");
  //     }
  //   }
  // }

  if (startDate && endDate && userId) {
    const overlap = await prisma.appointment.findFirst({
      where: {
        userId,
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

    // await prisma.$transaction(async (tx) => {
    //   const appointment = await tx.appointment.create({
    //     data: {
    //       title,
    //       start: startDate!,
    //       end: endDate!,
    //       userId,
    //       patientId: patient!.id,
    //     },
    //   });

    //   if (toothOperations.length > 0) {
    //     await tx.appointmentToothOperation.createMany({
    //       data: toothOperations.flatMap((item) =>
    //         item.operationIds.map((opId) => ({
    //           appointmentId: appointment.id,
    //           toothCode: item.toothCode,
    //           patientId: patient!.id,
    //           operationId: opId,
    //         })),
    //       ),
    //       skipDuplicates: true,
    //     });
    //   }
    // });
  } catch {
    return { message: "Adatbázis hiba" };
  }

  revalidatePath("/dashboard/appointments");
  redirect("/dashboard/appointments");
};
