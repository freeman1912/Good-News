import rss from "@astrojs/rss";
import { getFeedMetadata, newsToRssItems } from "@/lib/rss";
import { getAllWeeklyIssues } from "@/lib/weekly";

export async function GET() {
  const metadata = getFeedMetadata();
  const issues = await getAllWeeklyIssues();
  const items = issues.flatMap((issue) => issue.items);

  return rss({
    title: metadata.title,
    description: metadata.description,
    site: metadata.siteUrl,
    items: newsToRssItems(items),
    customData: `<language>zh-CN</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  });
}
