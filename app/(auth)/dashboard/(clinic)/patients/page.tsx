import Link from "next/link";
import { getPatientsWithTeeth } from "@/lib/querys";
import { formatDate } from "@/lib/utils";
import style from "@/styles/pages/patients-page.module.scss";

export default async function PatientsPage() {
  const patients = await getPatientsWithTeeth();

  return (
    <div className={style.page}>
      <section className={style.hero}>
        <div className={style.heroCopy}>
          <span className={style.eyebrow}>Páciensek</span>
          <h1>Páciens lista</h1>
          <p>
            Gyors áttekintés az aktív rendelő pácienseiről és a kartonokhoz vezető
            linkekről.
          </p>
        </div>
        <span className={style.summaryBadge}>{patients.length} páciens</span>
      </section>

      {patients.length === 0 && (
        <div className={style.emptyState}>Nincsenek páciensek.</div>
      )}

      {patients.length > 0 && (
        <div className={style.grid}>
          {patients.map((patient) => (
            <Link
              href={`/dashboard/patients/${patient.id}`}
              key={patient.id}
              className={style.card}
            >
              <div className={style.cardHeader}>
                <strong>{patient.name}</strong>
                <span>{patient.teeth.length} fog</span>
              </div>
              <div className={style.cardMeta}>
                <span>{patient.phone || "Nincs telefon"}</span>
                <span>{patient.email || "Nincs email"}</span>
              </div>
              <div className={style.cardFooter}>
                <span>{formatDate(patient.birthDate)}</span>
                <span className={style.cardAction}>Karton megnyitása</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
