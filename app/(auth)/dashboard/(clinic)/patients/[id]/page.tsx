import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getActiveClinic } from "@/lib/querys";

import type { Params } from "@/types/route";

export default async function PatientPage({ params }: Params<{ id: string }>) {
  const { id } = await params;

  const activeClinic = await getActiveClinic();

  const patient = await prisma.patient.findFirst({
    where: { id, clinicId: activeClinic!.id },
  });

  if (!patient) {
    notFound();
  }

  return (
    <ul>
      <li>{patient.name}</li>
      <li>{patient.email}</li>
      <li>{patient.phone}</li>
      <li>{patient.birthDate.toDateString()}</li>
    </ul>
  );
}
