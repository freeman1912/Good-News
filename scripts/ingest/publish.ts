import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PublishedNewsItem, ScoredCandidateItem } from "../../src/lib/types";

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

async function readJsonArray<T>(path: string): Promise<T[]> {
  try {
    const text = await readFile(path, "utf-8");
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function toPublishedNews(candidate: ScoredCandidateItem): PublishedNewsItem {
  if (!candidate.aiScore) {
    throw new Error(`Cannot publish ${candidate.id} without validated AI score.`);
  }

  return {
    id: candidate.id,
    title: candidate.title,
    summary: candidate.aiScore.summaryZh,
    region: candidate.aiScore.suggestedRegion,
    topic: candidate.aiScore.suggestedTopic,
    sourceName: candidate.sourceName ?? candidate.sourceId,
    sourceUrl: candidate.sourceUrl ?? candidate.url,
    originalUrl: candidate.url,
    publishedAt: candidate.publishedAt,
    collectedAt: candidate.scoredAt,
    whyGood: candidate.aiScore.whyGoodZh,
    verificationNote: candidate.aiScore.verificationNoteZh,
    sourceCount: 1,
    status: "published",
  };
}

function mergePublished(
  existing: PublishedNewsItem[],
  incoming: PublishedNewsItem[],
): PublishedNewsItem[] {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];

  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged.sort((a, b) => {
    return new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime();
  });
}

async function main(): Promise<void> {
  const dateKey = todayKey();
  const dataRoot = resolve(process.cwd(), "data");
  const scoredPath = resolve(dataRoot, "candidates", `${dateKey}.scored.json`);
  const candidatesPath = resolve(dataRoot, "candidates", `${dateKey}.json`);
  const rejectedPath = resolve(dataRoot, "rejected", `${dateKey}.json`);
  const newsPath = resolve(dataRoot, "news", `${dateKey}.json`);
  const scored = await readJsonArray<ScoredCandidateItem>(scoredPath);
  const candidates = scored.filter((item) => item.route === "candidate");
  const rejected = scored.filter((item) => item.route === "rejected");
  const published = scored.filter((item) => item.route === "published").map(toPublishedNews);

  await mkdir(resolve(dataRoot, "candidates"), { recursive: true });
  await mkdir(resolve(dataRoot, "rejected"), { recursive: true });
  await mkdir(resolve(dataRoot, "news"), { recursive: true });
  await writeFile(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`, "utf-8");
  await writeFile(rejectedPath, `${JSON.stringify(rejected, null, 2)}\n`, "utf-8");

  if (published.length > 0) {
    const existing = await readJsonArray<PublishedNewsItem>(newsPath);
    await writeFile(
      newsPath,
      `${JSON.stringify(mergePublished(existing, published), null, 2)}\n`,
      "utf-8",
    );
  }

  console.log(
    `[publish] candidates ${candidates.length}; rejected ${rejected.length}; published ${published.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
