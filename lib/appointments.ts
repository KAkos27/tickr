export const CALENDAR_VIEWS = [
  "dayGridMonth",
  "timeGridWeek",
  "timeGridDay",
] as const;

export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export const CALENDAR_ORIENTATIONS = ["row", "column"] as const;

export type CalendarOrientation = (typeof CALENDAR_ORIENTATIONS)[number];

export const CALENDAR_FILTERS = ["all", "mine"] as const;

export type CalendarFilter = (typeof CALENDAR_FILTERS)[number];

export const DEFAULT_APPOINTMENTS_VIEW: CalendarView = "timeGridDay";
export const DEFAULT_APPOINTMENTS_ORIENTATION: CalendarOrientation = "column";
export const DEFAULT_APPOINTMENTS_FILTER: CalendarFilter = "all";
export const DEFAULT_SELECTED_APPOINTMENT_ORIENTATION: CalendarOrientation =
  "row";

const isCalendarView = (value: string | null | undefined): value is CalendarView =>
  value !== undefined &&
  value !== null &&
  CALENDAR_VIEWS.includes(value as CalendarView);

const isCalendarOrientation = (
  value: string | null | undefined,
): value is CalendarOrientation =>
  value !== undefined &&
  value !== null &&
  CALENDAR_ORIENTATIONS.includes(value as CalendarOrientation);

const isCalendarFilter = (
  value: string | null | undefined,
): value is CalendarFilter =>
  value !== undefined &&
  value !== null &&
  CALENDAR_FILTERS.includes(value as CalendarFilter);

export const parseCalendarView = (
  value: string | null | undefined,
  fallback: CalendarView = DEFAULT_APPOINTMENTS_VIEW,
) => (isCalendarView(value) ? value : fallback);

export const parseCalendarOrientation = (
  value: string | null | undefined,
  fallback: CalendarOrientation = DEFAULT_APPOINTMENTS_ORIENTATION,
) => (isCalendarOrientation(value) ? value : fallback);

export const parseCalendarFilter = (
  value: string | null | undefined,
  fallback: CalendarFilter = DEFAULT_APPOINTMENTS_FILTER,
) => (isCalendarFilter(value) ? value : fallback);

export const getCalendarViewLabel = (view: CalendarView) => {
  switch (view) {
    case "dayGridMonth":
      return "Havi nézet";
    case "timeGridWeek":
      return "Heti nézet";
    case "timeGridDay":
    default:
      return "Napi nézet";
  }
};

export const getCalendarOrientationLabel = (
  orientation: CalendarOrientation,
) => (orientation === "row" ? "Egymás mellett" : "Egymás alatt");

export const getCalendarFilterLabel = (filter: CalendarFilter) =>
  filter === "mine" ? "Saját kezelések" : "Mindenki kezelései";
