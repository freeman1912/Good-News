import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RejectedCandidateItem, ScoredCandidateItem } from "../../src/lib/types";

interface CliOptions {
  date: string;
  scoredPath: string;
  dryRun: boolean;
}

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    date: todayKey(),
    dryRun: process.env.DRY_RUN === "true",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--date") {
      options.date = argv[index + 1];
      index += 1;
    } else if (arg === "--scored-file") {
      options.scoredPath = resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("Use --date YYYY-MM-DD or set INGEST_DATE=YYYY-MM-DD.");
  }

  return {
    date: options.date,
    scoredPath:
      options.scoredPath ?? resolve(process.cwd(), "data", "candidates", `${options.date}.scored.json`),
    dryRun: options.dryRun ?? false,
  };
}

async function readScoredItems(path: string): Promise<ScoredCandidateItem[]> {
  const text = await readFile(path, "utf-8");
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error(`${path} must contain a JSON array.`);
  }

  return parsed as ScoredCandidateItem[];
}

function sortForReview(items: ScoredCandidateItem[]): ScoredCandidateItem[] {
  return [...items].sort((left, right) => {
    const leftScore = left.aiScore?.goodnessScore ?? 0;
    const rightScore = right.aiScore?.goodnessScore ?? 0;
    const leftEvidence = left.aiScore?.evidenceScore ?? 0;
    const rightEvidence = right.aiScore?.evidenceScore ?? 0;

    return rightScore - leftScore || rightEvidence - leftEvidence || left.sourceId.localeCompare(right.sourceId);
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const scored = await readScoredItems(options.scoredPath);
  const candidates = sortForReview(scored.filter((item) => item.route === "candidate"));
  const rejected = sortForReview(scored.filter((item): item is RejectedCandidateItem => item.route === "rejected"));
  const published = scored.filter((item) => item.route === "published");

  const candidatesPath = resolve(process.cwd(), "data", "candidates", `${options.date}.json`);
  const rejectedPath = resolve(process.cwd(), "data", "rejected", `${options.date}.json`);

  console.log(
    `[export-scored] ${scored.length} scored -> ${candidates.length} candidates, ${rejected.length} rejected, ${published.length} published routes`,
  );

  if (options.dryRun) {
    console.log("[export-scored] dry run; no files written");
    return;
  }

  await mkdir(resolve(process.cwd(), "data", "candidates"), { recursive: true });
  await mkdir(resolve(process.cwd(), "data", "rejected"), { recursive: true });
  await writeFile(candidatesPath, `${JSON.stringify(candidates, null, 2)}\n`, "utf-8");
  await writeFile(rejectedPath, `${JSON.stringify(rejected, null, 2)}\n`, "utf-8");
  console.log(`[export-scored] wrote ${candidatesPath}`);
  console.log(`[export-scored] wrote ${rejectedPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
