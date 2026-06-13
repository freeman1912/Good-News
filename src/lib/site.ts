export const site = {
  name: "好消息周报",
  codeName: "Good News Weekly",
  title: "好消息周报 - 每周看看世界哪里正在被认真修补",
  description:
    "一个面向中文读者的开源公益好消息周报，收集真实、具体、可验证、普通人能理解的中外好消息，并提供 RSS 订阅。",
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
