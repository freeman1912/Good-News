import type { CandidateItem, PublishedNewsItem } from "../../src/lib/types";
import { createDedupeKey, normalizeUrl } from "./normalize";

export interface DedupeResult {
  items: CandidateItem[];
  dropped: CandidateItem[];
}

export function dedupeCandidates(
  candidates: CandidateItem[],
  existingNews: PublishedNewsItem[] = [],
): DedupeResult {
  const seen = new Set<string>();
  const existingUrls = new Set(
    existingNews.map((item) => normalizeUrl(item.originalUrl, item.sourceUrl)),
  );
  const existingKeys = new Set(
    existingNews.map((item) => createDedupeKey(item.title, item.originalUrl)),
  );
  const items: CandidateItem[] = [];
  const dropped: CandidateItem[] = [];

  for (const candidate of candidates) {
    const url = normalizeUrl(candidate.url, candidate.sourceUrl ?? candidate.url);
    const key = candidate.dedupeKey || createDedupeKey(candidate.title, url);

    if (seen.has(key) || existingUrls.has(url) || existingKeys.has(key)) {
      dropped.push(candidate);
      continue;
    }

    seen.add(key);
    items.push({ ...candidate, url, dedupeKey: key });
  }

  return { items, dropped };
}
