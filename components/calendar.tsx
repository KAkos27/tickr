"use client";

import { memo, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import huLocale from "@fullcalendar/core/locales/hu";
import {
  DateSelectArg,
  type DateInput,
  DatesSetArg,
  EventClickArg,
} from "@fullcalendar/core/index.js";

import {
  DEFAULT_APPOINTMENTS_VIEW,
  DEFAULT_SELECTED_APPOINTMENT_ORIENTATION,
  DEFAULT_APPOINTMENTS_FILTER,
  type CalendarOrientation,
  type CalendarView,
  type CalendarFilter,
  parseCalendarView,
} from "@/lib/appointments";
import { toDateTimeLocalValue } from "@/lib/utils";

import type { CalendarEvent } from "@/types/domain";

import style from "@/styles/components/calendar.module.scss";

const FC_PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin];
const FC_LOCALES = [huLocale];

export type CalendarProps = {
  events: CalendarEvent[];
  view: CalendarView;
  orientation: CalendarOrientation;
  filter: CalendarFilter;
  currentUserId: string | null;
  initialDate?: DateInput;
  selectedEventId?: string;
};

function Calendar({
  events,
  view,
  orientation,
  filter,
  currentUserId,
  initialDate,
  selectedEventId,
}: CalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filteredEvents = useMemo(
    () =>
      filter === "mine" && currentUserId
        ? events.filter((e) => e.userId === currentUserId)
        : events,
    [events, filter, currentUserId],
  );

  const buildSearch = useCallback(
    (
      nextView: CalendarView,
      nextOrientation: CalendarOrientation,
      nextFilter: CalendarFilter,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", nextView);
      params.set("orientation", nextOrientation);
      params.set("filter", nextFilter);
      return params.toString();
    },
    [searchParams],
  );

  const handleDateClick = useCallback(
    (selected: DateSelectArg) => {
      const start = toDateTimeLocalValue(selected.start);
      const end = toDateTimeLocalValue(selected.end);
      router.push(`/dashboard/appointments/new/${start}/${end}`);
    },
    [router],
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const params = new URLSearchParams();
      params.set("view", DEFAULT_APPOINTMENTS_VIEW);
      params.set("orientation", DEFAULT_SELECTED_APPOINTMENT_ORIENTATION);
      params.set("filter", filter);
      router.push(
        `/dashboard/appointments/${arg.event.id}?${params.toString()}#appointment-event`,
      );
    },
    [router, filter],
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const nextView = parseCalendarView(arg.view.type, view);
      if (nextView === view) return;
      router.replace(
        `${pathname}?${buildSearch(nextView, orientation, filter)}`,
        { scroll: false },
      );
    },
    [router, pathname, buildSearch, view, orientation, filter],
  );

  const handleOrientationChange = useCallback(
    (nextOrientation: CalendarOrientation) => {
      if (nextOrientation === orientation) return;
      router.replace(
        `${pathname}?${buildSearch(view, nextOrientation, filter)}`,
        { scroll: false },
      );
    },
    [router, pathname, buildSearch, view, orientation, filter],
  );

  const handleFilterChange = useCallback(
    (nextFilter: CalendarFilter) => {
      if (nextFilter === filter) return;
      router.replace(
        `${pathname}?${buildSearch(view, orientation, nextFilter)}`,
        { scroll: false },
      );
    },
    [router, pathname, buildSearch, view, orientation, filter],
  );

  const eventClassNames = useCallback(
    (arg: { event: { id: string } }) =>
      arg.event.id === selectedEventId ? [style.selectedEvent] : [],
    [selectedEventId],
  );

  const headerToolbar = useMemo(
    () => ({
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    }),
    [],
  );

  return (
    <div className={style.container}>
      <div className={style.controls}>
        <div className={style.controlGroup}>
          <span className={style.controlsLabel}>Szűrés</span>
          <div className={style.toggleGroup}>
            <button
              type="button"
              className={`${style.toggleButton} ${
                filter === "all" ? style.toggleButtonActive : ""
              }`}
              aria-pressed={filter === "all"}
              onClick={() => handleFilterChange("all")}
            >
              Mindenki
            </button>
            <button
              type="button"
              className={`${style.toggleButton} ${
                filter === "mine" ? style.toggleButtonActive : ""
              }`}
              aria-pressed={filter === "mine"}
              onClick={() => handleFilterChange("mine")}
            >
              Saját
            </button>
          </div>
        </div>

        <div className={style.controlGroup}>
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
      </div>

      <div className={style.calendarFrame}>
        <FullCalendar
          height={720}
          plugins={FC_PLUGINS}
          headerToolbar={headerToolbar}
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
          eventClassNames={eventClassNames}
          events={filteredEvents}
          locales={FC_LOCALES}
          locale="hu"
        />
      </div>
    </div>
  );
}

export default memo(Calendar);
