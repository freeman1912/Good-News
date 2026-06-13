# Good News · ARCHITECTURE

> 配合 `BRIEF.md`、`iterations/v5-weekly-good-news/PRD.md` 和 `DESIGN.md` 阅读。这份文档描述项目的技术栈、数据策略、抓取筛选流程、部署方式和工程边界。

## 0. Weekly Publishing Mode

The public product is moving to `好消息周报 / Good News Weekly`.
Daily ingestion remains useful as a discovery layer, but public publishing
should happen through reviewed weekly issue data.

Weekly mode:

```text
daily candidate discovery
-> scored candidate/rejected/follow-up files
-> weekly draft for the previous Monday-Sunday window
-> maintainer review
-> data/weekly/YYYY-Www.json
-> Astro builds the homepage, archive, and RSS
```

The weekly issue should not promise a fixed number of stories. Publish only
items that remain concrete, understandable, verifiable, and hopeful after
review.

Science and technology are eligible when their human meaning is clear: patient
benefit, daily-life improvement, disability assistance, environmental repair,
public value, exploration, or a strong human future narrative. Narrow technical
breakthroughs without ordinary-reader meaning should stay in candidates or
follow-up.

## 0.1 Manual Curation Mode

OpenAI is optional. The website, RSS feeds, and manual publishing flow only need
structured data under `data/weekly/` in weekly mode. The legacy daily prototype
still reads `data/news/`.

Manual mode:

```text
fixed source pool
-> fetch daily candidates
-> human or AI reviews selected candidates across a week
-> human writes or edits data/weekly-drafts/YYYY-Www.ai-draft.json
-> pnpm weekly:publish -- --week YYYY-Www --file data/weekly-drafts/YYYY-Www.ai-draft.json
-> data/weekly/YYYY-Www.json
-> Astro builds website and RSS
```

Use OpenAI only as an accelerator for translation, classification, first-pass
rejection, and drafting verification notes. It is not the source of truth and is
not required for the project to publish carefully curated items.

## 0.2 Chinese Lead Discovery Mode

Chinese good-news discovery is not RSS-first. It should use a lead queue because
many useful signals appear in public-interest reports, project pages, and short
videos.

```text
data/sources/china-leads.yaml
-> pnpm ingest:china-leads
-> data/candidates/YYYY-MM-DD.china-leads.json
-> search API / platform search / manual lookup
-> AI extracts claims and verification gaps
-> verified items become weekly draft candidates
```

Short videos are lead-only by default. They must not be published from a repost
alone. The pipeline needs an original URL, date/place, concrete action/result,
and supporting source trail before publication.

## 0.3 Community Lead Submission Mode

Reader submissions are a core discovery path, but they are leads rather than
published news.

```text
/submit web form
-> generated GitHub Issue draft
-> GitHub Issues review queue
-> AI or human extracts facts, evidence gaps, privacy risks, and route
-> verified leads become weekly draft candidates
-> data/weekly/YYYY-Www.json after review
```

The first version stays static-first: the form does not write to a database or
auto-publish. It generates a GitHub Issue with structured Markdown. Later
versions can replace the GitHub backend with Cloudflare Worker + D1/KV without
changing the public editorial boundary.

Review routes:

- `verified`: eligible for a future weekly issue and RSS.
- `basic-trust`: plausible but not independently verified; only suitable for a
  future daily-kindness section with visible labels.
- `needs-evidence`: keep in the queue until more support is found.
- `rejected`: unverifiable, promotional, privacy-risky, or outside scope.

Self-reported good deeds are allowed as leads. They must not be presented as
verified news unless evidence and review support that route.

## 1. 技术栈总览

项目采用“静态内容站 + 定时抓取脚本 + 结构化数据 + RSS 生成”的架构。v5 以后，公开输出以周报为主；每日数据主要服务于候选发现。

- **Framework:** Astro 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + 少量自定义 CSS
- **UI:** Astro 自定义组件为主，不引入完整 UI 组件库
- **Data:** 仓库内结构化 JSON/YAML 数据
- **YAML parser:** `yaml`
- **Feed XML parser:** `fast-xml-parser`
- **RSS:** `@astrojs/rss`
- **Ingestion:** Node.js/TypeScript 脚本，使用 `tsx` 本地运行
- **AI filtering:** OpenAI API 或兼容 LLM provider，使用结构化输出 schema
- **Scheduling:** GitHub Actions 定时任务
- **Deploy:** Cloudflare Pages
- **Analytics:** 首版可选 Plausible 或 Umami；默认不阻塞上线

选择 Astro 的理由：这个项目是内容优先、RSS 优先、交互很轻的聚合站。Astro 默认适合低 JavaScript、静态生成和内容页面，比完整应用框架更贴合首版需求。Cloudflare Pages 适合开源公益项目的免费/低成本静态部署。

## 2. Framework 与样式

### Astro 6

Astro 负责页面路由、静态生成、组件组织和 RSS endpoint。首版不需要 SSR，也不需要用户系统。所有页面都可以从构建时数据生成。

核心页面：

- `src/pages/index.astro`
- `src/pages/rss.astro`
- `src/pages/about.astro`
- `src/pages/archive.astro`
- `src/pages/category/[slug].astro`
- `src/pages/submit.astro`
- `src/pages/rss.xml.ts`
- `src/pages/rss/[slug].xml.ts`

### TypeScript

所有数据 schema、抓取脚本、AI 输出解析、RSS 生成都使用 TypeScript。原因是这个项目长期会处理多来源数据和 AI 输出，类型约束能减少字段缺失、分类拼写错误和 RSS 生成错误。

### Tailwind CSS v4

Tailwind v4 用于快速落地 `DESIGN.md` 里的轻快信息产品视觉。设计 token 从 `DESIGN.md` 转成 CSS theme 后进入项目样式系统。避免复杂 JS 主题配置，优先使用 CSS-first 变量。

组件不追求“组件库感”。新闻条目、标签、RSS 复制块、日期分组、筛选按钮都用本地 Astro 组件实现。

## 3. 数据模型

项目不接数据库。所有已发布内容写入仓库内的结构化数据文件，构建时读取。v5 以后，`data/weekly/` 是公开周报数据；`data/news/` 保留为历史日更原型数据，直到迁移完成。

推荐目录：

```text
data/
  sources/
    sources.yaml
  news/
    2026-06-07.json
    2026-06-08.json
  weekly/
    2026-W24.json
  weekly-drafts/
    2026-W24.ai-draft.json
  candidates/
    2026-06-07.json
  rejected/
    2026-06-07.json
src/
  components/
  layouts/
  lib/
  pages/
  styles/
scripts/
  ingest/
    fetch-feeds.ts
    normalize.ts
    dedupe.ts
    score-candidates.ts
    publish.ts
```

### Source

```ts
interface NewsSource {
  id: string;
  name: string;
  language: "zh" | "en" | "multi";
  regionFocus: "china" | "world" | "mixed";
  type: "rss" | "site" | "search" | "official" | "ngo" | "academic";
  url: string;
  rssUrl?: string;
  topics?: TopicSlug[];
  trustLevel: "high" | "medium" | "watch";
  officialRisk?: boolean;
  notes?: string;
}
```

`sources.yaml` 是长期维护的来源池。来源必须可以被停用、降级或标记风险。官方来源默认 `officialRisk: true`，不能因为来源权威就自动收录，必须看是否有交叉验证和具体公共价值。

### Candidate

```ts
interface CandidateItem {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  publishedAt?: string;
  fetchedAt: string;
  language: "zh" | "en" | "other";
  rawSummary?: string;
  rawContent?: string;
  dedupeKey: string;
}
```

### Published News

```ts
type Region = "china" | "world";

type TopicSlug =
  | "science-health"
  | "environment-animals"
  | "charity-mutual-aid"
  | "public-improvement"
  | "people-kindness"
  | "education-culture"
  | "other";

interface PublishedNewsItem {
  id: string;
  title: string;
  summary: string;
  region: Region;
  topic: TopicSlug;
  sourceName: string;
  sourceUrl: string;
  originalUrl: string;
  publishedAt?: string;
  collectedAt: string;
  whyGood: string;
  verificationNote: string;
  sourceCount: number;
  status: "published";
}
```

首版不使用“好消息指数”。可信程度通过 `verificationNote` 和 `sourceCount` 表达。

## 4. 抓取与筛选流程

整体流程：

```text
固定来源列表
→ RSS/网页/搜索抓取
→ 候选去重
→ AI 结构化评分
→ 规则过滤
→ 每日候选 / 拒绝 / 追踪线索
→ 每周汇总和跨日去重
→ 周报草稿
→ 维护者审核
→ 写入 data/weekly/YYYY-Www.json
→ Astro 构建网页和 RSS
```

### 4.1 来源池

来源分三类：

- **好消息/建设性新闻源：** Good News Network、Positive News、Reasons to be Cheerful、Good Good Good、Positron Today 等。
- **可信主流媒体与专题搜索：** 通过 RSS 或搜索关键词发现科学、医疗、公益、环境、公共改善类内容。
- **一手组织源：** 大学、研究机构、公益组织、国际组织、医院等。官方来源单独标风险。

首版可以先维护 20-40 个来源，后续逐步扩展。每个来源记录语言、地区倾向、主题、可信等级和风险说明。

### 4.2 去重

去重不只按 URL。需要生成 `dedupeKey`：

- 规范化标题
- 规范化 URL
- 来源域名
- 时间窗口
- 可选：标题 embedding 或相似度检测

首版先用标题规范化 + URL 规范化 + 同日相似标题规则。后续再加 embedding 聚类。

### 4.3 AI 筛选

AI 输出必须是结构化 JSON，字段包括：

```ts
interface AiNewsScore {
  isGoodNews: boolean;
  goodnessScore: number;       // 0-100
  specificityScore: number;    // 是否具体
  evidenceScore: number;       // 来源和证据强度
  publicValueScore: number;    // 公共价值
  prRiskScore: number;         // 宣传/软文风险
  doomContextScore: number;    // 是否依赖灾难背景
  suggestedRegion: Region;
  suggestedTopic: TopicSlug;
  summaryZh: string;
  whyGoodZh: string;
  verificationNoteZh: string;
  rejectReason?: string;
}
```

推荐规则：

- `isGoodNews = true`
- `goodnessScore >= 70`
- `specificityScore >= 60`
- `evidenceScore >= 50`
- `prRiskScore <= 40`
- 官方来源或单一来源内容不得自动高置信发布，除非事件具体且能交叉验证。

### 4.4 发布策略

推荐半自动保守策略：

- 日常高置信候选写入 `data/candidates/YYYY-MM-DD.json`，作为周报输入。
- 边界候选同样写入 `data/candidates/YYYY-MM-DD.json`，等待周报复核或追踪。
- 明显不合格写入 `data/rejected/YYYY-MM-DD.json`，保留拒绝原因方便调试来源。
- 通过周报审核的内容写入 `data/weekly/YYYY-Www.json`。

GitHub Actions 可以每天定时运行发现流程，并每周创建 Pull Request 供审核。默认不自动发布。

## 5. RSS 策略

RSS 是核心产品能力，不是附属功能。v5 以后，RSS 文案和发布节奏应按周报表达。

首版输出：

- `/rss.xml` — 全部已发布好消息
- `/rss/science-health.xml`
- `/rss/environment-animals.xml`
- `/rss/charity-mutual-aid.xml`
- `/rss/public-improvement.xml`
- `/rss/people-kindness.xml`
- `/rss/education-culture.xml`
- `/rss/other.xml`

地区不单独做页面，但可以后续增加：

- `/rss/china.xml`
- `/rss/world.xml`

RSS item 内容应包含：

- 标题
- 中文摘要
- 地区和主题
- 为什么是好消息
- 核实说明
- 原文链接
- 收录时间

不要全文搬运原文。RSS 只放中文摘要和必要解释，避免版权风险。

## 6. 第三方服务

### AI Provider

首版使用 OpenAI API 或兼容 provider。原因是筛选结果必须稳定输出结构化字段，方便后续规则处理和审计。

环境变量：

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

如果后续要降低成本，可以将大批量候选处理迁移到 batch 模式，或者使用本地/低成本模型做初筛，高质量模型做终筛。

### GitHub Issue

提交线索页链接到 GitHub Issue 模板。

Issue 模板字段：

- 标题
- 原文链接
- 来源名称
- 为什么你觉得这是好消息
- 是否有其他来源

提交不会自动发布。线索进入人工或脚本复核流程。

### Analytics

首版可选 Plausible 或 Umami，用于观察首页访问、RSS 链接点击、原文链接点击。不开启也不阻塞上线。

环境变量：

- `PUBLIC_ANALYTICS_PROVIDER`
- `PUBLIC_PLAUSIBLE_DOMAIN`

## 7. 部署与定时任务

### Cloudflare Pages

Cloudflare Pages 负责托管静态站点。构建命令：

```text
pnpm build
```

构建输出：

```text
dist
```

Cloudflare Pages 连接 GitHub 仓库后，每次合并到 `main` 自动部署。

### GitHub Actions

推荐工作流：

```text
.github/workflows/ingest.yml
```

触发方式：

- 每天定时运行发现流程
- 每周一晚运行周报草稿流程
- 手动 `workflow_dispatch`

任务：

1. 安装依赖
2. 读取 `data/sources/sources.yaml`
3. 抓取候选
4. 去重
5. AI 结构化评分
6. 写入当天 candidates/rejected/follow-up 数据
7. 每周汇总候选并创建周报草稿 PR

建议 PR 模式，避免自动发布错误内容。

## 8. 环境变量

必需：

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

可选：

- `PUBLIC_SITE_URL`
- `PUBLIC_GITHUB_NEW_ISSUE_URL`
- `PUBLIC_GITHUB_ISSUE_TEMPLATE_URL`
- `PUBLIC_GITHUB_ISSUE_URL`
- `PUBLIC_ANALYTICS_PROVIDER`
- `PUBLIC_PLAUSIBLE_DOMAIN`
- `GITHUB_TOKEN`

不要把 `.env.local` 提交到仓库。

## 9. 代码组织

```text
GoodNews/
  src/
    components/
      NewsEntry.astro
      DateGroup.astro
      FilterBar.astro
      RssLinkBlock.astro
      VerificationNote.astro
    layouts/
      BaseLayout.astro
    lib/
      news.ts
      rss.ts
      categories.ts
      dates.ts
    pages/
      index.astro
      rss.astro
      rss.xml.ts
      rss/
        [slug].xml.ts
      about.astro
      archive.astro
      category/
        [slug].astro
      submit.astro
    styles/
      global.css
      theme.css
  data/
    sources/
      sources.yaml
    news/
    candidates/
    rejected/
  scripts/
    ingest/
      fetch-feeds.ts
      normalize.ts
      dedupe.ts
      score-candidates.ts
      publish.ts
  .github/
    workflows/
      ingest.yml
  BRIEF.md
  DESIGN.md
  ARCHITECTURE.md
  iterations/
    v1-launch/
      PRD.md
      CONTENT.md
```

## 10. 性能、可访问性与安全预算

### 性能

- LCP < 2.5s
- CLS < 0.1
- 初始 JS < 50KB，理想情况下首页几乎不需要客户端 JS
- RSS endpoint 构建稳定，不依赖浏览器运行时
- 图片不是首版核心，不为每条新闻强制配图

### 可访问性

- WCAG AA
- Lighthouse Accessibility >= 95
- 所有链接和按钮键盘可达
- 日期分组使用语义化 heading
- 每条新闻使用 `article`
- 筛选控件有清晰文本标签
- 不依赖颜色区分地区和主题

### 安全

- `.env.local` 不入 git
- AI 输出必须经过 schema 校验
- 外部链接加 `rel="noopener noreferrer"`
- 读者提交线索不自动发布
- GitHub Actions 权限最小化
- 不在 RSS 中注入未经清洗的 HTML

## 11. 已知风险

- 来源池质量决定项目上限，需要长期维护和降级机制。
- AI 容易误判宣传稿、软文、早期研究和灾难背景中的局部好事。
- 全自动发布有误收录风险，首版先用 PR 模式更稳。
- GitHub Issue 对普通读者有门槛，但它能降低首版维护成本。
- RSS 摘要要避免全文搬运，防止版权风险。
- 没有后台意味着维护者需要接受“数据在仓库里管理”的工作流。

## 12. 参考资料

- Astro 官方文档：RSS 可通过 `@astrojs/rss` 生成，支持静态和按需生成。
- Cloudflare Pages 官方文档：Astro 可部署到 Cloudflare Pages，构建输出目录为 `dist`。
- Tailwind CSS 官方博客：v4 使用 CSS-first 配置、Vite 插件和 CSS theme variables。
- OpenAI 官方文档：Structured Outputs 可让模型输出符合 JSON Schema 的结构化结果，适合候选新闻评分和摘要。
