import {
  DEFAULT_APPOINTMENTS_VIEW,
  DEFAULT_APPOINTMENTS_FILTER,
  DEFAULT_SELECTED_APPOINTMENT_ORIENTATION,
  parseCalendarOrientation,
  parseCalendarView,
  parseCalendarFilter,
} from "@/lib/appointments";
import AppointmentsContent from "@/components/appointments-content";
import {
  getAppointmentDetails,
  getAppointments,
  getCurrentUserId,
} from "@/lib/querys";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

type AppointmentSearchParams = {
  view?: string;
  orientation?: string;
  filter?: string;
};

export default async function AppointmentPage({
  params,
  searchParams,
}: Params<{ id: string }> & {
  searchParams: Promise<AppointmentSearchParams>;
}) {
  const { id } = await params;
  const [appointments, appointment, currentUserId, resolvedSearchParams] =
    await Promise.all([
      getAppointments(),
      getAppointmentDetails(id),
      getCurrentUserId(),
      searchParams,
    ]);

  if (!appointment) {
    notFound();
  }

  const view = parseCalendarView(
    resolvedSearchParams.view,
    DEFAULT_APPOINTMENTS_VIEW,
  );
  const orientation = parseCalendarOrientation(
    resolvedSearchParams.orientation,
    DEFAULT_SELECTED_APPOINTMENT_ORIENTATION,
  );
  const filter = parseCalendarFilter(
    resolvedSearchParams.filter,
    DEFAULT_APPOINTMENTS_FILTER,
  );

  return (
    <AppointmentsContent
      appointments={appointments}
      selectedAppointment={appointment}
      view={view}
      orientation={orientation}
      filter={filter}
      currentUserId={currentUserId}
      initialDate={appointment.start.toISOString()}
    />
  );
}
