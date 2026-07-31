export const APP_TIMEZONE = 'Asia/Kolkata';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateOnlyString(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value);
}

export function parseDateOnly(value: string): { year: number; month: number; day: number } {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid date-only value: ${value}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function toDateOnlyString(parts: { year: number; month: number; day: number }): string {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

/** Calendar date for a timezone, formatted as YYYY-MM-DD. */
export function todayDateOnly(timeZone: string = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Build a UTC Date for PostgreSQL DATE columns without local timezone drift. */
export function dateOnlyToUtcDate(value: string): Date {
  const { year, month, day } = parseDateOnly(value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatInstantInTimeZone(
  isoInstant: string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string = APP_TIMEZONE
): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone, ...options }).format(new Date(isoInstant));
}

export function addDaysToDateOnly(value: string, days: number, timeZone: string = APP_TIMEZONE): string {
  const { year, month, day } = parseDateOnly(value);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(anchor);
}

export function buildDateOnlyOptions(
  count: number,
  startDateOnly?: string,
  timeZone: string = APP_TIMEZONE
): Array<{ key: string; weekday: string; day: string; month: string }> {
  const start = startDateOnly ?? todayDateOnly(timeZone);
  const items: Array<{ key: string; weekday: string; day: string; month: string }> = [];

  for (let index = 0; index < count; index += 1) {
    const key = index === 0 ? start : addDaysToDateOnly(start, index, timeZone);
    const { year, month, day } = parseDateOnly(key);
    const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    items.push({
      key,
      weekday: new Intl.DateTimeFormat('en-IN', { timeZone, weekday: 'short' }).format(anchor),
      day: String(day).padStart(2, '0'),
      month: new Intl.DateTimeFormat('en-IN', { timeZone, month: 'short' }).format(anchor),
    });
  }

  return items;
}
