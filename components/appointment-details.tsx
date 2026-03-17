import Link from "next/link";

import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

import style from "@/styles/components/appointment-details.module.scss";

export type AppointmentDetailRecord = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: Date;
  } | null;
  user: { name: string | null } | null;
  toothOperations: Array<{
    toothCode: string;
    operation: {
      id: string;
      name: string;
      clinicPrices: Array<{ price: number }>;
    };
  }>;
};

const formatDuration = (start: Date, end: Date) => {
  const durationInMinutes = Math.max(
    Math.round((end.getTime() - start.getTime()) / 60000),
    0,
  );

  if (durationInMinutes < 60) {
    return `${durationInMinutes} perc`;
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  return minutes > 0 ? `${hours} óra ${minutes} perc` : `${hours} óra`;
};

export default function AppointmentDetails({
  appointment,
}: {
  appointment?: AppointmentDetailRecord | null;
}) {
  if (!appointment) {
    return (
      <div className={style.emptyState}>
        <span className={style.eyebrow}>Időpont részletei</span>
        <h2>Válassz egy időpontot a naptárból</h2>
        <p>
          A mai napi nézet jelenik meg alapból. Ha rákattintasz egy eseményre,
          az időpont részletei itt nyílnak meg, a naptár mellett.
        </p>
      </div>
    );
  }

  const operations = [...appointment.toothOperations]
    .map((toothOperation) => ({
      id: `${toothOperation.toothCode}-${toothOperation.operation.id}`,
      toothCode: toothOperation.toothCode,
      name: toothOperation.operation.name,
      price: toothOperation.operation.clinicPrices[0]?.price ?? 0,
    }))
    .sort(
      (left, right) =>
        left.toothCode.localeCompare(right.toothCode) ||
        left.name.localeCompare(right.name),
    );

  const affectedTeeth = Array.from(
    new Set(operations.map((operation) => operation.toothCode)),
  );

  const total = operations.reduce(
    (sum, operation) => sum + operation.price,
    0,
  );

  return (
    <article className={style.wrapper}>
      <header className={style.header}>
        <div className={style.headerCopy}>
          <span className={style.eyebrow}>Kiválasztott időpont</span>
          <h2>{appointment.title}</h2>
          <p>
            {formatDate(appointment.start)} · {formatTime(appointment.start)} -{" "}
            {formatTime(appointment.end)}
          </p>
        </div>
        <div className={style.badges}>
          <span className={style.badge}>#{appointment.id}</span>
          <span className={style.badge}>
            {formatDuration(appointment.start, appointment.end)}
          </span>
        </div>
      </header>

      <div className={style.metaGrid}>
        <div className={style.metaCard}>
          <span>Páciens</span>
          <strong>{appointment.patient?.name ?? "Nincs páciens"}</strong>
          {appointment.patient && (
            <Link
              className={style.metaLink}
              href={`/dashboard/patients/${appointment.patient.id}`}
            >
              Páciens karton megnyitása
            </Link>
          )}
        </div>
        <div className={style.metaCard}>
          <span>Telefon</span>
          <strong>{appointment.patient?.phone || "Nincs megadva"}</strong>
        </div>
        <div className={style.metaCard}>
          <span>Email</span>
          <strong>{appointment.patient?.email || "Nincs megadva"}</strong>
        </div>
        <div className={style.metaCard}>
          <span>Ellátó</span>
          <strong>{appointment.user?.name || "Nincs megadva"}</strong>
        </div>
      </div>

      <section className={style.section}>
        <div className={style.sectionHeader}>
          <h3>Érintett fogak</h3>
          <span>{affectedTeeth.length} fog</span>
        </div>
        {affectedTeeth.length > 0 ? (
          <div className={style.teethList}>
            {affectedTeeth.map((toothCode) => (
              <span key={toothCode} className={style.toothChip}>
                {toothCode}
              </span>
            ))}
          </div>
        ) : (
          <div className={style.emptyNotice}>
            Ehhez az időponthoz még nincs rögzített fog vagy kezelés.
          </div>
        )}
      </section>

      <section className={style.section}>
        <div className={style.sectionHeader}>
          <h3>Kezelési tételek</h3>
          <strong>{formatCurrency(total)}</strong>
        </div>

        {operations.length > 0 ? (
          <div className={style.operationsList}>
            {operations.map((operation) => (
              <div key={operation.id} className={style.operationRow}>
                <div className={style.operationMeta}>
                  <span className={style.operationName}>{operation.name}</span>
                  <span className={style.operationTooth}>
                    Fog {operation.toothCode}
                  </span>
                </div>
                <span className={style.operationPrice}>
                  {formatCurrency(operation.price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={style.emptyNotice}>
            A kiválasztott időponthoz még nincs részletezett kezelés.
          </div>
        )}
      </section>
    </article>
  );
}
