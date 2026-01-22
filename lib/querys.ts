"use server";
import prisma from "@/lib/prisma";

export const getAppointments = async (id: string | undefined) => {
  if (!id) return [];

  const appointments = await prisma.appointment.findMany({
    where: { userId: id },
    orderBy: { startTime: "asc" },
  });

  return appointments;
};
