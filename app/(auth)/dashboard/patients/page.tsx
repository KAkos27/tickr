import Link from "next/link";
import { getUserPatients } from "@/lib/querys";

export default async function PatientsPage() {
  const patients = await getUserPatients();

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
