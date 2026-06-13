import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getWeekRange } from "./weeks";
import type {
  Region,
  TopicSlug,
  WeeklyGoodNewsItem,
  WeeklyIssue,
  WeeklyMediaType,
  WeeklyWatchItem,
} from "./types";

const weeklyDir = resolve(process.cwd(), "data/weekly");
const WEEKLY_FILE_PATTERN = /^\d{4}-W\d{2}\.json$/;
const regions = new Set<Region>(["china", "world"]);
const topics = new Set<TopicSlug>([
  "science-health",
  "environment-animals",
  "charity-mutual-aid",
  "public-improvement",
  "people-kindness",
  "education-culture",
  "other",
]);
const mediaTypes = new Set<WeeklyMediaType>(["article", "video", "report", "other"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string, context: string): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${context}.${key} must be a non-empty string.`);
  }

  return value;
}

function optionalString(record: Record<string, unknown>, key: string, context: string): string | undefined {
  const value = record[key];

  if (value === undefined) return undefined;

  if (typeof value !== "string") {
    throw new Error(`${context}.${key} must be a string when provided.`);
  }

  return value;
}

function requireNumber(record: Record<string, unknown>, key: string, context: string): number {
  const value = record[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${context}.${key} must be a number.`);
  }

  return value;
}

function requireLiteral<T extends string>(
  record: Record<string, unknown>,
  key: string,
  allowed: Set<T>,
  context: string,
): T {
  const value = requireString(record, key, context);

  if (!allowed.has(value as T)) {
    throw new Error(`${context}.${key} has invalid value: ${value}.`);
  }

  return value as T;
}

function validateIsoDate(value: string, context: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime())) {
    throw new Error(`${context} must be a YYYY-MM-DD date.`);
  }
}

function validateIsoDateTime(value: string, context: string): void {
  if (Number.isNaN(new Date(value).getTime())) {
    throw new Error(`${context} must be a valid date/time string.`);
  }
}

function validateWeeklyItem(value: unknown, context: string): WeeklyGoodNewsItem {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }

  const item: WeeklyGoodNewsItem = {
    id: requireString(value, "id", context),
    title: requireString(value, "title", context),
    summary: requireString(value, "summary", context),
    region: requireLiteral(value, "region", regions, context),
    topic: requireLiteral(value, "topic", topics, context),
    sourceName: requireString(value, "sourceName", context),
    sourceUrl: requireString(value, "sourceUrl", context),
    originalUrl: requireString(value, "originalUrl", context),
    publishedAt: optionalString(value, "publishedAt", context),
    collectedAt: requireString(value, "collectedAt", context),
    whyGood: requireString(value, "whyGood", context),
    verificationNote: requireString(value, "verificationNote", context),
    sourceCount: requireNumber(value, "sourceCount", context),
    status: requireLiteral(value, "status", new Set(["published"]), context),
    isExample: value.isExample === true ? true : undefined,
    weeklyNote: optionalString(value, "weeklyNote", context),
    mediaType: value.mediaType === undefined ? undefined : requireLiteral(value, "mediaType", mediaTypes, context),
  };

  if (item.publishedAt) validateIsoDateTime(item.publishedAt, `${context}.publishedAt`);
  validateIsoDateTime(item.collectedAt, `${context}.collectedAt`);

  return item;
}

function validateWatchItem(value: unknown, context: string): WeeklyWatchItem {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }

  return {
    id: requireString(value, "id", context),
    title: requireString(value, "title", context),
    reason: requireString(value, "reason", context),
    sourceName: optionalString(value, "sourceName", context),
    sourceUrl: optionalString(value, "sourceUrl", context),
    followUpQuestion: requireString(value, "followUpQuestion", context),
  };
}

function validateWeeklyIssue(value: unknown, context: string): WeeklyIssue {
  if (!isRecord(value)) {
    throw new Error(`${context} must be an object.`);
  }

  const id = requireString(value, "id", context);
  const weekStart = requireString(value, "weekStart", context);
  const weekEnd = requireString(value, "weekEnd", context);
  const range = getWeekRange(id);

  validateIsoDate(weekStart, `${context}.weekStart`);
  validateIsoDate(weekEnd, `${context}.weekEnd`);

  if (weekStart !== range.start || weekEnd !== range.end) {
    throw new Error(`${context} date range must match ${id}: ${range.start} to ${range.end}.`);
  }

  const rawItems = value.items;

  if (!Array.isArray(rawItems)) {
    throw new Error(`${context}.items must be an array.`);
  }

  const rawWatchlist = value.watchlist;

  if (rawWatchlist !== undefined && !Array.isArray(rawWatchlist)) {
    throw new Error(`${context}.watchlist must be an array when provided.`);
  }

  const issue: WeeklyIssue = {
    id,
    weekStart,
    weekEnd,
    title: requireString(value, "title", context),
    intro: requireString(value, "intro", context),
    items: rawItems.map((item, index) => validateWeeklyItem(item, `${context}.items[${index}]`)),
    watchlist: rawWatchlist?.map((item, index) => validateWatchItem(item, `${context}.watchlist[${index}]`)),
    publishedAt: optionalString(value, "publishedAt", context),
  };

  if (issue.publishedAt) validateIsoDateTime(issue.publishedAt, `${context}.publishedAt`);

  return issue;
}

async function readWeeklyFile(fileName: string): Promise<WeeklyIssue> {
  const filePath = resolve(weeklyDir, fileName);
  const fileText = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(fileText);
  return validateWeeklyIssue(parsed, fileName);
}

export async function getAllWeeklyIssues(): Promise<WeeklyIssue[]> {
  let files: string[] = [];

  try {
    files = await readdir(weeklyDir);
  } catch {
    return [];
  }

  const weeklyFiles = files.filter((file) => WEEKLY_FILE_PATTERN.test(file));
  const issues = await Promise.all(weeklyFiles.map(readWeeklyFile));

  return issues.sort((a, b) => b.weekStart.localeCompare(a.weekStart) || b.id.localeCompare(a.id));
}

export async function getLatestWeeklyIssue(): Promise<WeeklyIssue | null> {
  const issues = await getAllWeeklyIssues();
  return issues[0] ?? null;
}

export async function getWeeklyStoriesByTopic(topic: TopicSlug): Promise<WeeklyGoodNewsItem[]> {
  const issues = await getAllWeeklyIssues();
  return issues.flatMap((issue) => issue.items.filter((item) => item.topic === topic));
}
