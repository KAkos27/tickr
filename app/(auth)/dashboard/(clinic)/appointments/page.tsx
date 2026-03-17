import AppointmentsContent from "@/components/appointments-content";
import {
  DEFAULT_APPOINTMENTS_ORIENTATION,
  DEFAULT_APPOINTMENTS_VIEW,
  parseCalendarOrientation,
  parseCalendarView,
} from "@/lib/appointments";
import { getAppointments } from "@/lib/querys";

type AppointmentSearchParams = {
  view?: string;
  orientation?: string;
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<AppointmentSearchParams>;
}) {
  const appointments = await getAppointments();
  const resolvedSearchParams = await searchParams;

  const view = parseCalendarView(
    resolvedSearchParams.view,
    DEFAULT_APPOINTMENTS_VIEW,
  );
  const orientation = parseCalendarOrientation(
    resolvedSearchParams.orientation,
    DEFAULT_APPOINTMENTS_ORIENTATION,
  );

  return (
    <AppointmentsContent
      appointments={appointments}
      view={view}
      orientation={orientation}
    />
  );
}
