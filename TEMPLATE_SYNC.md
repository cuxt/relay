# Template Sync Baseline

记录 relay 重构到 `tanstack-start-template` 的基线与同步约定。

## 基线版本

- **模板（upstream）**：`cuxt/tanstack-start-template`，commit `3d6a409`，版本 **1.8.2**
- **relay 仓库**：已添加 `upstream` remote 指向模板，`upstream/main` = 1.8.2
- **重构基线日期**：2026-07-11

## 同步流程（重复执行）

```bash
git fetch upstream
git merge upstream/main   # 在 refactor/template-base 分支上进行
# 仅 src/features/、src/server/routes/{业务}.ts、src/lib/db/schema/{业务}.ts、
#   src/routes/_user/{business}.tsx 等增量文件可能冲突
# 骨架文件应零冲突（逐字对标模板）
```

## 顶层决策

1. 模板克隆 + 业务移植（非原地改造）
2. 改用模板侧边栏布局，弃 relay 顶部 AppHeader
3. 弃 React Compiler、弃 vitest；vite.config/tsconfig 与模板逐字一致
4. 推进粒度：先细化阶段 3 后端迁移

## 结构现实（2026-07-11 探查确认）

relay 与模板**目录结构已分叉**（relay 源自早期 create-ta-stack-app，模板是后来重构）：

| 层 | relay 旧路径 | 模板路径 | 处理 |
|---|---|---|---|
| 入口 | `src/router.tsx`（无 start.ts，靠 tanstackStart() 自动生成） | `src/router.tsx` + `src/start.ts` | 用模板，新增 start.ts |
| DB schema | `src/db/schemas/*.schema.ts` | `src/lib/db/schema/*.ts` | 搬家到模板路径 |
| DB 连接 | `src/db/index.ts`（pg 驱动） | `src/lib/db/index.ts`（postgres 驱动） | 用模板 |
| 认证 | `src/lib/auth/*` | `src/lib/auth/*` | 同路径但内容不同，用模板版本 + 保留 relay 的 GitHub OAuth |
| 中间件 | `src/middleware/{auth,api-auth}.ts` | `server/guards.ts` 的 macro | api-auth.ts 弃用，auth.ts 评估 |
| Query 集成 | `src/integrations/tanstack-query/*` | 直接在 `src/router.tsx` 用 routerWithQueryClient | 用模板，删 integrations |
| API | `src/routes/api/**`（35 文件 server.handlers） | `src/server/routes/*.ts`（Elysia） | 阶段 3 逐域迁 |
| 业务逻辑 | `src/lib/{push,channels,ai}/` | — | 保留路径，作为增量 |
| 业务组件 | `src/components/{channels,endpoints,dashboard,settings,shared,auth}/` | — | 搬到 `src/features/{域}/` |
| 布局 | `src/components/layout/app-header.tsx` + `animated-outlet.tsx` | 模板 `_user/route.tsx` 侧边栏 | 弃 app-header，业务路由归入 _user/ |
| 常量 | 散落 | `src/constants/*` 集中 | 用模板 constants 框架，relay 常量并入 |

## 生产数据约束

relay 已有生产数据 → schema 合并**只能 ADD COLUMN**，不能删列/改类型。
auth 表已确认可安全对齐（见 [[template-schema-safe-merge]]）。
阶段 4 需手写"补齐模板新列 + 建 config 表 + 建 relay 业务表"的合并迁移，避开删除/重建。

## 同步冲突面（预判）

- 已确认骨架 files（vite/tsconfig/router/__root/styles）共 ~600 行 diff，共享祖先存在，三方合并可行。
- 增量文件因与模板物理隔离，冲突不波及骨架。
- 主要风险：drizzle 迁移序列两边 0000 冲突（模板建 5 表 vs relay 建 4 表），需手动处理的合并迁移。

## 阶段 1 完成情况（2026-07-11）

在 `refactor/template-base` 分支完成骨架覆盖。判据达成：骨架逐字对齐模板 1.8.2 + `bun install` 通过（97 包装入、29 旧包移除、0 版本冲突）。中间态 `tsc --noEmit` 110 错误，全部为预期内的业务文件与新骨架并存所致，对应迁移清单如下：

| 错误类型（count） | 根因 | 处理阶段 |
|---|---|---|
| 路由 `to=` 不在 union（如 `/channels`、`/endpoints`、`/logs`、`/settings`） | routeTree.gen.ts 当前是模板版，relay 业务路由未注册 | 阶段 5（业务路由归入 _user/，路由树重生成） |
| `/api/*` 路由 createFileRoute 路径不在 FileRoutesByPath（全部 relay API 文件） | 旧 TanStack API Routes 路由，待迁 Elysia 后删除 | 阶段 3 逐域迁 + 删旧文件 |
| `@/components/ui/form` 找不到（渠道表单） | 模板 ui 无 form.tsx，relay 用 TanStack Form 封装 | 阶段 6（补 form 封装或改用模板表单方案） |
| `@/lib/utils` 缺 generateApiKey / generateEndpointToken | 模板 utils 仅 cn()，relay 业务函数需独立 | 阶段 6（业务工具函数迁到独立文件，不污染模板 utils.ts） |
| `@/lib/auth/client` 缺 signOut / useSession | 模板 client 接口不同（用 authClient + sessionKey） | 阶段 3.9 + 5（组件改用模板 auth 接口） |
| `@/db` 等旧路径 import | relay schema 在 src/db/，待迁到 src/lib/db/schema/ | 阶段 4 |

`lib/auth/auth.ts` 已被模板版覆盖（丢失了 relay 的 GitHub OAuth 配置），阶段 3.9 需补回。

## 阶段推进顺序

阶段 0（git 拓扑）✅ → **阶段 1（骨架覆盖）✅** → 阶段 4（schema 迁移）→ 阶段 3（后端 Elysia 迁移，按 stats→channels→endpoints→logs→ai→api-keys→telegram→push→auth 顺序）→ 阶段 5（前端路由归入 _user/ + 侧边栏）→ 阶段 6（state/theme/form/工具迁移）→ 阶段 7（全量回归 + 上游同步模拟验证）。
