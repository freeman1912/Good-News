import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateWeeklyIssue } from "../../src/lib/weekly";
import type { WeeklyIssue } from "../../src/lib/types";

interface CliOptions {
  weekId: string;
  filePath: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    dryRun: process.env.DRY_RUN === "true",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--week") {
      options.weekId = argv[index + 1];
      index += 1;
    } else if (arg === "--file") {
      options.filePath = resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.weekId || !/^\d{4}-W\d{2}$/.test(options.weekId)) {
    throw new Error("Use --week YYYY-Www, for example --week 2026-W24.");
  }

  return {
    weekId: options.weekId,
    filePath:
      options.filePath ?? resolve(process.cwd(), "data", "weekly-drafts", `${options.weekId}.ai-draft.json`),
    dryRun: options.dryRun ?? false,
  };
}

async function readWeeklyDraft(path: string): Promise<WeeklyIssue> {
  const text = await readFile(path, "utf-8");
  const parsed = JSON.parse(text);
  return validateWeeklyIssue(parsed, path);
}

function assertPublishable(issue: WeeklyIssue, expectedWeekId: string): void {
  if (issue.id !== expectedWeekId) {
    throw new Error(`Draft id ${issue.id} does not match requested week ${expectedWeekId}.`);
  }

  if (issue.items.length === 0) {
    throw new Error(`${issue.id}: weekly issue must contain at least one reviewed item.`);
  }

  const duplicateIds = new Set<string>();
  const seenIds = new Set<string>();
  const duplicateUrls = new Set<string>();
  const seenUrls = new Set<string>();

  for (const item of issue.items) {
    if (seenIds.has(item.id)) duplicateIds.add(item.id);
    seenIds.add(item.id);

    if (seenUrls.has(item.originalUrl)) duplicateUrls.add(item.originalUrl);
    seenUrls.add(item.originalUrl);
  }

  if (duplicateIds.size > 0) {
    throw new Error(`${issue.id}: duplicate item ids: ${[...duplicateIds].join(", ")}.`);
  }

  if (duplicateUrls.size > 0) {
    throw new Error(`${issue.id}: duplicate original URLs: ${[...duplicateUrls].join(", ")}.`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const issue = await readWeeklyDraft(options.filePath);
  assertPublishable(issue, options.weekId);

  const outputDir = resolve(process.cwd(), "data", "weekly");
  const outputPath = resolve(outputDir, `${options.weekId}.json`);

  if (options.dryRun) {
    console.log(`[weekly-publish] dry run ok; would publish ${issue.items.length} item(s) to ${outputPath}`);
    return;
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(issue, null, 2)}\n`, "utf-8");
  console.log(`[weekly-publish] published ${issue.items.length} item(s) to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
