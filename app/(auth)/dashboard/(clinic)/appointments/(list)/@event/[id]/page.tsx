import Teeth from "@/components/teeth";
import prisma from "@/lib/prisma";
import {
  getActiveClinic,
  getOperation,
  getOperations,
  getPatientWithTeeth,
} from "@/lib/querys";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

export default async function AppointmentPage({
  params,
}: Params<{ id: string }>) {
  const appointmentId = (await params).id;

  const activeClinic = await getActiveClinic();

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, clinicId: activeClinic!.id },
  });

  const selectedPatient = await getPatientWithTeeth(appointment?.patientId);
  const operations = await getOperations();

  if (!appointment) notFound();

  return (
    <div>
      {appointmentId}
      <Teeth selectedPatient={selectedPatient} operations={operations} />
    </div>
  );
}
