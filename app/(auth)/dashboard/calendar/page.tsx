import { getAppointments } from "@/lib/querys";
import Calendar from "@/components/calendar";
import { auth } from "@/auth";

export default async function CalendarPage() {
  const session = await auth();
  const id = session?.user?.id;

  const appointments = await getAppointments(id);

  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.startTime.toISOString(),
    end: appointment.endTime.toISOString(),
  }));

  return <Calendar events={events} />;
}
