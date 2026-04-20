import type { DateInput } from "@fullcalendar/core/index.js";

import AppointmentDetails, {
  type AppointmentDetailRecord,
} from "@/components/appointment-details";
import Calendar from "@/components/lazy-calendar";
import {
  getCalendarOrientationLabel,
  getCalendarViewLabel,
  getCalendarFilterLabel,
  type CalendarOrientation,
  type CalendarView,
  type CalendarFilter,
} from "@/lib/appointments";
import { formatDate, formatTime } from "@/lib/utils";

import style from "@/styles/pages/calendar-page.module.scss";

type AppointmentEventRecord = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId: string;
  user: { id: string; color: string } | null;
};

export default function AppointmentsContent({
  appointments,
  selectedAppointment,
  view,
  orientation,
  filter,
  currentUserId,
  initialDate,
}: {
  appointments: AppointmentEventRecord[];
  selectedAppointment?: AppointmentDetailRecord | null;
  view: CalendarView;
  orientation: CalendarOrientation;
  filter: CalendarFilter;
  currentUserId: string | null;
  initialDate?: DateInput;
}) {
  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    start: appointment.start.toISOString(),
    end: appointment.end.toISOString(),
    backgroundColor: appointment.user?.color ?? "#5d8da8",
    borderColor: appointment.user?.color ?? "#5d8da8",
    userId: appointment.userId,
  }));

  const hasSelectedAppointment = Boolean(selectedAppointment);
  const summaryTitle = hasSelectedAppointment
    ? "Időpont részletei"
    : "Időpont naptár";
  const summaryText = selectedAppointment
    ? `${formatDate(selectedAppointment.start)} · ${formatTime(
        selectedAppointment.start,
      )} - ${formatTime(selectedAppointment.end)}`
    : "A naptár napi nézetből indul. Kattints egy időpontra a részletes adatokhoz.";

  return (
    <div className={style.page}>
      <section className={style.summary}>
        <div className={style.summaryCopy}>
          <span className={style.summaryEyebrow}>Időpontok</span>
          <h1>{summaryTitle}</h1>
          <p>{summaryText}</p>
        </div>
        <div className={style.summaryBadges}>
          <span className={style.summaryBadge}>
            {appointments.length} időpont összesen
          </span>
          <span className={style.summaryBadge}>
            {getCalendarViewLabel(view)}
          </span>
          <span className={style.summaryBadge}>
            {getCalendarFilterLabel(filter)}
          </span>
          <span className={style.summaryBadge}>
            {getCalendarOrientationLabel(orientation)}
          </span>
        </div>
      </section>

      <div className={style.content} data-orientation={orientation}>
        <section className={`${style.panel} ${style.calendarPanel}`}>
          <div className={style.panelHeader}>
            <div>
              <h2>Naptár</h2>
              <p>
                {hasSelectedAppointment
                  ? "A kiválasztott időpont napjára fókuszálva."
                  : "Mai napi nézet, új időpontot kijelöléssel tudsz létrehozni."}
              </p>
            </div>
          </div>

          <Calendar
            key={`${view}-${initialDate ?? "today"}`}
            events={events}
            view={view}
            orientation={orientation}
            filter={filter}
            currentUserId={currentUserId}
            initialDate={initialDate}
            selectedEventId={selectedAppointment?.id}
          />
        </section>

        <section
          id="appointment-event"
          className={`${style.panel} ${style.detailsPanel}`}
        >
          <div className={style.panelHeader}>
            <div>
              <h2>Részletek</h2>
              <p>
                {hasSelectedAppointment
                  ? "A kiválasztott időpont páciens és kezelési adatai."
                  : "Válassz egy eseményt a naptárból a részletek megnyitásához."}
              </p>
            </div>
          </div>

          <AppointmentDetails appointment={selectedAppointment} />
        </section>
      </div>
    </div>
  );
}
