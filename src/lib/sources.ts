import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { NewsSource } from "./types";

const sourcesPath = resolve(process.cwd(), "data/sources/sources.yaml");

export async function getSources(): Promise<NewsSource[]> {
  const sourceText = await readFile(sourcesPath, "utf-8");
  const parsed = parse(sourceText);

  if (!Array.isArray(parsed)) {
    throw new Error("data/sources/sources.yaml must contain a source array.");
  }

  return parsed as NewsSource[];
}
