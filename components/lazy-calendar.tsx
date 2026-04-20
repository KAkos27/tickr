"use client";

import dynamic from "next/dynamic";
import type { CalendarProps } from "@/components/calendar";
import style from "@/styles/components/calendar.module.scss";

const Calendar = dynamic(() => import("@/components/calendar"), {
  ssr: false,
  loading: () => (
    <div className={style.skeleton}>
      <span>Naptár betöltése...</span>
    </div>
  ),
});

export default function LazyCalendar(props: CalendarProps) {
  return <Calendar {...props} />;
}
