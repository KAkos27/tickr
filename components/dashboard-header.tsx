import { auth } from "@/auth";
import { getActiveClinic, getCurrentMemberColor, getUserClinics } from "@/lib/querys";
import { setActiveClinic, updateMemberColor } from "@/lib/actions";
import ColorPicker from "@/components/color-picker";
import ClinicSwitcher from "@/components/clinic-switcher";
import style from "@/styles/components/dashboard-header.module.scss";
import Link from "next/link";

export default async function DashboardHeader() {
  const [session, clinics, activeClinic, currentColor] = await Promise.all([
    auth(),
    getUserClinics(),
    getActiveClinic(),
    getCurrentMemberColor(),
  ]);

  const clinicOptions = clinics.map((m) => ({
    clinicId: m.clinicId,
    clinicName: m.clinic.name,
  }));

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
          <ClinicSwitcher
            clinics={clinicOptions}
            activeClinicId={activeClinic?.id ?? null}
            action={setActiveClinic}
          />

          {activeClinic && (
            <ColorPicker
              currentColor={currentColor}
              action={updateMemberColor}
            />
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
