"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const getAppointments = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { start: "asc" },
  });

  return appointments;
};

export const getPatients = async () => {
  return await prisma.patient.findMany();
};

export const getUserPatients = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return [];

  const patients = await prisma.patient.findMany({
    where: { doctors: { some: { userId } } },
  });

  return patients;
};

export const getPatientsWithTeeth = async () => {
  const patients = await prisma.patient.findMany({
    include: {
      teeth: {
        select: {
          toothCode: true,
          operations: {
            select: { appointmentId: true },
            take: 1,
          },
        },
      },
    },
  });

  return patients;
};

export const getOperations = async () => {
  return await prisma.operation.findMany();
};

export const getOperation = async (id: string) => {
  return await prisma.operation.findUnique({ where: { id } });
};
