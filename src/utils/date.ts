export const dateText = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN").format(
        new Date(`${value.slice(0, 10)}T12:00:00`),
      )
    : "—"

export function calendarDays(start: string, end: string) {
  const [sy, sm, sd] = start.split("-").map(Number)
  const [ey, em, ed] = end.split("-").map(Number)
  return Math.max(
    1,
    Math.round(
      (Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000,
    ) + 1,
  )
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function isDateRangeValid(start: string, end: string): boolean {
  return isCalendarDate(start) && isCalendarDate(end) && end >= start
}

export function todayDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function nextCalendarDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}
