import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";

interface ChinaLeadConfig {
  version: number;
  leadGroups: LeadGroup[];
  verificationRules: {
    acceptSignals: string[];
    holdSignals: string[];
    rejectSignals: string[];
  };
}

interface LeadGroup {
  id: string;
  label: string;
  priority: "high" | "medium" | "watch";
  sourceRole: "evidence" | "discovery" | "lead-only";
  sources?: Array<{
    id: string;
    name: string;
    url: string;
    queryHints?: string[];
  }>;
  platforms?: string[];
  queryHints?: string[];
  negativeHints?: string[];
}

interface ChinaLeadTask {
  id: string;
  groupId: string;
  groupLabel: string;
  priority: LeadGroup["priority"];
  sourceRole: LeadGroup["sourceRole"];
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string;
  platform?: string;
  query: string;
  negativeHints: string[];
  verification: ChinaLeadConfig["verificationRules"];
  generatedAt: string;
}

function todayKey(): string {
  return process.env.INGEST_DATE || new Date().toISOString().slice(0, 10);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main(): Promise<void> {
  const dateKey = todayKey();
  const configPath = resolve(process.cwd(), "data/sources/china-leads.yaml");
  const outputDir = resolve(process.cwd(), "data/candidates");
  const outputPath = resolve(outputDir, `${dateKey}.china-leads.json`);
  const config = parse(await readFile(configPath, "utf-8")) as ChinaLeadConfig;
  const generatedAt = new Date().toISOString();
  const tasks: ChinaLeadTask[] = [];

  for (const group of config.leadGroups) {
    const negativeHints = group.negativeHints ?? [];

    for (const source of group.sources ?? []) {
      for (const query of source.queryHints ?? []) {
        tasks.push({
          id: slug(`${group.id}-${source.id}-${query}`),
          groupId: group.id,
          groupLabel: group.label,
          priority: group.priority,
          sourceRole: group.sourceRole,
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: source.url,
          query,
          negativeHints,
          verification: config.verificationRules,
          generatedAt,
        });
      }
    }

    for (const platform of group.platforms ?? []) {
      for (const query of group.queryHints ?? []) {
        tasks.push({
          id: slug(`${group.id}-${platform}-${query}`),
          groupId: group.id,
          groupLabel: group.label,
          priority: group.priority,
          sourceRole: group.sourceRole,
          platform,
          query: `${platform} ${query}`,
          negativeHints,
          verification: config.verificationRules,
          generatedAt,
        });
      }
    }
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(tasks, null, 2)}\n`, "utf-8");
  console.log(`[china-leads] wrote ${tasks.length} search tasks to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

