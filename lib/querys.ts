"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const getAppointments = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { start: "asc" },
  });

  return appointments;
};

export const getPatients = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  const patients = await prisma.patient.findMany({
    where: { doctors: { some: { userId } } },
  });

  return patients;
};

export const getOperation = async (id: string) => {
  return await prisma.operation.findUnique({ where: { id } });
};
