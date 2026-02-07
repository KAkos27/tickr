import Calendar from "@/components/calendar";
import { getAppointments } from "@/lib/querys";

import style from "@/styles/auth/dashboard/calendar/page.module.scss";

export default async function CalendarPage() {
  const appointments = await getAppointments();

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.start.toISOString(),
    end: appointment.end.toISOString(),
  }));

  return (
    <div className={style.container}>
      <Calendar events={events} />
    </div>
  );
}
