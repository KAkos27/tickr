"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { CalendarEvent } from "@/types/domain";

export default function Calendar({ events }: { events: CalendarEvent[] }) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      height="auto"
      events={events}
    />
  );
}
