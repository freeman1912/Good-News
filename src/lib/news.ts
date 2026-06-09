import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { groupNewsByDate, sortByCollectedAtDesc, splitLatest24Hours } from "./dates";
import type { NewsDateGroup, PublishedNewsItem, TopicSlug } from "./types";

const newsDir = resolve(process.cwd(), "data/news");

async function readNewsFile(fileName: string): Promise<PublishedNewsItem[]> {
  const filePath = `${newsDir}/${fileName}`;
  const fileText = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(fileText);

  if (!Array.isArray(parsed)) {
    throw new Error(`${fileName} must contain an array of published news items.`);
  }

  return parsed as PublishedNewsItem[];
}

export async function getAllNews(): Promise<PublishedNewsItem[]> {
  let files: string[] = [];

  try {
    files = await readdir(newsDir);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file));
  const batches = await Promise.all(jsonFiles.map(readNewsFile));

  return sortByCollectedAtDesc(batches.flat());
}

export async function getNewsByTopic(
  topic: TopicSlug,
): Promise<PublishedNewsItem[]> {
  const allNews = await getAllNews();
  return allNews.filter((item) => item.topic === topic);
}

export async function getGroupedNews(
  now: Date = new Date(),
): Promise<NewsDateGroup[]> {
  return groupNewsByDate(await getAllNews(), now);
}

export async function getHomeNewsModel(now: Date = new Date()): Promise<{
  allNews: PublishedNewsItem[];
  latest: PublishedNewsItem[];
  older: PublishedNewsItem[];
  groups: NewsDateGroup[];
}> {
  const allNews = await getAllNews();
  const { latest, older } = splitLatest24Hours(allNews, now);

  return {
    allNews,
    latest,
    older,
    groups: groupNewsByDate(allNews, now),
  };
}
