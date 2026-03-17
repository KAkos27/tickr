"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import {
  DateSelectArg,
  type DateInput,
  DatesSetArg,
  EventClickArg,
} from "@fullcalendar/core/index.js";

import {
  DEFAULT_APPOINTMENTS_VIEW,
  DEFAULT_SELECTED_APPOINTMENT_ORIENTATION,
  type CalendarOrientation,
  type CalendarView,
  parseCalendarView,
} from "@/lib/appointments";
import { toDateTimeLocalValue } from "@/lib/utils";

import type { CalendarEvent } from "@/types/domain";

import style from "@/styles/components/calendar.module.scss";

export type CalendarProps = {
  events: CalendarEvent[];
  view: CalendarView;
  orientation: CalendarOrientation;
  initialDate?: DateInput;
  selectedEventId?: string;
};

function Calendar({
  events,
  view,
  orientation,
  initialDate,
  selectedEventId,
}: CalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildSearch = (
    nextView: CalendarView,
    nextOrientation: CalendarOrientation,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    params.set("orientation", nextOrientation);
    return params.toString();
  };

  const handleDateClick = (selected: DateSelectArg) => {
    const start = toDateTimeLocalValue(selected.start);
    const end = toDateTimeLocalValue(selected.end);

    router.push(`/dashboard/appointments/new/${start}/${end}`);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const params = new URLSearchParams();
    params.set("view", DEFAULT_APPOINTMENTS_VIEW);
    params.set("orientation", DEFAULT_SELECTED_APPOINTMENT_ORIENTATION);

    router.push(
      `/dashboard/appointments/${arg.event.id}?${params.toString()}#appointment-event`,
    );
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const nextView = parseCalendarView(arg.view.type, view);

    if (nextView === view) {
      return;
    }

    router.replace(`${pathname}?${buildSearch(nextView, orientation)}`, {
      scroll: false,
    });
  };

  const handleOrientationChange = (nextOrientation: CalendarOrientation) => {
    if (nextOrientation === orientation) {
      return;
    }

    router.replace(`${pathname}?${buildSearch(view, nextOrientation)}`, {
      scroll: false,
    });
  };

  return (
    <div className={style.container}>
      <div className={style.controls}>
        <span className={style.controlsLabel}>Részletek elrendezése</span>
        <div className={style.toggleGroup}>
          <button
            type="button"
            className={`${style.toggleButton} ${
              orientation === "row" ? style.toggleButtonActive : ""
            }`}
            aria-pressed={orientation === "row"}
            onClick={() => handleOrientationChange("row")}
          >
            Egymás mellett
          </button>
          <button
            type="button"
            className={`${style.toggleButton} ${
              orientation === "column" ? style.toggleButtonActive : ""
            }`}
            aria-pressed={orientation === "column"}
            onClick={() => handleOrientationChange("column")}
          >
            Egymás alatt
          </button>
        </div>
      </div>

      <div className={style.calendarFrame}>
        <FullCalendar
          height={720}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView={view}
          initialDate={initialDate}
          scrollTime="09:00:00"
          allDaySlot={false}
          expandRows
          editable={false}
          selectable={true}
          selectMirror={false}
          dayMaxEvents={true}
          select={handleDateClick}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          eventClassNames={(arg) =>
            arg.event.id === selectedEventId ? [style.selectedEvent] : []
          }
          events={events}
          locales={allLocales}
          locale={"hu"}
        />
      </div>
    </div>
  );
}

export default Calendar;
