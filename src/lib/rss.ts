import type { RSSFeedItem } from "@astrojs/rss";
import { getRegionLabel, getTopicLabel } from "./categories";
import { site } from "./site";
import type { PublishedNewsItem } from "./types";

const defaultSiteUrl = "http://localhost:4321";

export function getSiteUrl(): string {
  const rawUrl = process.env.PUBLIC_SITE_URL?.trim() || defaultSiteUrl;
  return new URL(rawUrl).origin;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toAbsoluteUrl(url: string): string {
  return new URL(url, getSiteUrl()).toString();
}

export function renderRssItemContent(item: PublishedNewsItem): string {
  const originalUrl = toAbsoluteUrl(item.originalUrl);
  const sourceUrl = toAbsoluteUrl(item.sourceUrl);
  const exampleNote = item.isExample
    ? "<p><strong>说明：</strong>这是示例数据，不是真实新闻。</p>"
    : "";

  return [
    exampleNote,
    `<p>${escapeHtml(item.summary)}</p>`,
    `<p><strong>为什么是好消息：</strong>${escapeHtml(item.whyGood)}</p>`,
    `<p><strong>核实说明：</strong>${escapeHtml(item.verificationNote)}</p>`,
    `<p><strong>来源：</strong><a href="${sourceUrl}">${escapeHtml(item.sourceName)}</a>；<a href="${originalUrl}">查看原文</a></p>`,
  ].join("");
}

export function newsToRssItems(items: PublishedNewsItem[]): RSSFeedItem[] {
  return items.map((item) => ({
    title: item.isExample ? `[示例] ${item.title}` : item.title,
    description: item.summary,
    pubDate: new Date(item.publishedAt ?? item.collectedAt),
    link: toAbsoluteUrl(item.originalUrl),
    content: renderRssItemContent(item),
    categories: [getTopicLabel(item.topic), getRegionLabel(item.region)],
    source: {
      title: item.sourceName,
      url: toAbsoluteUrl(item.sourceUrl),
    },
  }));
}

export function getFeedMetadata(topicLabel?: string): {
  title: string;
  description: string;
  siteUrl: string;
} {
  const prefix = topicLabel ? `${topicLabel} - ` : "";

  return {
    title: `${prefix}${site.name}`,
    description: topicLabel
      ? `${site.name}「${topicLabel}」主题 RSS：真实、具体、可核实、普通人能理解的周报条目。`
      : site.description,
    siteUrl: getSiteUrl(),
  };
}
