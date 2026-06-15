# TanStack Start Template

基于 TanStack Start 的全栈应用起步模板，集成认证、数据库、UI 组件库等开箱即用的能力。

## 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 框架 | TanStack Start (React 19, SSR) | 全栈 React 框架 |
| 构建 | Vite 8 | 开发服务器与构建工具 |
| 包管理 | Bun | 高性能 JavaScript 运行时与包管理器 |
| UI | shadcn/ui (Base UI + Tailwind CSS v4) | 组件库，style: base-vega |
| 图标 | lucide-react | 图标库 |
| 图表 | Recharts | 数据可视化 |
| 通知 | sonner | Toast 消息通知 |
| 认证 | Better Auth | 邮箱密码登录、邮箱验证、管理员插件 |
| 数据库 | Drizzle ORM + PostgreSQL | 类型安全的 ORM |
| 邮件 | Resend | 邮箱验证、密码重置等邮件发送 |
| 动画 | Motion (motion/react) | 声明式动画 |
| 状态 | Zustand | 轻量状态管理 |
| 样式 | Tailwind CSS v4 | CSS 变量主题系统 |
| 校验 | Zod | 数据校验 |
| Lint | oxlint + oxfmt | 代码检查与格式化 |

## 功能

- 认证系统 — 邮箱注册/登录、邮箱验证、会话管理、管理员冒充登录
- 角色权限 — user / admin 角色区分，路由级中间件保护
- 侧边栏布局 — 可折叠侧边栏，支持 inset / icon / offcanvas 模式
- 主题切换 — 浅色/深色/跟随系统，CSS 变量驱动，View Transition 动画
- 用户管理 — 管理员可创建/编辑/封禁/删除用户、查看会话、重置密码、冒充登录
- 系统配置 — 运行时系统信息展示
- 更新日志 — 版本发布记录页面（支持 GitHub Releases API 代理）
- 60+ UI 组件 — shadcn/ui 全套组件
- SSR — TanStack Start 服务端渲染
- 响应式 — 移动端适配

## 项目结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui 组件（60+）
│   ├── x/               # 业务封装组件（Avatar、Input、Logo）
│   ├── landing/          # 首页组件（Hero、Features）
│   ├── layout/          # 布局组件（UserMenu、ThemeToggle）
│   └── settings/        # 设置页组件（用户 CRUD 弹窗）
├── config/
│   ├── site.ts          # 站点品牌配置（名称、描述）
│   ├── menu.tsx         # 侧边栏菜单配置
│   └── releases.ts      # 版本更新记录
├── hooks/
│   ├── use-theme.tsx    # 主题 Hook + ThemeProvider
│   ├── use-sidebar.ts   # 侧边栏 Hook
│   └── use-mobile.ts    # 移动端检测 Hook
├── lib/
│   ├── auth/            # Better Auth 配置（服务端 + 客户端 + 会话）
│   ├── db/              # Drizzle ORM 数据库（连接 + Schema）
│   ├── site-config/     # 站点配置查询
│   ├── releases/        # 更新日志查询
│   ├── utils.ts         # cn() 工具函数
│   └── query-keys.ts    # TanStack Query key 定义
├── middleware/
│   ├── auth.ts          # 认证中间件
│   └── admin.ts         # 管理员中间件
├── routes/
│   ├── __root.tsx       # 根布局（ThemeProvider、QueryClient、Toaster）
│   ├── _public/         # 公开路由
│   │   ├── index.tsx    # 首页（Landing Page）
│   │   ├── login.tsx    # 登录
│   │   ├── register.tsx # 注册
│   │   └── release.tsx  # 更新日志
│   ├── _user/           # 需登录路由
│   │   ├── route.tsx    # 用户布局（侧边栏）
│   │   ├── dashboard.tsx# 概述页
│   │   └── profile.tsx  # 个人设置
│   ├── _user/_admin/    # 管理员路由
│   │   ├── route.tsx    # 管理员布局
│   │   ├── users.tsx    # 用户管理
│   │   └── settings/    # 系统配置
│   └── api/             # API 路由
├── stores/
│   ├── themeStore.ts    # 主题状态
│   ├── sidebarStore.ts  # 侧边栏状态
│   └── mobileStore.ts   # 移动端状态
├── styles.css           # 全局样式与 CSS 变量主题
└── router.tsx           # 路由配置（QueryClient、预加载策略）
```

## 快速开始

### 环境要求

- Bun >= 1.3
- PostgreSQL

### 安装

```bash
# 克隆项目
git clone <repo-url>
cd tanstack-start-template

# 安装依赖
bun install
```

### 环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | Auth 加密密钥 | 随机字符串 |
| `BETTER_AUTH_URL` | 应用 URL | `http://localhost:3000` |
| `RESEND_API_KEY` | Resend 邮件 API Key | `re_xxxx` |
| `EMAIL_FROM` | 发件人地址 | `noreply@example.com` |
| `VITE_SITE_NAME` | 站点名称 | `My App` |
| `GITHUB_TOKEN` | GitHub API Token（可选） | `ghp_xxxx` |
| `GITHUB_REPO` | GitHub 仓库（可选，用于 Releases） | `owner/repo` |

### 数据库

```bash
# 推送 Schema 到数据库
bun run db:push

# 初始化种子数据（创建管理员账户）
bun run db:seed
```

种子脚本会在数据库中不存在管理员时创建管理员账户：

- 邮箱：`admin@example.com`
- 密码：`12345678`

> 请在生产环境中立即修改默认密码。

### 开发

```bash
bun run dev
```

访问 http://localhost:3000

### 构建

```bash
# 构建前自动执行 db:migrate，构建后自动执行 db:seed
bun run build

# 预览构建结果
bun run preview
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 构建生产版本 |
| `bun run preview` | 预览构建结果 |
| `bun run typecheck` | TypeScript 类型检查 |
| `bun run lint` | oxlint 代码检查 |
| `bun run lint:fix` | oxlint 自动修复 |
| `bun run format` | oxfmt 格式化 |
| `bun run format:check` | oxfmt 格式检查 |
| `bun run db:generate` | 生成 Drizzle 迁移文件 |
| `bun run db:migrate` | 执行数据库迁移 |
| `bun run db:push` | 推送 Schema 到数据库 |
| `bun run db:seed` | 运行种子脚本 |

## 路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/release` | 更新日志 | 公开 |
| `/dashboard` | 概述 | 登录用户 |
| `/profile` | 个人设置 | 登录用户 |
| `/users` | 用户管理 | 管理员 |
| `/settings` | 系统配置 | 管理员 |

## 数据库 Schema

### user

| 字段 | 类型 | 说明 |
|------|------|------|
| id | text (PK) | 用户 ID |
| name | text | 用户名 |
| email | text (unique) | 邮箱 |
| emailVerified | boolean | 邮箱是否验证 |
| image | text | 头像 URL |
| role | text | 角色（admin / user） |
| banned | boolean | 是否封禁 |
| banReason | text | 封禁原因 |
| banExpires | timestamp | 封禁到期时间 |

### session / account / verification

Better Auth 标准表，支持 Cookie 缓存（5 分钟）以减少数据库查询。

### config

站点配置键值对表（软删除），用于存储站点级动态配置。

## 主题系统

使用 CSS 变量实现主题，定义在 `src/styles.css` 中：

- 浅色/深色两套变量自动切换
- `--primary`（默认暖棕 `#b05d2e`）等设计 Token
- 主题状态通过 Zustand 管理，持久化到 `localStorage`
- 支持跟随系统偏好自动切换
- 切换时使用 View Transition API 实现圆形扩散动画

## 认证架构

```
请求 → auth 中间件 → 验证 Session → 注入 user/session 到路由上下文
                                          ↓
                               admin 中间件 → 检查 user.role === 'admin'
```

- **服务端**：`src/lib/auth/auth.ts` — Better Auth 配置（邮箱登录、邮箱验证、管理员插件）
- **客户端**：`src/lib/auth/client.ts` — Auth Client（支持 adminClient 插件）
- **会话**：`src/lib/auth/session.ts` — 服务端函数获取当前会话
- **中间件**：`src/middleware/auth.ts`（认证）、`src/middleware/admin.ts`（管理员）

## 添加 shadcn/ui 组件

```bash
bunx shadcn add <component-name>
```

当前已安装 60+ 组件，详见 `src/components/ui/`。

> 注意：Base UI 使用 `render` prop 替代 `asChild`，使用 Trigger/Button 等组件时需注意。

## License

MIT
