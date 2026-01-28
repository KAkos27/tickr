export const toDateTimeLocalValue = (date: Date) => {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseDateTimeLocalValue = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const dt = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    0,
    0,
  );
  return Number.isNaN(dt.getTime()) ? null : dt;
};
