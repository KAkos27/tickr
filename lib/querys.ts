"use server";

import { cache } from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ── Per-request deduplication ────────────────────────────────────────────────
// React cache() memoises within a single server render so repeated calls
// from different query functions hit the DB only once per request.
const getSession = cache(() => auth());
const getClinicId = cache((userId: string) => ensureActiveClinicId(userId));

const ensureActiveClinicId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      activeClinicId: true,
      clinicMemberships: {
        select: { clinicId: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) return null;
  if (user.activeClinicId) return user.activeClinicId;

  const fallbackClinicId = user.clinicMemberships[0]?.clinicId ?? null;
  if (!fallbackClinicId) return null;

  await prisma.user.update({
    where: { id: userId },
    data: { activeClinicId: fallbackClinicId },
  });

  return fallbackClinicId;
};

export const getActiveClinic = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const activeClinicId = await getClinicId(userId);
  if (!activeClinicId) return null;

  return await prisma.clinic.findUnique({ where: { id: activeClinicId } });
};

export const getUserClinics = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const memberships = await prisma.clinicMember.findMany({
    where: { userId },
    include: { clinic: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships;
};

export const getAppointments = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  const appointments = await prisma.appointment.findMany({
    where: { clinicId },
    orderBy: { start: "asc" },
    include: {
      user: {
        select: {
          id: true,
          clinicMemberships: {
            where: { clinicId },
            select: { color: true },
            take: 1,
          },
        },
      },
    },
  });

  return appointments.map((a) => ({
    ...a,
    user: a.user
      ? {
          id: a.user.id,
          color: a.user.clinicMemberships[0]?.color ?? "#5d8da8",
        }
      : null,
  }));
};

export const getAppointmentDetails = async (id: string | undefined) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  if (!id) return null;

  const clinicId = await getClinicId(userId);
  if (!clinicId) return null;

  return await prisma.appointment.findFirst({
    where: { id, clinicId },
    include: {
      user: { select: { name: true } },
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          birthDate: true,
        },
      },
      toothOperations: {
        select: {
          toothCode: true,
          operation: {
            select: {
              id: true,
              name: true,
              clinicPrices: {
                where: { clinicId },
                select: { price: true },
              },
            },
          },
        },
      },
    },
  });
};

export const getPatients = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  return await prisma.patient.findMany({ where: { clinicId } });
};

export const getUserPatients = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  const patients = await prisma.patient.findMany({
    where: { clinicId },
  });

  return patients;
};

export const getPatientWithTeeth = async (id: string | undefined) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  if (!id) return null;

  const clinicId = await getClinicId(userId);
  if (!clinicId) return null;

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId },
    include: {
      teeth: {
        select: {
          toothCode: true,
          status: true,
          operations: {
            select: { appointmentId: true },
            take: 1,
          },
        },
      },
    },
  });

  return patient;
};

export const getPatientAppointmentHistory = async (
  patientId: string | undefined,
) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  if (!patientId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  return await prisma.appointment.findMany({
    where: { patientId, clinicId },
    orderBy: { start: "desc" },
    include: {
      user: { select: { name: true } },
      toothOperations: {
        select: {
          toothCode: true,
          operation: {
            select: {
              name: true,
              clinicPrices: {
                where: { clinicId },
                select: { price: true },
              },
            },
          },
        },
      },
    },
  });
};

export const getPatientsWithTeeth = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  const patients = await prisma.patient.findMany({
    where: { clinicId },
    include: {
      teeth: {
        select: {
          toothCode: true,
          status: true,
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
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return [];

  const clinicId = await getClinicId(userId);
  if (!clinicId) return [];

  const prices = await prisma.clinicOperationPrice.findMany({
    where: { clinicId },
    include: { operation: true },
    orderBy: { operation: { name: "asc" } },
  });

  return prices.map((price) => ({
    id: price.operationId,
    name: price.operation.name,
    price: price.price,
  }));
};

export const getOperation = async (id: string) => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const clinicId = await getClinicId(userId);
  if (!clinicId) return null;

  const price = await prisma.clinicOperationPrice.findFirst({
    where: { clinicId, operationId: id },
    include: { operation: true },
  });

  if (!price) return null;

  return {
    id: price.operationId,
    name: price.operation.name,
    price: price.price,
  };
};

export const getCurrentMemberColor = async () => {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return "#5d8da8";

  const clinicId = await getClinicId(userId);
  if (!clinicId) return "#5d8da8";

  const member = await prisma.clinicMember.findFirst({
    where: { clinicId, userId },
    select: { color: true },
  });

  return member?.color ?? "#5d8da8";
};

export const getCurrentUserId = async () => {
  const session = await getSession();
  return session?.user?.id ?? null;
};
