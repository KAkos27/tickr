import { notFound } from "next/navigation";
import {
  getOperations,
  getPatientAppointmentHistory,
  getPatientWithTeeth,
} from "@/lib/querys";

import type { Params } from "@/types/route";
import Teeth from "@/components/teeth";
import style from "@/styles/pages/patient-detail.module.scss";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export default async function PatientPage({ params }: Params<{ id: string }>) {
  const { id } = await params;

  const patient = await getPatientWithTeeth(id);
  const operations = await getOperations();
  const history = await getPatientAppointmentHistory(id);

  if (!patient) {
    notFound();
  }
  const groupedHistory = history.reduce((acc, appointment) => {
    const dayKey = appointment.start.toISOString().slice(0, 10);
    const entry = acc.get(dayKey) ?? {
      date: appointment.start,
      items: [] as typeof history,
    };
    entry.items.push(appointment);
    acc.set(dayKey, entry);
    return acc;
  }, new Map<string, { date: Date; items: typeof history }>());

  const dayGroups = Array.from(groupedHistory.values());

  return (
    <div className={style.page}>
      <section className={style.summary}>
        <div className={style.summaryMain}>
          <h1>{patient.name}</h1>
          <span className={style.summarySubtitle}>Páciens karton</span>
        </div>
        <div className={style.summaryInfo}>
          <div>
            <span>Email</span>
            <strong>{patient.email}</strong>
          </div>
          <div>
            <span>Telefon</span>
            <strong>{patient.phone}</strong>
          </div>
          <div>
            <span>Szuletesi datum</span>
            <strong>{formatDate(patient.birthDate)}</strong>
          </div>
        </div>
      </section>

      <div className={style.content}>
        <section className={style.panel}>
          <div className={style.panelHeader}>
            <h2>Fogak</h2>
            <span>Valassz kezeleshez</span>
          </div>
          <Teeth selectedPatient={patient} operations={operations} />
        </section>
        <section className={`${style.panel} ${style.historyPanel}`}>
          <div className={style.panelHeader}>
            <h2>Kezelési történet</h2>
            <span>{history.length} bejegyzés</span>
          </div>

          {dayGroups.length === 0 && (
            <div className={style.emptyState}>
              Meg nincs rogzitett kezeles a pacienshez.
            </div>
          )}

          {dayGroups.map((group, groupIndex) => (
            <div
              key={group.date.toISOString()}
              className={style.dayGroup}
              style={{ animationDelay: `${groupIndex * 80}ms` }}
            >
              <div className={style.dayHeader}>
                <span className={style.dayDot} />
                {formatDate(group.date)}
                <span>{group.items.length} kezelés</span>
              </div>
              <div className={style.dayCards}>
                {group.items.map((appointment, appointmentIndex) => {
                  const doctorName = appointment.user?.name ?? "Ismeretlen";
                  const operationsList = [...appointment.toothOperations]
                    .map((operation) => {
                      const price =
                        operation.operation.clinicPrices[0]?.price ?? 0;
                      return {
                        toothCode: operation.toothCode,
                        name: operation.operation.name,
                        unit: 1,
                        price,
                        total: price,
                      };
                    })
                    .sort((a, b) => a.toothCode.localeCompare(b.toothCode));

                  const total = operationsList.reduce(
                    (sum, operation) => sum + operation.total,
                    0,
                  );

                  return (
                    <article
                      key={appointment.id}
                      className={style.appointmentCard}
                      style={{
                        animationDelay: `${
                          groupIndex * 120 + appointmentIndex * 80
                        }ms`,
                      }}
                    >
                      <div className={style.cardHeader}>
                        <div className={style.cardTitle}>
                          <span className={style.cardTime}>
                            {formatTime(appointment.start)}
                          </span>
                        </div>
                        <Link
                          href={`/dashboard/appointments/${appointment.id}?view=timeGridDay&orientation=row`}
                        >
                          #{appointment.id}
                        </Link>
                      </div>

                      <table className={style.cardTable}>
                        <thead>
                          <tr>
                            <th>Kezelés</th>
                            <th>Fog</th>
                            <th className={style.cellUnit}>Egység</th>
                            <th className={style.cellPrice}>Egység ár</th>
                            <th className={style.cellTotal}>Összesen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operationsList.length === 0 && (
                            <tr>
                              <td colSpan={5}>Nincs részletezett kezelés.</td>
                            </tr>
                          )}
                          {operationsList.map((operation) => (
                            <tr
                              key={`${appointment.id}-${operation.toothCode}-${operation.name}`}
                            >
                              <td>{operation.name}</td>
                              <td className={style.cellTeeth}>
                                {operation.toothCode}
                              </td>
                              <td className={style.cellUnit}>
                                {operation.unit}
                              </td>
                              <td className={style.cellPrice}>
                                {formatCurrency(operation.price)}
                              </td>
                              <td className={style.cellTotal}>
                                {formatCurrency(operation.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className={style.cardFooter}>
                        <span>Ellátó: {doctorName}</span>
                        <span className={style.cardTotal}>
                          Összesen {formatCurrency(total)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
