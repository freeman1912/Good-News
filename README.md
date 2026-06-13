# 好消息周报 · Good News Weekly

一个面向中文读者的开源公益好消息周报，提供每周精选、RSS 订阅和好消息线索提交。

这个项目想做一件简单但长期有价值的事：每周从嘈杂的信息里筛出真实、具体、可验证、普通人能理解的好事，让读者看到还有人在解决问题，世界仍然有希望。

## 项目边界

好消息周报会坚持：

- 中文读者优先
- 真实、具体、可验证
- 开源公益
- 每周精选 + RSS
- 建设性新闻取向
- 普通人能理解
- 科学技术要讲出人的意义

好消息周报不会做：

- 官方宣传站
- 口号式正能量栏目
- 鸡汤文
- 无法核实的感人故事
- 软文、营销稿、摆拍流量内容
- 科研快讯搬运站
- 评论争论社区

## 本地运行

```bash
npx pnpm install
npx pnpm dev
```

构建与检查：

```bash
npx pnpm typecheck
npx pnpm build
```

## 内容与 RSS

当前版本仍保留历史日更数据在 `data/news/`。v5 起，公开产品会迁移到每周发布，计划新增 `data/weekly/` 作为周报发布数据。网站会生成：

- 首页最新周报：`/`
- RSS 订阅页：`/rss`
- 全部 RSS：`/rss.xml`
- 主题 RSS：`/rss/<topic>.xml`

读者提交的内容是线索，不会自动发布。线索需要经过核实，只有已核实内容才能进入周报和 RSS。

## 提交好消息线索

网站提供普通读者可填写的提交页：

```text
/submit
```

当前版本会把表单内容生成 GitHub Issue 草稿。后续可以升级为 Cloudflare Worker 表单接口，让读者不用 GitHub 账号也能提交。视频、短视频或社交平台内容可以作为线索，但不会自动发布，需要确认原始来源、时间地点、具体行动、受益者、结果和隐私风险。

## 规格文档

项目使用 First Flight 方式规划。主要文档：

- `BRIEF.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `SOURCE_STRATEGY.md`
- `iterations/v1-launch/PRD.md`
- `iterations/v2-content-operations/PRD.md`
- `iterations/v3-community-leads/PRD.md`
- `iterations/v5-weekly-good-news/PRD.md`

## 开源状态

项目目前处于早期建设阶段，正在从日报转为周报。欢迎提交好消息线索、可信来源建议、内容审核规则建议和代码改进。
