import {
  DEFAULT_APPOINTMENTS_VIEW,
  DEFAULT_SELECTED_APPOINTMENT_ORIENTATION,
  parseCalendarOrientation,
  parseCalendarView,
} from "@/lib/appointments";
import AppointmentsContent from "@/components/appointments-content";
import {
  getAppointmentDetails,
  getAppointments,
} from "@/lib/querys";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

type AppointmentSearchParams = {
  view?: string;
  orientation?: string;
};

export default async function AppointmentPage({
  params,
  searchParams,
}: Params<{ id: string }> & {
  searchParams: Promise<AppointmentSearchParams>;
}) {
  const { id } = await params;
  const [appointments, appointment, resolvedSearchParams] = await Promise.all([
    getAppointments(),
    getAppointmentDetails(id),
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

  return (
    <AppointmentsContent
      appointments={appointments}
      selectedAppointment={appointment}
      view={view}
      orientation={orientation}
      initialDate={appointment.start.toISOString()}
    />
  );
}
