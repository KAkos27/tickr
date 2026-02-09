import prisma from "@/lib/prisma";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

export default async function AppointmentPage({
  params,
}: Params<{ id: string }>) {
  const appointmentId = (await params).id;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) notFound();

  return <div>{appointmentId}</div>;
}
