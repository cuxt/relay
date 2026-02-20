# Relay

自部署的多渠道消息推送服务。通过统一的 API 将通知发送到多个平台。

## 支持渠道

飞书机器人、企业微信机器人、企业微信应用、钉钉机器人、Telegram、Discord、邮箱 (SMTP/Resend)、Bark、Webhook

## 功能

- **统一推送接口** — 一个端点，多渠道分发
- **模板引擎** — 支持变量插值的消息模板
- **仪表盘** — 推送统计、趋势图表、渠道分布
- **推送日志** — 支持端点/渠道过滤，详情页支持 Markdown 渲染与原文切换
- **API Key 管理** — 创建和管理用于程序化访问的密钥
- **多用户** — 内置认证与会话管理

## 技术栈

- **运行时**: [Bun](https://bun.sh)
- **框架**: [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- **路由**: [TanStack Router](https://tanstack.com/router) (基于文件)
- **数据库**: PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)
- **认证**: [Better Auth](https://www.better-auth.com)
- **样式**: [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- **动画**: [Framer Motion](https://www.framer.com/motion)

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

# 启动开发服务器
bun run dev
```

### 环境变量

| 变量                    | 说明                        |
| ----------------------- | --------------------------- |
| `DATABASE_URL`          | PostgreSQL 连接字符串       |
| `BETTER_AUTH_SECRET`    | 会话签名密钥                |
| `BETTER_AUTH_BASE_URL`  | 服务访问地址                |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID  |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret     |

## 推送接口

通过 HTTP 发送推送通知：

```bash
curl -X POST https://your-domain/api/push/{endpoint-token} \
  -H "Content-Type: application/json" \
  -d '{"key1": "value1", "key2": "value2"}'
```

请求体中的字段会插值到端点的消息模板中。例如模板 `${body.title}: ${body.content}`，配合请求体 `{"title": "告警", "content": "CPU 使用率过高"}`，最终生成 `告警: CPU 使用率过高`。

## 构建生产版本

```bash
bun run build
bun run start
```
