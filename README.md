# 今日好消息 · Good News

一个面向中文读者的开源公益好消息聚合网站，提供网页时间线、RSS 订阅和好消息线索提交。

这个项目想做一件简单但长期有价值的事：让读者每天看到真实、具体、可验证的人和事正在让世界变好。

## 项目边界

今日好消息会坚持：

- 中文读者优先
- 真实、具体、可验证
- 开源公益
- 网页时间线 + RSS
- 建设性新闻取向

今日好消息不会做：

- 官方宣传站
- 口号式正能量栏目
- 鸡汤文
- 无法核实的感人故事
- 软文、营销稿、摆拍流量内容
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

已发布内容位于 `data/news/`。网站会生成：

- 首页时间线：`/`
- RSS 订阅页：`/rss`
- 全部 RSS：`/rss.xml`
- 主题 RSS：`/rss/<topic>.xml`

读者提交的内容是线索，不会自动发布。线索需要经过核实，只有已核实内容才能进入首页时间线和 RSS。

## 提交好消息线索

网站提供普通读者可填写的提交页：

```text
/submit
```

当前版本会把表单内容生成 GitHub Issue 草稿。后续可以升级为 Cloudflare Worker 表单接口，让读者不用 GitHub 账号也能提交。

## 规格文档

项目使用 First Flight 方式规划。主要文档：

- `BRIEF.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `SOURCE_STRATEGY.md`
- `iterations/v1-launch/PRD.md`
- `iterations/v2-content-operations/PRD.md`
- `iterations/v3-community-leads/PRD.md`

## 开源状态

项目目前处于早期建设阶段。欢迎提交好消息线索、可信来源建议、内容审核规则建议和代码改进。
