import AppointmentsContent from "@/components/appointments-content";
import {
  DEFAULT_APPOINTMENTS_ORIENTATION,
  DEFAULT_APPOINTMENTS_VIEW,
  DEFAULT_APPOINTMENTS_FILTER,
  parseCalendarOrientation,
  parseCalendarView,
  parseCalendarFilter,
} from "@/lib/appointments";
import { getAppointments, getCurrentUserId } from "@/lib/querys";

type AppointmentSearchParams = {
  view?: string;
  orientation?: string;
  filter?: string;
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<AppointmentSearchParams>;
}) {
  const [appointments, currentUserId, resolvedSearchParams] = await Promise.all(
    [getAppointments(), getCurrentUserId(), searchParams],
  );

  const view = parseCalendarView(
    resolvedSearchParams.view,
    DEFAULT_APPOINTMENTS_VIEW,
  );
  const orientation = parseCalendarOrientation(
    resolvedSearchParams.orientation,
    DEFAULT_APPOINTMENTS_ORIENTATION,
  );
  const filter = parseCalendarFilter(
    resolvedSearchParams.filter,
    DEFAULT_APPOINTMENTS_FILTER,
  );

  return (
    <AppointmentsContent
      appointments={appointments}
      view={view}
      orientation={orientation}
      filter={filter}
      currentUserId={currentUserId}
    />
  );
}
