import rss from "@astrojs/rss";
import { topicDefinitions } from "@/lib/categories";
import { getFeedMetadata, newsToRssItems } from "@/lib/rss";
import { getWeeklyStoriesByTopic } from "@/lib/weekly";
import type { TopicSlug } from "@/lib/types";

export function getStaticPaths() {
  return topicDefinitions.map((topic) => ({
    params: { slug: topic.slug },
    props: { topic },
  }));
}

export async function GET({ props }: { props: { topic: (typeof topicDefinitions)[number] } }) {
  const topic = props.topic;
  const metadata = getFeedMetadata(topic.label);
  const news = await getWeeklyStoriesByTopic(topic.slug as TopicSlug);

  return rss({
    title: metadata.title,
    description: metadata.description,
    site: metadata.siteUrl,
    items: newsToRssItems(news),
    customData: `<language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
}
