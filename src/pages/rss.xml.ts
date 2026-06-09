import rss from "@astrojs/rss";
import { getAllNews } from "@/lib/news";
import { getFeedMetadata, newsToRssItems } from "@/lib/rss";

export async function GET() {
  const metadata = getFeedMetadata();
  const news = await getAllNews();

  return rss({
    title: metadata.title,
    description: metadata.description,
    site: metadata.siteUrl,
    items: newsToRssItems(news),
    customData: `<language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
}
