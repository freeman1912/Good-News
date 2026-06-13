import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { filterItemsByWeek, getWeekId, getWeekRange, isDateInWeekRange } from "../../src/lib/weeks";
import type { ScoredCandidateItem, WeeklyGoodNewsItem, WeeklyIssue, WeeklyWatchItem } from "../../src/lib/types";

interface CliOptions {
  weekId: string;
  maxCandidates: number;
  includeWatch: boolean;
}

interface WeeklyDecision {
  item: ScoredCandidateItem;
  route: "draft" | "hold";
  reason: string;
  weeklyScore: number;
}

const CANDIDATE_FILE_PATTERN = /^\d{4}-\d{2}-\d{2}\.json$/;
const titleRejectPatterns = [
  /what went right/i,
  /what we.?re reading/i,
  /in pictures/i,
  /photos?/i,
  /quiz/i,
  /roundup/i,
  /radical change/i,
  /new report/i,
  /says new report/i,
];
const scienceHumanMeaningPatterns = [
  /患者/u,
  /治疗/u,
  /临床/u,
  /疾病/u,
  /药/u,
  /残障/u,
  /康复/u,
  /生活/u,
  /环境/u,
  /修复/u,
  /航天/u,
  /太空/u,
  /深海/u,
  /考古/u,
  /恒星/u,
  /星系/u,
  /宇宙/u,
  /望远镜/u,
  /space/i,
  /patient/i,
  /therapy/i,
  /clinical/i,
  /disability/i,
  /restoration/i,
  /river/i,
  /ocean/i,
  /archaeology/i,
];
const prTitlePatterns = [
  /携手/u,
  /助力/u,
  /圆满/u,
  /启动/u,
  /签约/u,
  /发布会/u,
  /落地/u,
  /品牌/u,
  /brand/i,
];
const narrowScienceTitlePatterns = [
  /芯片/u,
  /材料/u,
  /抗体研发/u,
  /AI模型/u,
  /调控因子/u,
  /治疗潜力/u,
  /散热瓶颈/u,
  /突破/u,
  /catalyst/i,
  /chip/i,
];

function todayKey(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    maxCandidates: Number(process.env.WEEKLY_DRAFT_MAX_CANDIDATES || 8),
    includeWatch: process.env.WEEKLY_DRAFT_INCLUDE_WATCH === "true",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    } else if (arg === "--week") {
      options.weekId = argv[index + 1];
      index += 1;
    } else if (arg === "--max-candidates") {
      options.maxCandidates = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--include-watch") {
      options.includeWatch = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.weekId) {
    options.weekId = process.env.WEEKLY_ISSUE_ID || getWeekIdForPreviousWeek(todayKey());
  }

  const maxCandidates = options.maxCandidates ?? 8;

  if (!Number.isInteger(maxCandidates) || maxCandidates < 1 || maxCandidates > 30) {
    throw new Error("--max-candidates must be an integer between 1 and 30.");
  }

  return {
    weekId: options.weekId,
    maxCandidates,
    includeWatch: options.includeWatch ?? false,
  };
}

function getWeekIdForPreviousWeek(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 7);
  return getWeekId(date);
}

async function readJsonArray<T>(path: string): Promise<T[]> {
  const text = await readFile(path, "utf-8");
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed)) {
    throw new Error(`${path} must contain a JSON array.`);
  }

  return parsed as T[];
}

async function collectCandidates(weekId: string): Promise<ScoredCandidateItem[]> {
  const range = getWeekRange(weekId);
  const candidateDir = resolve(process.cwd(), "data", "candidates");
  let files: string[] = [];

  try {
    files = await readdir(candidateDir);
  } catch {
    return [];
  }

  const dailyFiles = files
    .filter((file) => CANDIDATE_FILE_PATTERN.test(file))
    .filter((file) => isDateInWeekRange(file.slice(0, 10), range))
    .sort();
  const batches = await Promise.all(
    dailyFiles.map((file) => readJsonArray<ScoredCandidateItem>(resolve(candidateDir, file))),
  );

  return filterItemsByWeek(batches.flat(), weekId, (item) => item.publishedAt);
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/$/, "");
  }
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .trim();
}

function dedupeCandidates(items: ScoredCandidateItem[]): ScoredCandidateItem[] {
  const byKey = new Map<string, ScoredCandidateItem>();

  for (const item of items) {
    const key = normalizeUrl(item.url) || normalizeTitle(item.title);
    const existing = byKey.get(key);

    if (!existing || weeklyScore(item) > weeklyScore(existing)) {
      byKey.set(key, item);
    }
  }

  const byTitle = new Map<string, ScoredCandidateItem>();

  for (const item of byKey.values()) {
    const key = normalizeTitle(item.title);
    const existing = byTitle.get(key);

    if (!existing || weeklyScore(item) > weeklyScore(existing)) {
      byTitle.set(key, item);
    }
  }

  return [...byTitle.values()];
}

function textForMeaning(item: ScoredCandidateItem): string {
  return [
    item.title,
    item.rawSummary,
    item.rawContent,
    item.aiScore?.summaryZh,
    item.aiScore?.whyGoodZh,
    item.aiScore?.verificationNoteZh,
  ]
    .filter(Boolean)
    .join("\n");
}

function hasHumanMeaning(item: ScoredCandidateItem): boolean {
  const text = textForMeaning(item);
  return scienceHumanMeaningPatterns.some((pattern) => pattern.test(text));
}

function weeklyScore(item: ScoredCandidateItem): number {
  const score = item.aiScore;
  if (!score) return 0;

  const sourceBonus = item.sourceTrustLevel === "high" ? 12 : item.sourceTrustLevel === "medium" ? 4 : -18;
  const languageBonus = item.language === "zh" ? 8 : 0;
  const humanMeaningBonus = hasHumanMeaning(item) ? 18 : 0;
  const sourceTrailBonus = item.sourceUrl || item.url ? 6 : 0;
  const prPenalty = score.prRiskScore * 1.8;
  const doomPenalty = score.doomContextScore * 0.7;

  return (
    score.goodnessScore * 1.1 +
    score.specificityScore * 1.2 +
    score.evidenceScore * 1.2 +
    score.publicValueScore * 1.3 -
    prPenalty -
    doomPenalty +
    sourceBonus +
    languageBonus +
    humanMeaningBonus +
    sourceTrailBonus
  );
}

function decide(item: ScoredCandidateItem, includeWatch: boolean): WeeklyDecision {
  const score = item.aiScore;
  const title = item.title;
  const quality = weeklyScore(item);

  if (!score) {
    return { item, route: "hold", reason: "缺少 AI 评分。", weeklyScore: quality };
  }

  if (item.route !== "candidate") {
    return { item, route: "hold", reason: `路由为 ${item.route}，不是候选。`, weeklyScore: quality };
  }

  if (item.sourceTrustLevel === "watch" && !includeWatch) {
    return { item, route: "hold", reason: "观察级来源先保留为线索，不进入自动周报草稿。", weeklyScore: quality };
  }

  if (titleRejectPatterns.some((pattern) => pattern.test(title))) {
    return { item, route: "hold", reason: "集合、图片或轻内容不进入自动周报草稿。", weeklyScore: quality };
  }

  if (item.officialRisk) {
    return { item, route: "hold", reason: "官方风险来源需要额外核实，不自动进入周报草稿。", weeklyScore: quality };
  }

  if (prTitlePatterns.some((pattern) => pattern.test(title)) || score.prRiskScore > 25) {
    return { item, route: "hold", reason: "宣传或软文风险偏高。", weeklyScore: quality };
  }

  if (score.suggestedTopic === "science-health" && !hasHumanMeaning(item)) {
    return { item, route: "hold", reason: "科学技术候选暂未讲清和人的关系。", weeklyScore: quality };
  }

  if (
    score.suggestedTopic === "science-health" &&
    narrowScienceTitlePatterns.some((pattern) => pattern.test(title)) &&
    !/患者|临床|治疗|疾病|残障|航天|太空|深海|考古|恒星|星系|宇宙|望远镜|化石/u.test(textForMeaning(item))
  ) {
    return { item, route: "hold", reason: "偏窄的科研/技术进展先保留，除非能讲清人的意义。", weeklyScore: quality };
  }

  if (
    !score.isGoodNews ||
    score.goodnessScore < 72 ||
    score.specificityScore < 60 ||
    score.evidenceScore < 60 ||
    score.publicValueScore < 68
  ) {
    return { item, route: "hold", reason: "周报综合阈值不足。", weeklyScore: quality };
  }

  return { item, route: "draft", reason: "符合周报草稿阈值，仍需打开原文复核。", weeklyScore: quality };
}

function selectDraftDecisions(decisions: WeeklyDecision[], maxCandidates: number): WeeklyDecision[] {
  const selected: WeeklyDecision[] = [];
  const topicCounts = new Map<string, number>();
  const sorted = decisions
    .filter((decision) => decision.route === "draft")
    .sort((left, right) => right.weeklyScore - left.weeklyScore);

  for (const decision of sorted) {
    const topic = decision.item.aiScore?.suggestedTopic ?? "other";
    const currentCount = topicCounts.get(topic) ?? 0;

    if (topic === "science-health" && currentCount >= 2) {
      continue;
    }

    selected.push(decision);
    topicCounts.set(topic, currentCount + 1);

    if (selected.length >= maxCandidates) {
      break;
    }
  }

  return selected;
}

function titleFromItem(item: ScoredCandidateItem): string {
  const summary = item.aiScore?.summaryZh.trim();

  if (summary) {
    const sentence = summary.split(/[。！？]/)[0] || summary;
    const clause = sentence.split(/[，；：]/)[0] || sentence;
    return clause.length > 34 ? `${clause.slice(0, 34)}...` : clause;
  }

  return item.title;
}

function weeklyNote(item: ScoredCandidateItem): string {
  if (item.aiScore?.suggestedTopic === "science-health") {
    return "这条进入周报，是因为它需要被解释成和人的健康、生活或未来想象有关，而不是只当作科研快讯。";
  }

  if (item.language === "zh") {
    return "这条来自中文来源，发布前尤其需要确认它不是宣传稿、软文或只有启动仪式的消息。";
  }

  return "这条进入周报，是因为它有具体行动和可理解的公共价值；发布前仍需快速核对原文。";
}

function toWeeklyItem(item: ScoredCandidateItem, issuePublishedAt: string): WeeklyGoodNewsItem {
  if (!item.aiScore) {
    throw new Error(`${item.id} has no AI score.`);
  }

  return {
    id: item.id,
    title: titleFromItem(item),
    summary: item.aiScore.summaryZh.trim(),
    region: item.aiScore.suggestedRegion,
    topic: item.aiScore.suggestedTopic,
    sourceName: item.sourceName ?? item.sourceId,
    sourceUrl: item.sourceUrl ?? item.url,
    originalUrl: item.url,
    publishedAt: item.publishedAt,
    collectedAt: item.scoredAt || issuePublishedAt,
    whyGood: item.aiScore.whyGoodZh.trim(),
    verificationNote: `${item.aiScore.verificationNoteZh.trim()} 周报草稿自动生成；发布前需要打开原文确认细节。`,
    sourceCount: 1,
    status: "published",
    mediaType: "article",
    weeklyNote: weeklyNote(item),
  };
}

function toWatchItem(decision: WeeklyDecision): WeeklyWatchItem {
  return {
    id: decision.item.id,
    title: decision.item.title,
    reason: decision.reason,
    sourceName: decision.item.sourceName ?? decision.item.sourceId,
    sourceUrl: decision.item.url,
    followUpQuestion: "这条是否有更清楚的结果、受益者或第二来源，足以让普通读者理解它为什么值得进入周报？",
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

function reviewMarkdown(
  issue: WeeklyIssue,
  draftDecisions: WeeklyDecision[],
  holdDecisions: WeeklyDecision[],
  rawCount: number,
  dedupedCount: number,
): string {
  const draftRows = [
    ["Title", "Source", "Score", "Reason"],
    ...draftDecisions.map((decision) => [
      decision.item.title,
      decision.item.sourceName ?? decision.item.sourceId,
      decision.weeklyScore.toFixed(1),
      decision.reason,
    ]),
  ];
  const holdRows = [
    ["Held Title", "Source", "Reason"],
    ...holdDecisions.slice(0, 16).map((decision) => [
      decision.item.title,
      decision.item.sourceName ?? decision.item.sourceId,
      decision.reason,
    ]),
  ];

  return `# Weekly Draft Review · ${issue.id}

## Result

- Raw candidate items: ${rawCount}
- Deduped candidate items: ${dedupedCount}
- Draft items: ${issue.items.length}
- Watchlist items: ${issue.watchlist?.length ?? 0}
- Week range: ${issue.weekStart} to ${issue.weekEnd}

The draft file is \`data/weekly-drafts/${issue.id}.ai-draft.json\`.

## Draft Items

${draftDecisions.length > 0 ? mdTable(draftRows) : "No item met the weekly draft threshold."}

## Held For Review

${holdDecisions.length > 0 ? mdTable(holdRows) : "No held candidate."}

## Review Rule

These are weekly AI-assisted drafts, not automatic publication. Open original
links and remove anything that feels too technical, promotional, unverifiable,
or emotionally manipulative.
`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const range = getWeekRange(options.weekId);
  const rawCandidates = await collectCandidates(options.weekId);
  const deduped = dedupeCandidates(rawCandidates);
  const decisions = deduped.map((item) => decide(item, options.includeWatch));
  const draftDecisions = selectDraftDecisions(decisions, options.maxCandidates);
  const draftedIds = new Set(draftDecisions.map((decision) => decision.item.id));
  const holdDecisions = decisions
    .filter((decision) => !draftedIds.has(decision.item.id))
    .sort((left, right) => right.weeklyScore - left.weeklyScore);
  const publishedAt = new Date().toISOString();
  const issue: WeeklyIssue = {
    id: options.weekId,
    weekStart: range.start,
    weekEnd: range.end,
    title: `${range.start} 至 ${range.end} 好消息周报`,
    intro: "这是一份自动生成的周报草稿。它从一周候选里筛出更具体、更可理解、更接近“有人在解决问题”的条目，等待发布前复核。",
    publishedAt,
    items: draftDecisions.map((decision) => toWeeklyItem(decision.item, publishedAt)),
    watchlist: holdDecisions.slice(0, 8).map(toWatchItem),
  };
  const draftDir = resolve(process.cwd(), "data", "weekly-drafts");
  const trialDir = resolve(process.cwd(), "data", "trials");
  const draftPath = resolve(draftDir, `${options.weekId}.ai-draft.json`);
  const reviewPath = resolve(trialDir, `${options.weekId}-weekly-review.md`);

  await mkdir(draftDir, { recursive: true });
  await mkdir(trialDir, { recursive: true });
  await writeFile(draftPath, `${JSON.stringify(issue, null, 2)}\n`, "utf-8");
  await writeFile(reviewPath, reviewMarkdown(issue, draftDecisions, holdDecisions, rawCandidates.length, deduped.length), "utf-8");

  console.log(`[weekly-draft] wrote ${issue.items.length} item(s) to ${draftPath}`);
  console.log(`[weekly-draft] wrote review note to ${reviewPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
