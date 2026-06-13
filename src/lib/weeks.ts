const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_ID_PATTERN = /^(\d{4})-W(\d{2})$/;

function assertValidDate(date: Date, label: string): void {
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${label}.`);
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfIsoWeek(date: Date): Date {
  const utcDay = startOfUtcDay(date);
  const day = utcDay.getUTCDay() || 7;
  return new Date(utcDay.getTime() - (day - 1) * MS_PER_DAY);
}

export interface WeekRange {
  id: string;
  start: string;
  end: string;
}

export function toDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  assertValidDate(date, String(value));
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

export function getWeekId(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  assertValidDate(date, String(value));

  const weekStart = startOfIsoWeek(date);
  const weekThursday = new Date(weekStart.getTime() + 3 * MS_PER_DAY);
  const weekYear = weekThursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstWeekStart = startOfIsoWeek(firstThursday);
  const weekNumber = Math.floor((weekStart.getTime() - firstWeekStart.getTime()) / (7 * MS_PER_DAY)) + 1;

  return `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
}

export function parseWeekId(weekId: string): { year: number; week: number } {
  const match = WEEK_ID_PATTERN.exec(weekId);

  if (!match) {
    throw new Error(`Invalid week id: ${weekId}. Use YYYY-Www, for example 2026-W24.`);
  }

  const year = Number(match[1]);
  const week = Number(match[2]);

  if (week < 1 || week > 53) {
    throw new Error(`Invalid week number in ${weekId}.`);
  }

  return { year, week };
}

export function getWeekRange(weekId: string): WeekRange {
  const { year, week } = parseWeekId(weekId);
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstWeekStart = startOfIsoWeek(firstThursday);
  const startDate = new Date(firstWeekStart.getTime() + (week - 1) * 7 * MS_PER_DAY);

  if (getWeekId(startDate) !== weekId) {
    throw new Error(`Week id ${weekId} is outside the ISO week range for ${year}.`);
  }

  const endDate = new Date(startDate.getTime() + 6 * MS_PER_DAY);

  return {
    id: weekId,
    start: toDateKey(startDate),
    end: toDateKey(endDate),
  };
}

export function isDateInWeekRange(value: string | Date, range: WeekRange): boolean {
  const dateKey = toDateKey(value);
  return dateKey >= range.start && dateKey <= range.end;
}

export function filterItemsByWeek<T>(
  items: T[],
  weekId: string,
  getDate: (item: T) => string | Date | undefined,
): T[] {
  const range = getWeekRange(weekId);

  return items.filter((item) => {
    const date = getDate(item);
    return date ? isDateInWeekRange(date, range) : false;
  });
}
