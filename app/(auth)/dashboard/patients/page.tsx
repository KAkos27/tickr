import Link from "next/link";
import { getPatients } from "@/lib/querys";

export default async function PatientsPage() {
  const patients = await getPatients();

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
