import type { NewsDateGroup, PublishedNewsItem } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }
  return date.toISOString().slice(0, 10);
}

export function isWithinLatest24Hours(
  value: string,
  now: Date = new Date(),
): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= MS_PER_DAY;
}

export function formatDateLabel(dateKey: string, now: Date = new Date()): string {
  const todayKey = toDateKey(now);
  const yesterdayKey = toDateKey(new Date(now.getTime() - MS_PER_DAY));

  if (dateKey === todayKey) return "今日";
  if (dateKey === yesterdayKey) return "昨日";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}

export function sortByCollectedAtDesc(
  items: PublishedNewsItem[],
): PublishedNewsItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  );
}

export function groupNewsByDate(
  items: PublishedNewsItem[],
  now: Date = new Date(),
): NewsDateGroup[] {
  const grouped = new Map<string, PublishedNewsItem[]>();

  for (const item of sortByCollectedAtDesc(items)) {
    const key = toDateKey(item.collectedAt);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groupItems]) => ({
      date,
      label: formatDateLabel(date, now),
      items: groupItems,
    }));
}

export function splitLatest24Hours(
  items: PublishedNewsItem[],
  now: Date = new Date(),
): {
  latest: PublishedNewsItem[];
  older: PublishedNewsItem[];
} {
  const latest: PublishedNewsItem[] = [];
  const older: PublishedNewsItem[] = [];

  for (const item of items) {
    if (isWithinLatest24Hours(item.collectedAt, now)) {
      latest.push(item);
    } else {
      older.push(item);
    }
  }

  return {
    latest: sortByCollectedAtDesc(latest),
    older: sortByCollectedAtDesc(older),
  };
}
