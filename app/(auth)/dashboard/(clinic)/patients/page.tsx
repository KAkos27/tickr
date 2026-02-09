import Link from "next/link";
import { getPatientsWithTeeth } from "@/lib/querys";

export default async function PatientsPage() {
  const patients = await getPatientsWithTeeth();

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
