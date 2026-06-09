export const site = {
  name: "今日好消息",
  codeName: "Good News",
  title: "今日好消息 - 每天一点真实发生的好消息",
  description:
    "一个面向中文读者的开源公益好消息聚合网站，收集真实、具体、可验证的中外好消息，并提供 RSS 订阅。",
  rssPath: "/rss.xml",
  githubNewIssueUrl:
    import.meta.env.PUBLIC_GITHUB_NEW_ISSUE_URL ||
    import.meta.env.PUBLIC_GITHUB_ISSUE_URL ||
    "https://github.com/freeman1912/Good-News/issues/new",
  githubIssueTemplateUrl:
    import.meta.env.PUBLIC_GITHUB_ISSUE_TEMPLATE_URL ||
    "https://github.com/freeman1912/Good-News/issues/new?template=good-news-lead.yml",
  githubIssueUrl:
    import.meta.env.PUBLIC_GITHUB_ISSUE_URL ||
    "https://github.com/freeman1912/Good-News/issues/new",
};
