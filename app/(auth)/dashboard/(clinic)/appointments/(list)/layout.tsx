import style from "@/styles/layouts/appointments-layout.module.scss";

type AppointmentsLayoutProps = Readonly<{
  calendar: React.ReactNode;
  event: React.ReactNode;
}>;

export default async function AppointmentsLayout({
  calendar,
  event,
}: AppointmentsLayoutProps) {
  return (
    <div className={style.container}>
      <section className={style.calendar}>{calendar}</section>
      <section id="appointment-event" className={style.event}>
        {event}
      </section>
    </div>
  );
}
