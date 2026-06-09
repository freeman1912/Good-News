import type { Region, TopicSlug } from "./types";

export interface TopicDefinition {
  slug: TopicSlug;
  label: string;
  description: string;
  rssPath: string;
}

export interface RegionDefinition {
  slug: "all" | Region;
  label: string;
}

export const regionDefinitions: RegionDefinition[] = [
  { slug: "all", label: "全部" },
  { slug: "china", label: "中国" },
  { slug: "world", label: "世界" },
];

export const topicDefinitions: TopicDefinition[] = [
  {
    slug: "science-health",
    label: "科学医疗",
    description: "科研进展、医疗突破、公共健康和生命科学中的具体好消息。",
    rssPath: "/rss/science-health.xml",
  },
  {
    slug: "environment-animals",
    label: "环境与动物",
    description: "生态修复、物种保护、环境改善和人与动物相关的好消息。",
    rssPath: "/rss/environment-animals.xml",
  },
  {
    slug: "charity-mutual-aid",
    label: "公益互助",
    description: "公益行动、社区互助、救助项目和善意协作。",
    rssPath: "/rss/charity-mutual-aid.xml",
  },
  {
    slug: "public-improvement",
    label: "公共改善",
    description: "公共服务、基础设施、政策执行和社会问题被改善的消息。",
    rssPath: "/rss/public-improvement.xml",
  },
  {
    slug: "people-kindness",
    label: "人物善举",
    description: "具体个人做出的善意行动、救助和帮助。",
    rssPath: "/rss/people-kindness.xml",
  },
  {
    slug: "education-culture",
    label: "教育文化",
    description: "教育机会、文化项目、知识传播和公共文化生活中的好消息。",
    rssPath: "/rss/education-culture.xml",
  },
  {
    slug: "other",
    label: "其他",
    description: "暂时不适合归入以上主题，但仍符合收录标准的好消息。",
    rssPath: "/rss/other.xml",
  },
];

export const topicBySlug = new Map(
  topicDefinitions.map((topic) => [topic.slug, topic]),
);

export function getTopicLabel(slug: TopicSlug): string {
  return topicBySlug.get(slug)?.label ?? "其他";
}

export function getRegionLabel(region: Region): string {
  return region === "china" ? "中国" : "世界";
}
