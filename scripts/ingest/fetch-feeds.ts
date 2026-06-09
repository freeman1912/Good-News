import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import { getAllNews } from "../../src/lib/news";
import { getSources } from "../../src/lib/sources";
import type { CandidateItem, NewsSource } from "../../src/lib/types";
import { dedupeCandidates } from "./dedupe";
import { normalizeFeedEntry, type RawFeedEntry, stripHtml } from "./normalize";

interface FetchError {
  sourceId: string;
  sourceName: string;
  rssUrl: string;
  error: string;
  fetchedAt: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "#text",
  parseTagValue: false,
  trimValues: true,
});
const fetchTimeoutMs = Number(process.env.FEED_FETCH_TIMEOUT_MS ?? 15000);

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickText(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return pickText(value[0]);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return pickText(record["#text"] ?? record.cdata ?? record._);
  }
  return String(value);
}

function pickLink(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const alternate = value.find((entry) => {
      return typeof entry === "object" && entry && (entry as Record<string, unknown>).rel === "alternate";
    });
    return pickLink(alternate ?? value[0]);
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return pickText(record.href ?? record.url ?? record["#text"]);
  }
  return undefined;
}

function parsePublishedAt(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const cause = error.cause instanceof Error ? `: ${error.cause.message}` : "";
  return `${error.message}${cause}`;
}

function readEntries(parsed: unknown): RawFeedEntry[] {
  const root = parsed as Record<string, unknown>;
  const rssChannel = (root.rss as Record<string, unknown> | undefined)?.channel as
    | Record<string, unknown>
    | undefined;
  const rssItems = asArray(rssChannel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const atomEntries = asArray((root.feed as Record<string, unknown> | undefined)?.entry as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | undefined);

  return [...rssItems, ...atomEntries].map((entry) => ({
    title: pickText(entry.title),
    url: pickLink(entry.link ?? entry.guid),
    publishedAt: parsePublishedAt(
      pickText(entry.pubDate ?? entry.published ?? entry.updated ?? entry["dc:date"]),
    ),
    summary: stripHtml(
      pickText(entry.description ?? entry.summary ?? entry["content:encoded"] ?? entry.content) ?? "",
    ),
  }));
}

async function fetchFeed(source: NewsSource, fetchedAt: string): Promise<CandidateItem[]> {
  if (!source.rssUrl) return [];

  const response = await fetch(source.rssUrl, {
    signal: AbortSignal.timeout(fetchTimeoutMs),
    headers: {
      "User-Agent": "GoodNewsBot/0.1 (+https://github.com/your-name/good-news)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const feedText = await response.text();
  const parsed = parser.parse(feedText);

  return readEntries(parsed)
    .map((entry) => normalizeFeedEntry(source, entry, fetchedAt))
    .filter((candidate): candidate is CandidateItem => Boolean(candidate));
}

async function main(): Promise<void> {
  const dateKey = todayKey();
  const fetchedAt = new Date().toISOString();
  const sources = (await getSources()).filter((source) => source.rssUrl);
  const existingNews = await getAllNews();
  const candidates: CandidateItem[] = [];
  const errors: FetchError[] = [];

  for (const source of sources) {
    try {
      const entries = await fetchFeed(source, fetchedAt);
      candidates.push(...entries);
      console.log(`[fetch] ${source.id}: ${entries.length} candidates`);
    } catch (error) {
      errors.push({
        sourceId: source.id,
        sourceName: source.name,
        rssUrl: source.rssUrl ?? "",
        error: formatError(error),
        fetchedAt,
      });
      console.warn(`[fetch] ${source.id}: failed`);
    }
  }

  const deduped = dedupeCandidates(candidates, existingNews);
  const candidatesDir = resolve(process.cwd(), "data/candidates");
  const rejectedDir = resolve(process.cwd(), "data/rejected");

  await mkdir(candidatesDir, { recursive: true });
  await mkdir(rejectedDir, { recursive: true });
  await writeFile(
    resolve(candidatesDir, `${dateKey}.fetched.json`),
    `${JSON.stringify(deduped.items, null, 2)}\n`,
    "utf-8",
  );

  if (errors.length > 0) {
    await writeFile(
      resolve(rejectedDir, `${dateKey}.fetch-errors.json`),
      `${JSON.stringify(errors, null, 2)}\n`,
      "utf-8",
    );
  }

  console.log(
    `[fetch] wrote ${deduped.items.length} unique candidates; dropped ${deduped.dropped.length}; errors ${errors.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
