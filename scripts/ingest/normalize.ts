import { createHash } from "node:crypto";
import type { CandidateItem, NewsSource } from "../../src/lib/types";

export interface RawFeedEntry {
  title?: string;
  url?: string;
  publishedAt?: string;
  summary?: string;
  content?: string;
}

export function normalizeWhitespace(value = ""): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stripHtml(value = ""): string {
  return normalizeWhitespace(value.replace(/<[^>]*>/g, " "));
}

export function normalizeTitle(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, "")
    .trim();
}

export function normalizeUrl(url: string, baseUrl: string): string {
  const normalized = new URL(url, baseUrl);
  normalized.hash = "";

  for (const key of [...normalized.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|mc_)/i.test(key)) {
      normalized.searchParams.delete(key);
    }
  }

  return normalized.toString();
}

export function detectLanguage(source: NewsSource, text: string): CandidateItem["language"] {
  if (source.language === "zh") return "zh";
  if (source.language === "en") return "en";
  return /[\u4e00-\u9fff]/.test(text) ? "zh" : "en";
}

export function createDedupeKey(title: string, url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return `${host}:${normalizeTitle(title)}`;
}

export function createCandidateId(sourceId: string, url: string, title: string): string {
  const hash = createHash("sha256")
    .update(`${sourceId}:${url}:${normalizeTitle(title)}`)
    .digest("hex")
    .slice(0, 12);

  return `${sourceId}-${hash}`;
}

export function normalizeFeedEntry(
  source: NewsSource,
  entry: RawFeedEntry,
  fetchedAt: string,
): CandidateItem | undefined {
  const title = normalizeWhitespace(stripHtml(entry.title ?? ""));
  const rawUrl = normalizeWhitespace(entry.url ?? "");

  if (!title || !rawUrl) {
    return undefined;
  }

  const url = normalizeUrl(rawUrl, source.url);
  const summary = stripHtml(entry.summary || entry.content || "").slice(0, 800);

  return {
    id: createCandidateId(source.id, url, title),
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    sourceTrustLevel: source.trustLevel,
    officialRisk: source.officialRisk,
    title,
    url,
    publishedAt: entry.publishedAt,
    fetchedAt,
    language: detectLanguage(source, `${title} ${summary}`),
    rawSummary: summary || undefined,
    dedupeKey: createDedupeKey(title, url),
  };
}
