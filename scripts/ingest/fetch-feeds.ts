import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import { getAllNews } from "../../src/lib/news";
import { getSources } from "../../src/lib/sources";
import type { CandidateItem, NewsSource } from "../../src/lib/types";
import { dedupeCandidates } from "./dedupe";
import { normalizeFeedEntry, normalizeUrl, type RawFeedEntry, stripHtml } from "./normalize";

interface FetchError {
  sourceId: string;
  sourceName: string;
  url: string;
  rssUrl?: string;
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

function pickMeta(html: string, name: string): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*(?:name|property)=["']${escapedName}["'])(?=[^>]*content=["']([^"']+)["'])[^>]*>`,
    "i",
  );
  const value = decodeHtmlEntities(pattern.exec(html)?.[1] ?? "").trim();
  return value || undefined;
}

function pickTitle(html: string): string | undefined {
  const value = stripHtml(decodeHtmlEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""));
  return value || undefined;
}

function decodeHtmlEntities(value = ""): string {
  const named: Record<string, string> = {
    amp: "&",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
    apos: "'",
    mdash: "—",
    ndash: "–",
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    const lower = code.toLowerCase();
    if (lower in named) return named[lower];
    if (lower.startsWith("#x")) return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith("#")) return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return entity;
  });
}

function parsePublishedAt(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function parseChineseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value
    .replace(/[年月]/g, "-")
    .replace(/[日号]/g, "")
    .replace(/\./g, "-")
    .trim();
  const match = normalized.match(/(20\d{2})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/);

  if (!match) return parsePublishedAt(value);

  const [, year, month, day, hour = "00", minute = "00"] = match;
  return parsePublishedAt(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00+08:00`,
  );
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

function patternMatches(value: string, patterns: string[] | undefined): boolean {
  if (!patterns || patterns.length === 0) return true;
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function titleKeywordMatches(title: string, keywords: string[] | undefined): boolean {
  if (!keywords || keywords.length === 0) return true;
  return keywords.some((keyword) => title.includes(keyword));
}

function sameSite(url: string, sourceUrl: string): boolean {
  const sourceHost = new URL(sourceUrl).hostname.replace(/^www\./, "");
  const urlHost = new URL(url).hostname.replace(/^www\./, "");
  return urlHost === sourceHost || urlHost.endsWith(`.${sourceHost}`);
}

function cleanArticleTitle(title: string, source: NewsSource): string {
  return stripHtml(decodeHtmlEntities(title))
    .replace(new RegExp(`[-_｜|—].{0,8}${source.name}$`), "")
    .replace(/[-_｜|—]\s*(新闻|资讯|首页|官方网站).*$/u, "")
    .trim();
}

function extractArticleText(html: string): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  const paragraphs = [...cleaned.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(decodeHtmlEntities(match[1] ?? "")))
    .filter((text) => /[\u4e00-\u9fff]/.test(text) && text.length >= 12);

  return paragraphs.join(" ").slice(0, 1800);
}

function extractPublishedAt(html: string): string | undefined {
  const metaDate =
    pickMeta(html, "article:published_time") ??
    pickMeta(html, "pubdate") ??
    pickMeta(html, "publishdate") ??
    pickMeta(html, "date") ??
    pickMeta(html, "weibo:article:create_at");

  if (metaDate) return parseChineseDate(metaDate);

  const timeTag = /<time\b[^>]*(?:datetime=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/time>/i.exec(html);
  const timeValue = timeTag?.[1] ?? stripHtml(timeTag?.[2] ?? "");
  const bodyDate = /20\d{2}[年.\-/]\d{1,2}[月.\-/]\d{1,2}[日号]?(?:\s+\d{1,2}:\d{1,2})?/.exec(html)?.[0];

  return parseChineseDate(timeValue || bodyDate);
}

function extractLinksFromHtml(source: NewsSource, html: string, pageUrl: string): RawFeedEntry[] {
  const entries: RawFeedEntry[] = [];

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    const href = /href=["']([^"']+)["']/i.exec(attrs)?.[1];

    if (!href || /^(javascript:|mailto:|tel:|#)/i.test(href)) continue;

    let url: string;
    try {
      url = normalizeUrl(decodeHtmlEntities(href), pageUrl);
    } catch {
      continue;
    }

    const normalizedUrl = new URL(url);
    normalizedUrl.hash = "";
    for (const key of [...normalizedUrl.searchParams.keys()]) {
      if (/^(utm_|spm|from|share|scene|fbclid|gclid)/i.test(key)) {
        normalizedUrl.searchParams.delete(key);
      }
    }
    url = normalizedUrl.toString();

    if (!sameSite(url, source.url)) continue;
    if (!patternMatches(url, source.crawlIncludeUrlPatterns)) continue;
    if (source.crawlExcludeUrlPatterns?.some((pattern) => new RegExp(pattern, "i").test(url))) continue;

    const attrTitle = /title=["']([^"']+)["']/i.exec(attrs)?.[1];
    const title = stripHtml(decodeHtmlEntities(attrTitle || body));

    if (title.length < 6 || !/[\u4e00-\u9fff]/.test(title)) continue;
    if (!titleKeywordMatches(title, source.crawlTitleKeywords)) continue;

    entries.push({ title, url });
  }

  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (!entry.url || seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(fetchTimeoutMs),
    headers: {
      "User-Agent": "GoodNewsBot/0.1 (+https://github.com/freeman1912/Good-News)",
      Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.6",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchArticleCandidate(
  source: NewsSource,
  entry: RawFeedEntry,
  fetchedAt: string,
): Promise<CandidateItem | undefined> {
  if (!entry.url) return undefined;

  const articleHtml = await fetchHtml(entry.url);
  const pageTitle = pickMeta(articleHtml, "og:title") ?? pickTitle(articleHtml) ?? entry.title;
  const title = cleanArticleTitle(pageTitle ?? "", source);
  const summary = stripHtml(
    decodeHtmlEntities(
      pickMeta(articleHtml, "description") ??
        pickMeta(articleHtml, "og:description") ??
        extractArticleText(articleHtml),
    ),
  ).slice(0, 900);
  const content = extractArticleText(articleHtml);

  return normalizeFeedEntry(
    source,
    {
      title,
      url: entry.url,
      publishedAt: extractPublishedAt(articleHtml),
      summary,
      content,
    },
    fetchedAt,
  );
}

async function fetchCrawlSource(source: NewsSource, fetchedAt: string): Promise<CandidateItem[]> {
  const crawlUrls = source.crawlUrls ?? [];
  const maxLinks = Math.max(1, source.crawlMaxLinks ?? 10);
  const linkEntries: RawFeedEntry[] = [];

  for (const crawlUrl of crawlUrls) {
    const html = await fetchHtml(crawlUrl);
    linkEntries.push(...extractLinksFromHtml(source, html, crawlUrl));
  }

  const candidates: CandidateItem[] = [];
  console.log(`[fetch:crawl] ${source.id}: ${linkEntries.length} discovered links; trying ${Math.min(linkEntries.length, maxLinks)}`);

  for (const entry of linkEntries.slice(0, maxLinks)) {
    try {
      const candidate = await fetchArticleCandidate(source, entry, fetchedAt);
      if (candidate) candidates.push(candidate);
    } catch (error) {
      console.warn(`[fetch:crawl] ${source.id}: article failed ${entry.url} (${formatError(error)})`);
    }
  }

  return candidates;
}

async function main(): Promise<void> {
  const dateKey = todayKey();
  const fetchedAt = new Date().toISOString();
  const sources = (await getSources()).filter((source) => source.rssUrl || source.crawlUrls?.length);
  const existingNews = await getAllNews();
  const candidates: CandidateItem[] = [];
  const errors: FetchError[] = [];

  for (const source of sources) {
    try {
      const feedEntries = await fetchFeed(source, fetchedAt);
      const crawlEntries = source.crawlUrls?.length ? await fetchCrawlSource(source, fetchedAt) : [];
      const entries = [...feedEntries, ...crawlEntries];
      candidates.push(...entries);
      console.log(`[fetch] ${source.id}: ${entries.length} candidates`);
    } catch (error) {
      errors.push({
        sourceId: source.id,
        sourceName: source.name,
        url: source.url,
        rssUrl: source.rssUrl,
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
