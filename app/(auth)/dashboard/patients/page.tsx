import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export default async function PatientsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const patients = await prisma.patient.findMany({
    where: { doctors: { some: { userId } } },
  });

  if (!patients) {
    return <div>Nincsenek páciensek</div>;
  }

  return (
    <div>
      {patients.map((patient) => (
        <Link href={`/dashboard/patients/${patient.id}`} key={patient.id}>
          {patient.name}
        </Link>
      ))}
    </div>
  );
}
