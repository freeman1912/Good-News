import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ScoredCandidateItem } from "../../src/lib/types";

interface ManualDraftItem {
  candidateId: string;
  title: string;
  summary: string;
  region: string;
  topic: string;
  whyGood: string;
  verificationNote: string;
  sourceCount: number;
}

interface DraftDecision {
  item: ScoredCandidateItem;
  route: "draft" | "hold";
  reason: string;
  qualityScore: number;
}

interface CliOptions {
  date: string;
  maxItems: number;
  includeWatch: boolean;
  candidatesPath: string;
}

const titleRejectPatterns = [
  /what went right/i,
  /what do you do/i,
  /what we.?re reading/i,
  /dialect coach/i,
  /photo mosaic/i,
  /last supper/i,
];

const abstractTitlePatterns = [
  /radical change/i,
  /new report/i,
  /says new report/i,
];

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    date: todayKey(),
    maxItems: Number(process.env.AI_DRAFT_MAX_ITEMS || 6),
    includeWatch: process.env.AI_DRAFT_INCLUDE_WATCH === "true",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--date") {
      options.date = argv[index + 1];
      index += 1;
    } else if (arg === "--max") {
      options.maxItems = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--include-watch") {
      options.includeWatch = true;
    } else if (arg === "--candidates-file") {
      options.candidatesPath = resolve(process.cwd(), argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.date || !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("Use --date YYYY-MM-DD or set INGEST_DATE=YYYY-MM-DD.");
  }

  const maxItems = options.maxItems ?? 6;

  if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > 20) {
    throw new Error("--max must be an integer between 1 and 20.");
  }

  return {
    date: options.date,
    maxItems,
    includeWatch: options.includeWatch ?? false,
    candidatesPath:
      options.candidatesPath ?? resolve(process.cwd(), "data", "candidates", `${options.date}.json`),
  };
}

async function readJsonArray<T>(path: string): Promise<T[]> {
  const text = await readFile(path, "utf-8");
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error(`${path} must contain a JSON array.`);
  }

  return parsed as T[];
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function firstChineseClause(value: string): string {
  const trimmed = value.trim();
  const sentence = trimmed.split(/[。！？]/)[0] || trimmed;
  const clause = sentence.split(/[，；：]/)[0] || sentence;
  return clause.length > 34 ? `${clause.slice(0, 34)}…` : clause;
}

function qualityScore(item: ScoredCandidateItem): number {
  const score = item.aiScore;
  if (!score) return 0;

  const sourceBonus = item.sourceTrustLevel === "high" ? 12 : item.sourceTrustLevel === "medium" ? 4 : -18;
  return (
    score.goodnessScore +
    score.specificityScore +
    score.evidenceScore +
    score.publicValueScore -
    score.prRiskScore * 1.5 -
    score.doomContextScore * 0.5 +
    sourceBonus
  );
}

function decide(item: ScoredCandidateItem, includeWatch: boolean): DraftDecision {
  const score = item.aiScore;
  const title = decodeHtml(item.title);
  const quality = qualityScore(item);

  if (!score) {
    return { item, route: "hold", reason: "缺少 AI 评分。", qualityScore: quality };
  }

  if (item.route !== "candidate") {
    return { item, route: "hold", reason: `路由为 ${item.route}，不是候选。`, qualityScore: quality };
  }

  if (item.sourceTrustLevel === "watch" && !includeWatch) {
    return { item, route: "hold", reason: "观察级来源默认不进入自动草稿。", qualityScore: quality };
  }

  if (titleRejectPatterns.some((pattern) => pattern.test(title))) {
    return { item, route: "hold", reason: "集合稿、互动征集或轻趣闻不进入自动草稿。", qualityScore: quality };
  }

  if (abstractTitlePatterns.some((pattern) => pattern.test(title)) && score.specificityScore < 75) {
    return { item, route: "hold", reason: "报告/观点类内容过于抽象，需人工判断。", qualityScore: quality };
  }

  if (
    !score.isGoodNews ||
    score.goodnessScore < 78 ||
    score.specificityScore < 60 ||
    score.evidenceScore < 65 ||
    score.publicValueScore < 75 ||
    score.prRiskScore > 25
  ) {
    return { item, route: "hold", reason: "分数未达到自动草稿阈值。", qualityScore: quality };
  }

  return { item, route: "draft", reason: "达到自动草稿阈值，仍需发布前快速扫读原文。", qualityScore: quality };
}

function toManualDraft(item: ScoredCandidateItem): ManualDraftItem {
  if (!item.aiScore) {
    throw new Error(`${item.id} has no AI score.`);
  }

  const summary = item.aiScore.summaryZh.trim();
  const title = firstChineseClause(summary);

  return {
    candidateId: item.id,
    title,
    summary,
    region: item.aiScore.suggestedRegion,
    topic: item.aiScore.suggestedTopic,
    whyGood: item.aiScore.whyGoodZh.trim(),
    verificationNote: `${item.aiScore.verificationNoteZh.trim()} AI 已按高置信阈值生成草稿；发布前建议打开原文快速确认细节。`,
    sourceCount: 1,
  };
}

function mdTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const header = rows[0];
  const separator = header.map(() => "---");
  return [header, separator, ...rows.slice(1)]
    .map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}

function writePickNote(date: string, draftDecisions: DraftDecision[], holdDecisions: DraftDecision[]): string {
  const draftRows = [
    ["Candidate", "Source", "Quality", "Why Picked"],
    ...draftDecisions.map((decision) => [
      decodeHtml(decision.item.title),
      decision.item.sourceName ?? decision.item.sourceId,
      decision.qualityScore.toFixed(1),
      decision.reason,
    ]),
  ];
  const holdRows = [
    ["Held Candidate", "Source", "Reason"],
    ...holdDecisions.slice(0, 12).map((decision) => [
      decodeHtml(decision.item.title),
      decision.item.sourceName ?? decision.item.sourceId,
      decision.reason,
    ]),
  ];

  return `# AI Draft Picks · ${date}

## Result

- Auto draft items: ${draftDecisions.length}
- Held items: ${holdDecisions.length}

The draft file is \`data/manual/${date}.ai-draft.json\`.

## Auto Draft

${draftDecisions.length > 0 ? mdTable(draftRows) : "No item met the automatic draft threshold."}

## Held For Manual Review

${holdDecisions.length > 0 ? mdTable(holdRows) : "No held candidate."}

## Review Rule

These are AI-assisted drafts, not automatic publication. Before publishing, open
the source links for the drafted items and remove anything that feels abstract,
promotional, unverifiable, or weak.

To publish after review:

\`\`\`powershell
npx pnpm ingest:publish-manual -- --date ${date} --file data/manual/${date}.ai-draft.json
\`\`\`
`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const candidates = await readJsonArray<ScoredCandidateItem>(options.candidatesPath);
  const decisions = candidates.map((item) => decide(item, options.includeWatch));
  const draftDecisions = decisions
    .filter((decision) => decision.route === "draft")
    .sort((left, right) => right.qualityScore - left.qualityScore)
    .slice(0, options.maxItems);
  const draftedIds = new Set(draftDecisions.map((decision) => decision.item.id));
  const holdDecisions = decisions
    .filter((decision) => decision.route === "hold" || !draftedIds.has(decision.item.id))
    .filter((decision) => !draftedIds.has(decision.item.id))
    .sort((left, right) => right.qualityScore - left.qualityScore);

  const drafts = draftDecisions.map((decision) => toManualDraft(decision.item));
  const manualDir = resolve(process.cwd(), "data", "manual");
  const trialDir = resolve(process.cwd(), "data", "trials");
  const draftPath = resolve(manualDir, `${options.date}.ai-draft.json`);
  const picksPath = resolve(trialDir, `${options.date}-ai-picks.md`);

  await mkdir(manualDir, { recursive: true });
  await mkdir(trialDir, { recursive: true });
  await writeFile(draftPath, `${JSON.stringify(drafts, null, 2)}\n`, "utf-8");
  await writeFile(picksPath, writePickNote(options.date, draftDecisions, holdDecisions), "utf-8");

  console.log(`[ai-draft] wrote ${drafts.length} draft item(s) to ${draftPath}`);
  console.log(`[ai-draft] wrote review note to ${picksPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
