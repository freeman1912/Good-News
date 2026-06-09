import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { topicDefinitions } from "../../src/lib/categories";
import type { CandidateItem, PublishedNewsItem, Region, TopicSlug } from "../../src/lib/types";

interface ManualDraftItem {
  candidateId: string;
  title: string;
  summary: string;
  region: Region;
  topic: TopicSlug;
  whyGood: string;
  verificationNote: string;
  sourceCount?: number;
  collectedAt?: string;
}

interface CliOptions {
  date: string;
  filePath: string;
  dryRun: boolean;
  keepExamples: boolean;
}

const validRegions = new Set<Region>(["china", "world"]);
const validTopics = new Set<TopicSlug>(topicDefinitions.map((topic) => topic.slug));

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    date: process.env.INGEST_DATE || todayKey(),
    dryRun: process.env.DRY_RUN === "true",
    keepExamples: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--date") {
      options.date = argv[index + 1];
      index += 1;
    } else if (arg === "--file") {
      options.filePath = resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--keep-examples") {
      options.keepExamples = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("Use --date YYYY-MM-DD or set INGEST_DATE=YYYY-MM-DD.");
  }

  return {
    date: options.date,
    filePath: options.filePath ?? resolve(process.cwd(), "data", "manual", `${options.date}.json`),
    dryRun: options.dryRun ?? false,
    keepExamples: options.keepExamples ?? false,
  };
}

async function readJsonArray<T>(path: string): Promise<T[]> {
  try {
    const text = await readFile(path, "utf-8");
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error(`${path} must contain a JSON array.`);
    }

    return parsed as T[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function readRequiredDrafts(path: string): Promise<ManualDraftItem[]> {
  const drafts = await readJsonArray<ManualDraftItem>(path);

  if (drafts.length === 0) {
    throw new Error(`No manual draft items found at ${path}.`);
  }

  return drafts;
}

function assertNonEmpty(value: unknown, field: string, candidateId: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${candidateId}: "${field}" is required.`);
  }

  return value.trim();
}

function validateDraft(draft: ManualDraftItem): ManualDraftItem {
  const candidateId = assertNonEmpty(draft.candidateId, "candidateId", "manual draft");
  const title = assertNonEmpty(draft.title, "title", candidateId);
  const summary = assertNonEmpty(draft.summary, "summary", candidateId);
  const whyGood = assertNonEmpty(draft.whyGood, "whyGood", candidateId);
  const verificationNote = assertNonEmpty(draft.verificationNote, "verificationNote", candidateId);

  if (!validRegions.has(draft.region)) {
    throw new Error(`${candidateId}: region must be "china" or "world".`);
  }

  if (!validTopics.has(draft.topic)) {
    throw new Error(`${candidateId}: topic "${draft.topic}" is not a known topic slug.`);
  }

  if (draft.sourceCount !== undefined && (!Number.isInteger(draft.sourceCount) || draft.sourceCount < 1)) {
    throw new Error(`${candidateId}: sourceCount must be a positive integer.`);
  }

  return {
    candidateId,
    title,
    summary,
    region: draft.region,
    topic: draft.topic,
    whyGood,
    verificationNote,
    sourceCount: draft.sourceCount,
    collectedAt: draft.collectedAt,
  };
}

function mergeCandidates(candidates: CandidateItem[]): Map<string, CandidateItem> {
  const byId = new Map<string, CandidateItem>();

  for (const candidate of candidates) {
    byId.set(candidate.id, candidate);
  }

  return byId;
}

function toPublishedNews(draft: ManualDraftItem, candidate: CandidateItem): PublishedNewsItem {
  return {
    id: candidate.id,
    title: draft.title,
    summary: draft.summary,
    region: draft.region,
    topic: draft.topic,
    sourceName: candidate.sourceName ?? candidate.sourceId,
    sourceUrl: candidate.sourceUrl ?? candidate.url,
    originalUrl: candidate.url,
    publishedAt: candidate.publishedAt,
    collectedAt: draft.collectedAt ?? new Date().toISOString(),
    whyGood: draft.whyGood,
    verificationNote: draft.verificationNote,
    sourceCount: draft.sourceCount ?? 1,
    status: "published",
  };
}

function mergePublished(
  existing: PublishedNewsItem[],
  incoming: PublishedNewsItem[],
  keepExamples: boolean,
): PublishedNewsItem[] {
  const base = keepExamples ? existing : existing.filter((item) => !item.isExample);
  const incomingById = new Map(incoming.map((item) => [item.id, item]));
  const merged = base.map((item) => incomingById.get(item.id) ?? item);
  const existingIds = new Set(merged.map((item) => item.id));

  for (const item of incoming) {
    if (!existingIds.has(item.id)) {
      merged.push(item);
    }
  }

  return merged.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const dataRoot = resolve(process.cwd(), "data");
  const candidatePath = resolve(dataRoot, "candidates", `${options.date}.json`);
  const fetchedPath = resolve(dataRoot, "candidates", `${options.date}.fetched.json`);
  const newsPath = resolve(dataRoot, "news", `${options.date}.json`);
  const candidates = mergeCandidates([
    ...(await readJsonArray<CandidateItem>(fetchedPath)),
    ...(await readJsonArray<CandidateItem>(candidatePath)),
  ]);
  const drafts = (await readRequiredDrafts(options.filePath)).map(validateDraft);
  const published: PublishedNewsItem[] = [];

  for (const draft of drafts) {
    const candidate = candidates.get(draft.candidateId);

    if (!candidate) {
      throw new Error(
        `${draft.candidateId}: candidate not found in data/candidates/${options.date}.json or ${options.date}.fetched.json.`,
      );
    }

    published.push(toPublishedNews(draft, candidate));
  }

  const existing = await readJsonArray<PublishedNewsItem>(newsPath);
  const merged = mergePublished(existing, published, options.keepExamples);

  if (options.dryRun) {
    console.log(`[publish-manual] dry run ok; would publish ${published.length} item(s) to ${newsPath}`);
    return;
  }

  await mkdir(resolve(dataRoot, "news"), { recursive: true });
  await writeFile(newsPath, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");
  console.log(`[publish-manual] published ${published.length} item(s) to ${newsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
