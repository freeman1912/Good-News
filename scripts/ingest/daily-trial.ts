import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import type { CandidateItem, ScoredCandidateItem } from "../../src/lib/types";

interface CliOptions {
  date: string;
  summaryOnly: boolean;
  skipFetch: boolean;
  skipScore: boolean;
  skipExport: boolean;
  skipAiDraft: boolean;
  skipPublishAiDraft: boolean;
  skipChinaLeads: boolean;
}

interface FetchError {
  sourceId: string;
  sourceName: string;
  rssUrl: string;
  error: string;
  fetchedAt: string;
}

function todayKey(): string {
  if (process.env.INGEST_DATE) return process.env.INGEST_DATE;

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    date: todayKey(),
    summaryOnly: false,
    skipFetch: false,
    skipScore: false,
    skipExport: false,
    skipAiDraft: false,
    skipPublishAiDraft: false,
    skipChinaLeads: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--date") {
      options.date = argv[index + 1];
      index += 1;
    } else if (arg === "--summary-only") {
      options.summaryOnly = true;
    } else if (arg === "--skip-fetch") {
      options.skipFetch = true;
    } else if (arg === "--skip-score") {
      options.skipScore = true;
    } else if (arg === "--skip-export") {
      options.skipExport = true;
    } else if (arg === "--skip-ai-draft") {
      options.skipAiDraft = true;
    } else if (arg === "--skip-publish-ai-draft") {
      options.skipPublishAiDraft = true;
    } else if (arg === "--skip-china-leads") {
      options.skipChinaLeads = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("Use --date YYYY-MM-DD or set INGEST_DATE=YYYY-MM-DD.");
  }

  return {
    date: options.date,
    summaryOnly: options.summaryOnly ?? false,
    skipFetch: options.skipFetch ?? false,
    skipScore: options.skipScore ?? false,
    skipExport: options.skipExport ?? false,
    skipAiDraft: options.skipAiDraft ?? false,
    skipPublishAiDraft: options.skipPublishAiDraft ?? false,
    skipChinaLeads: options.skipChinaLeads ?? false,
  };
}

function runPnpm(script: string, date: string, args: string[] = []): void {
  const command = ["npx", "pnpm", script, ...args].join(" ");
  const result = spawnSync(command, {
    cwd: process.cwd(),
    env: { ...process.env, INGEST_DATE: date },
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${script} failed with exit code ${result.status ?? "unknown"}.`);
  }
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

function groupCount<T>(items: T[], getKey: (item: T) => string | undefined): Array<[string, number]> {
  const groups = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item) || "unknown";
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }

  return [...groups.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function scoreOf(item: ScoredCandidateItem): number {
  const score = item.aiScore;
  if (!score) return 0;
  return score.goodnessScore + score.evidenceScore + score.publicValueScore - score.prRiskScore;
}

function mdTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const header = rows[0];
  const separator = header.map(() => "---");
  return [header, separator, ...rows.slice(1)]
    .map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}

async function writeSummary(date: string): Promise<void> {
  const dataRoot = resolve(process.cwd(), "data");
  const fetched = await readJsonArray<CandidateItem>(resolve(dataRoot, "candidates", `${date}.fetched.json`));
  const scored = await readJsonArray<ScoredCandidateItem>(resolve(dataRoot, "candidates", `${date}.scored.json`));
  const candidates = await readJsonArray<ScoredCandidateItem>(resolve(dataRoot, "candidates", `${date}.json`));
  const rejected = await readJsonArray<ScoredCandidateItem>(resolve(dataRoot, "rejected", `${date}.json`));
  const published = await readJsonArray<unknown>(resolve(dataRoot, "news", `${date}.json`));
  const fetchErrors = await readJsonArray<FetchError>(resolve(dataRoot, "rejected", `${date}.fetch-errors.json`));
  const chinaLeads = await readJsonArray<Record<string, unknown>>(resolve(dataRoot, "candidates", `${date}.china-leads.json`));

  const topCandidates = [...candidates].sort((left, right) => scoreOf(right) - scoreOf(left)).slice(0, 12);
  const chineseFetchedCount = fetched.filter((item) => item.language === "zh").length;
  const chineseReviewCount = candidates.filter((item) => item.language === "zh").length;
  const candidateRows = [
    ["Source", "Title", "Good", "Evidence", "Public", "PR Risk"],
    ...topCandidates.map((item) => [
      item.sourceName ?? item.sourceId,
      item.title,
      String(item.aiScore?.goodnessScore ?? ""),
      String(item.aiScore?.evidenceScore ?? ""),
      String(item.aiScore?.publicValueScore ?? ""),
      String(item.aiScore?.prRiskScore ?? ""),
    ]),
  ];

  const routeRows = [
    ["Route", "Count"],
    ...groupCount(scored, (item) => item.route).map(([route, count]) => [route, String(count)]),
  ];
  const sourceRows = [
    ["Candidate Source", "Count"],
    ...groupCount(candidates, (item) => item.sourceName ?? item.sourceId).map(([source, count]) => [
      source,
      String(count),
    ]),
  ];
  const chinaRows = [
    ["Chinese Lead Group", "Count"],
    ...groupCount(chinaLeads, (item) => String(item.groupId ?? "unknown")).map(([group, count]) => [
      group,
      String(count),
    ]),
  ];
  const errorRows = [
    ["Source", "Error"],
    ...fetchErrors.map((error) => [error.sourceName, error.error]),
  ];

  const summary = `# Daily Trial Review · ${date}

## What Ran

- Feed candidates fetched: ${fetched.length}
- Chinese webpage candidates fetched: ${chineseFetchedCount}
- Scored items: ${scored.length}
- Review candidates exported: ${candidates.length}
- Chinese review candidates exported: ${chineseReviewCount}
- Rejected items exported: ${rejected.length}
- Published homepage items: ${published.length}
- Chinese lead tasks generated: ${chinaLeads.length}
- Fetch errors: ${fetchErrors.length}

## Route Counts

${mdTable(routeRows)}

## Candidate Sources

${mdTable(sourceRows)}

## Top Review Candidates

${mdTable(candidateRows)}

## Chinese Lead Tasks

${mdTable(chinaRows)}

## Fetch Errors

${fetchErrors.length > 0 ? mdTable(errorRows) : "No fetch errors recorded."}

## Human Review Notes

- Do not publish by count. Publish only items that remain strong after opening the original source.
- Treat watch-level sources as lead-only unless a second source or primary source is found.
- For Chinese items, prefer result-visible stories. Put approvals, launches, and plans into follow-up.
- If fewer than three items survive review, publish fewer or publish nothing.
`;

  const outputDir = resolve(dataRoot, "trials");
  const outputPath = resolve(outputDir, `${date}-daily-review.md`);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, summary, "utf-8");
  console.log(`[daily-trial] wrote ${outputPath}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.summaryOnly) {
    if (!options.skipFetch) runPnpm("ingest:fetch", options.date);
    if (!options.skipScore) runPnpm("ingest:score", options.date);
    if (!options.skipExport) runPnpm("ingest:export-scored", options.date);
    if (!options.skipAiDraft) runPnpm("ingest:ai-draft", options.date);
    if (!options.skipAiDraft && !options.skipPublishAiDraft) {
      const draftPath = resolve(process.cwd(), "data", "manual", `${options.date}.ai-draft.json`);
      const drafts = await readJsonArray<unknown>(draftPath);

      if (drafts.length > 0) {
        runPnpm("ingest:publish-manual", options.date, [
          "--",
          "--date",
          options.date,
          "--file",
          `data/manual/${options.date}.ai-draft.json`,
        ]);
      } else {
        console.log("[daily-trial] no AI draft items; skipped homepage publish");
      }
    }
    if (!options.skipChinaLeads) runPnpm("ingest:china-leads", options.date);
  }

  await writeSummary(options.date);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
