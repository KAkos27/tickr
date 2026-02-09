import style from "@/styles/layouts/appointments-layout.module.scss";

type AppointmentsLayoutProps = Readonly<{
  children: React.ReactNode;
  calendar: React.ReactNode;
  event: React.ReactNode;
}>;

export default function AppointmentsLayout({
  calendar,
  event,
}: AppointmentsLayoutProps) {
  return (
    <div className={style.container}>
      <section className={style.calendar}>{calendar}</section>
      <section>{event}</section>
    </div>
  );
}
