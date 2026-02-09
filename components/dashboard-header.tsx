import { auth } from "@/auth";
import { getActiveClinic, getUserClinics } from "@/lib/querys";
import { setActiveClinic } from "@/lib/actions";
import style from "@/styles/components/dashboard-header.module.scss";
import Link from "next/link";

export default async function DashboardHeader() {
  const session = await auth();
  const clinics = await getUserClinics();
  const activeClinic = await getActiveClinic();

  return (
    <div className={style.header}>
      <div>
        <Link href={"/"}>Home</Link>
        <Link href={"/dashboard/clinics"}>Rendelők</Link>
        <Link href={"/dashboard/patients"}>Páciensek</Link>
        <Link href={"/dashboard/appointments"}>Naptár</Link>
        <Link href={"/dashboard/operations"}>Beavatkozások</Link>
        <Link href={"/"}>Felhasználók</Link>
      </div>
      {clinics.length > 0 && (
        <form action={setActiveClinic}>
          <select name="clinicId" defaultValue={activeClinic?.id ?? ""}>
            {clinics.map((membership) => (
              <option key={membership.clinicId} value={membership.clinicId}>
                {membership.clinic.name}
              </option>
            ))}
          </select>
          <button type="submit">Váltás</button>
        </form>
      )}
      {session?.user && <div>Signed in as {session.user.email}</div>}
    </div>
  );
}
