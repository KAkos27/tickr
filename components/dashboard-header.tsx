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
    <header className={style.header}>
      <div className={style.inner}>
        <nav className={style.nav} aria-label="Dashboard navigation">
          <Link href="/" className={style.brand}>
            Tickr
          </Link>
          <Link href="/dashboard/clinics" className={style.navLink}>
            Rendelők
          </Link>
          <Link href="/dashboard/patients" className={style.navLink}>
            Páciensek
          </Link>
          <Link href="/dashboard/appointments" className={style.navLink}>
            Naptár
          </Link>
          <Link href="/dashboard/operations" className={style.navLink}>
            Beavatkozások
          </Link>
        </nav>

        <div className={style.utilities}>
          {clinics.length > 0 && (
            <form action={setActiveClinic} className={style.switcher}>
              <select
                className={style.switcherSelect}
                name="clinicId"
                defaultValue={activeClinic?.id ?? ""}
              >
                {clinics.map((membership) => (
                  <option key={membership.clinicId} value={membership.clinicId}>
                    {membership.clinic.name}
                  </option>
                ))}
              </select>
              <button type="submit" className={style.switcherButton}>
                Váltás
              </button>
            </form>
          )}

          {session?.user && (
            <div className={style.userBadge}>
              <span>Bejelentkezve</span>
              <strong>{session.user.email}</strong>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
