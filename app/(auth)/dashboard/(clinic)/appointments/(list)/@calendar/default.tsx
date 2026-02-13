import Calendar from "@/components/calendar";
import { getAppointments } from "@/lib/querys";

import style from "@/styles/pages/calendar-page.module.scss";

export default async function CalendarPage({ searchParams }) {
  const appointments = await getAppointments();
  const view = (await searchParams).view || "timeGridWeek";
  const orientation = (await searchParams).orientation;

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.start.toISOString(),
    end: appointment.end.toISOString(),
  }));

  return (
    <div className={style.container}>
      <Calendar
        key={view}
        events={events}
        view={view}
        orientation={orientation}
      />
    </div>
  );
}
