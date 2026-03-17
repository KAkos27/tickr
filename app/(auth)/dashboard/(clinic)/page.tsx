import { getActiveClinic } from "@/lib/querys";
import Link from "next/link";
import style from "@/styles/pages/dashboard-home.module.scss";

export default async function DashboardPage() {
  const activeClinic = await getActiveClinic();

  return (
    <div className={style.page}>
      <section className={style.hero}>
        <div className={style.heroCopy}>
          <span className={style.eyebrow}>Aktív rendelő</span>
          <h1>{activeClinic?.name ?? "Rendelő"} dashboard</h1>
          <p>
            Innen gyorsan eléred a pácienseket, időpontokat, rendelőket és
            beavatkozásokat.
          </p>
        </div>
      </section>

      <div className={style.grid}>
        <Link href="/dashboard/appointments" className={style.card}>
          <strong>Naptár</strong>
          <span>Mai időpontok és részletek</span>
        </Link>
        <Link href="/dashboard/patients" className={style.card}>
          <strong>Páciensek</strong>
          <span>Kartonok és kezelési előzmények</span>
        </Link>
        <Link href="/dashboard/operations" className={style.card}>
          <strong>Beavatkozások</strong>
          <span>Árlista és rendelőspecifikus műveletek</span>
        </Link>
        <Link href="/dashboard/clinics" className={style.card}>
          <strong>Rendelők</strong>
          <span>Aktív rendelő és tagok kezelése</span>
        </Link>
      </div>
    </div>
  );
}
