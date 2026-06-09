import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { topicDefinitions } from "../../src/lib/categories";
import type {
  AiNewsScore,
  CandidateItem,
  CandidateRoute,
  Region,
  ScoredCandidateItem,
  TopicSlug,
} from "../../src/lib/types";

const allowedTopics = new Set<string>(topicDefinitions.map((topic) => topic.slug));
const allowedRegions = new Set<string>(["china", "world"]);

interface AiProviderConfig {
  name: "deepseek" | "openai";
  apiKey: string;
  model: string;
  baseUrl: string;
}

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

async function loadLocalEnv(): Promise<void> {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const text = await readFile(envPath, "utf-8");

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) continue;

      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 1) continue;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
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

function numberInRange(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function requireString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseAiScore(value: unknown): AiNewsScore {
  const record = value as Record<string, unknown>;

  if (typeof record.isGoodNews !== "boolean") {
    throw new Error("AI score missing boolean isGoodNews.");
  }

  const numericKeys = [
    "goodnessScore",
    "specificityScore",
    "evidenceScore",
    "publicValueScore",
    "prRiskScore",
    "doomContextScore",
  ] as const;

  for (const key of numericKeys) {
    if (!numberInRange(record[key])) {
      throw new Error(`AI score ${key} must be a number between 0 and 100.`);
    }
  }

  if (!allowedRegions.has(String(record.suggestedRegion))) {
    throw new Error("AI score suggestedRegion is invalid.");
  }

  if (!allowedTopics.has(String(record.suggestedTopic))) {
    throw new Error("AI score suggestedTopic is invalid.");
  }

  const rejectReason = requireString(record.rejectReason)
    ? String(record.rejectReason).trim()
    : "AI 判断不符合收录标准。";

  if (record.isGoodNews) {
    for (const key of ["summaryZh", "whyGoodZh", "verificationNoteZh"] as const) {
      if (!requireString(record[key])) {
        throw new Error(`AI score ${key} must be a non-empty string.`);
      }
    }
  }

  return {
    isGoodNews: record.isGoodNews,
    goodnessScore: record.goodnessScore as number,
    specificityScore: record.specificityScore as number,
    evidenceScore: record.evidenceScore as number,
    publicValueScore: record.publicValueScore as number,
    prRiskScore: record.prRiskScore as number,
    doomContextScore: record.doomContextScore as number,
    suggestedRegion: record.suggestedRegion as Region,
    suggestedTopic: record.suggestedTopic as TopicSlug,
    summaryZh: requireString(record.summaryZh) ? String(record.summaryZh).trim() : `不收录：${rejectReason}`,
    whyGoodZh: requireString(record.whyGoodZh) ? String(record.whyGoodZh).trim() : "不符合今日好消息收录标准。",
    verificationNoteZh: requireString(record.verificationNoteZh)
      ? String(record.verificationNoteZh).trim()
      : "AI 拒绝项，未生成核实说明。",
    rejectReason: requireString(record.rejectReason) ? String(record.rejectReason).trim() : undefined,
  };
}

function routeCandidate(
  candidate: CandidateItem,
  score: AiNewsScore | undefined,
): { route: CandidateRoute; reason: string } {
  if (!score) {
    return {
      route: "candidate",
      reason: "缺少 AI 评分环境变量，保守进入人工候选池。",
    };
  }

  if (!score.isGoodNews || score.goodnessScore < 50) {
    return {
      route: "rejected",
      reason: score.rejectReason || "AI 判断不是明确好消息。",
    };
  }

  if (score.specificityScore < 40 || score.evidenceScore < 30 || score.publicValueScore < 40) {
    return {
      route: "rejected",
      reason: score.rejectReason || "具体性、证据或公共价值过低，不进入人工候选池。",
    };
  }

  if (isOlderThanDays(candidate.publishedAt, 45)) {
    return {
      route: "rejected",
      reason: "发布时间过旧，不适合进入每日好消息候选池。",
    };
  }

  if (candidate.sourceTrustLevel === "watch" && (score.evidenceScore < 60 || score.publicValueScore < 70)) {
    return {
      route: "rejected",
      reason: "观察级来源的证据或公共价值不足，直接拒绝。",
    };
  }

  if (
    score.goodnessScore < 70 ||
    score.specificityScore < 60 ||
    score.evidenceScore < 50 ||
    score.publicValueScore < 50 ||
    score.prRiskScore > 50
  ) {
    return {
      route: "candidate",
      reason: "分数未达到高置信发布阈值，进入人工候选池。",
    };
  }

  if (candidate.officialRisk) {
    return {
      route: "candidate",
      reason: "官方风险来源不自动发布，需要交叉验证。",
    };
  }

  if (candidate.sourceTrustLevel === "watch") {
    return {
      route: "candidate",
      reason: "观察级来源不自动发布，需要人工核实。",
    };
  }

  if (process.env.ALLOW_AUTOPUBLISH !== "true") {
    return {
      route: "candidate",
      reason: "PR 模式默认不自动发布，进入人工候选池。",
    };
  }

  return {
    route: "published",
    reason: "达到高置信阈值且显式允许自动发布。",
  };
}

function isOlderThanDays(dateValue: string | undefined, days: number): boolean {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  return Date.now() - date.getTime() > maxAgeMs;
}

function aiResponseSchema() {
  return {
    type: "json_schema",
    json_schema: {
      name: "good_news_score",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: [
          "isGoodNews",
          "goodnessScore",
          "specificityScore",
          "evidenceScore",
          "publicValueScore",
          "prRiskScore",
          "doomContextScore",
          "suggestedRegion",
          "suggestedTopic",
          "summaryZh",
          "whyGoodZh",
          "verificationNoteZh",
          "rejectReason",
        ],
        properties: {
          isGoodNews: { type: "boolean" },
          goodnessScore: { type: "number", minimum: 0, maximum: 100 },
          specificityScore: { type: "number", minimum: 0, maximum: 100 },
          evidenceScore: { type: "number", minimum: 0, maximum: 100 },
          publicValueScore: { type: "number", minimum: 0, maximum: 100 },
          prRiskScore: { type: "number", minimum: 0, maximum: 100 },
          doomContextScore: { type: "number", minimum: 0, maximum: 100 },
          suggestedRegion: { type: "string", enum: ["china", "world"] },
          suggestedTopic: {
            type: "string",
            enum: topicDefinitions.map((topic) => topic.slug),
          },
          summaryZh: { type: "string" },
          whyGoodZh: { type: "string" },
          verificationNoteZh: { type: "string" },
          rejectReason: { type: "string" },
        },
      },
    },
  };
}

function getAiProvider(): AiProviderConfig | undefined {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      name: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    };
  }

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) {
    return {
      name: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    };
  }

  return undefined;
}

function responseFormatForProvider(provider: AiProviderConfig) {
  return provider.name === "deepseek" ? { type: "json_object" } : aiResponseSchema();
}

function allowedTopicPrompt(): string {
  return topicDefinitions.map((topic) => topic.slug).join(", ");
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("AI response did not contain valid JSON.");
  }
}

async function scoreWithAi(candidate: CandidateItem, provider: AiProviderConfig): Promise<AiNewsScore> {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.1,
      max_tokens: Number(process.env.AI_MAX_TOKENS ?? 1200),
      response_format: responseFormatForProvider(provider),
      messages: [
        {
          role: "system",
          content:
            `你是今日好消息的保守新闻筛选员。只收录真实、具体、可核实、有公共价值的好消息。拒绝宣传稿、鸡汤、软文、无法核实的故事、依赖灾难渲染的内容。只输出一个 JSON 对象，字段必须包括 isGoodNews、goodnessScore、specificityScore、evidenceScore、publicValueScore、prRiskScore、doomContextScore、suggestedRegion、suggestedTopic、summaryZh、whyGoodZh、verificationNoteZh、rejectReason。summaryZh、whyGoodZh、verificationNoteZh、rejectReason 必须用中文。suggestedRegion 只能是 "china" 或 "world"，不能输出其他值。suggestedTopic 只能从这些英文 slug 中选择：${allowedTopicPrompt()}。如果不确定 topic，使用 "other"。JSON 示例：{"isGoodNews":true,"goodnessScore":80,"specificityScore":80,"evidenceScore":70,"publicValueScore":70,"prRiskScore":10,"doomContextScore":10,"suggestedRegion":"world","suggestedTopic":"public-improvement","summaryZh":"一句中文摘要","whyGoodZh":"为什么这是好消息","verificationNoteZh":"来源与核实说明","rejectReason":""}`,
        },
        {
          role: "user",
          content: JSON.stringify({
            title: candidate.title,
            url: candidate.url,
            sourceName: candidate.sourceName,
            sourceTrustLevel: candidate.sourceTrustLevel,
            officialRisk: candidate.officialRisk,
            language: candidate.language,
            rawSummary: candidate.rawSummary,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${provider.name} API failed: HTTP ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`${provider.name} API returned no message content.`);
  }

  return parseAiScore(extractJsonObject(content));
}

async function main(): Promise<void> {
  await loadLocalEnv();

  const dateKey = todayKey();
  const scoredPath = resolve(process.cwd(), "data/candidates", `${dateKey}.scored.json`);

  if (process.env.INGEST_REROUTE_ONLY === "true") {
    const existingScored = await readJsonArray<ScoredCandidateItem>(scoredPath);
    const rerouted = existingScored.map((candidate) => {
      const route = routeCandidate(candidate, candidate.aiScore);

      return {
        ...candidate,
        route: route.route,
        routeReason: route.reason,
      };
    });

    await writeFile(scoredPath, `${JSON.stringify(rerouted, null, 2)}\n`, "utf-8");
    console.log(`[score] rerouted ${rerouted.length} scored candidates to ${scoredPath}`);
    return;
  }

  const candidatesPath = resolve(process.cwd(), "data/candidates", `${dateKey}.fetched.json`);
  const allCandidates = await readJsonArray<CandidateItem>(candidatesPath);
  const scoreLimit = Number(process.env.INGEST_SCORE_LIMIT || 0);
  const candidates =
    Number.isInteger(scoreLimit) && scoreLimit > 0 ? allCandidates.slice(0, scoreLimit) : allCandidates;
  const defaultOutputName =
    Number.isInteger(scoreLimit) && scoreLimit > 0 ? `${dateKey}.scored.sample.json` : `${dateKey}.scored.json`;
  const outputPath = resolve(
    process.cwd(),
    "data/candidates",
    process.env.INGEST_SCORE_OUTPUT || defaultOutputName,
  );
  const scoredAt = new Date().toISOString();
  const provider = getAiProvider();
  const scored: ScoredCandidateItem[] = [];

  if (provider) {
    console.log(`[score] using ${provider.name} model ${provider.model}`);
  } else {
    console.log("[score] no AI provider configured; routing all items to manual candidates");
  }

  for (const candidate of candidates) {
    let aiScore: AiNewsScore | undefined;
    let routeError: string | undefined;

    if (provider) {
      try {
        aiScore = await scoreWithAi(candidate, provider);
      } catch (error) {
        routeError = error instanceof Error ? error.message : String(error);
      }
    }

    const route = routeCandidate(candidate, aiScore);
    scored.push({
      ...candidate,
      aiScore,
      route: route.route,
      routeReason: routeError ? `AI 评分失败：${routeError}` : route.reason,
      scoredAt,
    });

    console.log(`[score] ${candidate.id}: ${route.route}`);
  }

  await writeFile(outputPath, `${JSON.stringify(scored, null, 2)}\n`, "utf-8");
  console.log(`[score] wrote ${scored.length} scored candidates to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
