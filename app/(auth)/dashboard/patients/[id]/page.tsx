import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

import type { Params } from "@/types/route";

export default async function PatientPage({ params }: Params<{ id: string }>) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({ where: { id } });

  console.log(patient);

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
