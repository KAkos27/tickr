"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";

import { toDateTimeLocalValue } from "@/lib/utils";

import type { CalendarEvent } from "@/types/domain";

import style from "@/styles/components/calendar.module.scss";

export default function Calendar({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();

  const handleDateClick = (selected: DateSelectArg) => {
    const start = toDateTimeLocalValue(selected.start);
    const end = toDateTimeLocalValue(selected.end);

    router.push(`/dashboard/calendar/new/${start}/${end}`);
  };

  const handleEventClick = (arg: EventClickArg) => {
    router.push(`/dashboard/calendar/${arg.event.id}`);
  };

  return (
    <>
      <div className={style.container}>
        <FullCalendar
          height={720}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="timeGridWeek"
          scrollTime="09:00:00"
          expandRows
          editable={true}
          selectable={true}
          selectMirror={false}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          locales={allLocales}
          locale={"hu"}
        />
      </div>
    </>
  );
}
