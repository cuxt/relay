# Relay

自部署的多渠道消息推送服务。把通知收拢在一个 HTTP API 背后，按端点配置分发到飞书、企微、钉钉、Telegram、Discord、邮件、Bark、Webhook 等多个平台，适合告警、自动化流程和运维通知的统一出口。

## 支持渠道

- 飞书机器人
- 企业微信机器人（Webhook）
- 企业微信应用
- 钉钉机器人
- Telegram
- Discord
- 邮件（SMTP / Resend）
- Bark
- 自定义 Webhook

## 功能

- **统一推送接口** — 一个端点 + token 鉴权，请求体插值进消息模板后分发
- **多渠道分发** — 9 种渠道按需挂载，渠道配置与模板分离
- **模板引擎** — 支持变量插值的消息模板，接入侧无需关心目标平台格式
- **仪表盘** — 推送统计、趋势图表、渠道分布与端点排名
- **推送日志** — 端点/渠道维度过滤，详情页支持 Markdown 渲染与原文切换
- **API Key 管理** — 创建和管理用于程序化访问的密钥
- **多用户与权限** — 内置认证、会话与 GitHub OAuth 登录，支持 user / admin / super 三级权限

## 技术栈

- **运行时**：[Bun](https://bun.sh)
- **框架**：[TanStack Start](https://tanstack.com/start)（React 19 + SSR）
- **路由**：[TanStack Router](https://tanstack.com/router)（基于文件）
- **后端**：[ElysiaJS](https://elysia.dev)
- **数据库**：PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)
- **认证**：[Better Auth](https://www.better-auth.com)
- **邮件**：[Upyo](https://github.com/upyojs/upyo)（SMTP / Resend 传输）
- **样式**：[Tailwind CSS](https://tailwindcss.com) v4 + shadcn/ui
- **动画**：[motion](https://motion.dev)

## 快速开始

### 前置要求

- [Bun](https://bun.sh) >= 1.0
- PostgreSQL

### 安装

```bash
# 安装依赖
bun install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填写数据库连接等配置

# 执行数据库迁移
bun run db:migrate

# 首次部署时初始化超级管理员
bun run db:seed

# 启动开发服务器
bun run dev
```

### 环境变量

| 变量                   | 说明                                                 |
| ---------------------- | ---------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL 连接字符串                                |
| `BETTER_AUTH_SECRET`   | 会话签名密钥                                         |
| `BETTER_AUTH_URL`      | 服务访问地址（OAuth 回调与会话）                     |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID（可选，启用 GitHub 登录） |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret（可选）                      |
| `VITE_SITE_NAME`       | 站点名称，用于 Logo、标题与版权（默认 `Relay`）      |

## 推送接口

通过 HTTP 向端点发送推送通知，请求体字段会插值到端点的消息模板中：

```bash
curl -X POST https://your-domain/api/push/{endpoint-token} \
  -H "Content-Type: application/json" \
  -d '{"title": "告警", "content": "CPU 使用率过高"}'
```

例如模板写 `${body.title}: ${body.content}`，配合上面的请求体，最终生成 `告警: CPU 使用率过高`，再分发到该端点配置的所有渠道。

## 构建与部署

```bash
# 构建生产版本（会先跑数据库迁移）
bun run build

# 预览生产构建
bun run preview

# 生产启动（nitro 输出）
node .output/server/index.mjs
```

## 脚本

| 脚本                  | 说明                     |
| --------------------- | ------------------------ |
| `bun run dev`         | 启动开发服务器           |
| `bun run build`       | 迁移数据库并构建生产版本 |
| `bun run preview`     | 预览生产构建             |
| `bun run typecheck`   | TypeScript 类型检查      |
| `bun run lint`        | oxlint 检查              |
| `bun run db:generate` | 生成 Drizzle 迁移        |
| `bun run db:migrate`  | 执行数据库迁移           |
| `bun run db:push`     | 直接推送 schema 到数据库 |
| `bun run db:seed`     | 初始化或补齐超级管理员   |
