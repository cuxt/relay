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

- 已确认骨架 files（vite/tsconfig/router/__root/styles）共 ~600 行 diff，**阶段 7 已与 upstream 建立共同祖先（见下），三方合并现可执行**。
- 增量文件因与模板物理隔离，冲突不波及骨架。
- 主要风险：drizzle 迁移序列两边 0000 冲突（模板建 5 表 vs relay 建 4 表），需手动处理的合并迁移——阶段 7 建立祖先时已显式排除 upstream 0000。

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

阶段 0（git 拓扑）✅ → **阶段 1（骨架覆盖）✅** → **阶段 4（schema 迁移）✅** → **阶段 3（后端 Elysia 迁移）✅** → **阶段 5（前端路由归入 _user/ + 侧边栏）✅** → **阶段 6（state/theme/form/工具迁移）✅** → **阶段 7（共同祖先建立）✅** → 阶段 8（全量运行回归，用户已决策暂不做）。

## 阶段 7 完成情况（2026-07-11）

发现关键拓扑事实：阶段 1 是**手动复制模板文件覆盖**而非 `git merge`，故 `upstream/main`（3d6a409，模板 1.8.2）与我们 HEAD **无共同祖先**——`git merge upstream/main` 被拒绝为 unrelated histories。TEMPLATE_SYNC 旧文写的"共享祖先存在、三方合并可行"是假设，非事实。阶段 7 一次性修补该拓扑。

**操作**：`git merge --allow-unrelated-histories upstream/main`（merge commit `9101242`）。落实的全量与 upstream 的重叠分析：
- 284（ours）vs 157（upstream）文件，**150 重名**，其中 **131 个 blob 逐字一致**（骨架在阶段 1 已对齐到 3d6a409）+ **19 个真差异**（全为 relay 有意增量）。
- git 3-way 合并：131 个 SAME 自动并入无冲突；19 个 DIFFER 中能行级自动合并的合并成功，**18 个有行重叠的报 add/add 冲突**（AA）。
- 仲裁：18 个 AA **全部取 ours**（auth.ts 的 GitHub OAuth + userRelations、db schema 业务表导出、`src/server/api.ts` 业务路由挂载、`src/config/menu.tsx`、`src/constants/routes.ts`、`routeTree.gen.ts`、`package.json`、`bun.lock`、`drizzle/meta/{_journal,0000_snapshot}.json`、`_public/{login,register}.tsx`、`.gitignore`、`.oxfmtrc.json`、`README.md`、`.vscode/settings.json`、`favicon.svg`、`.claude/settings.local.json`）。
- 7 个 upstream 独有文件：**接受** `.env.example`、`.github/dependabot.yml`、`.vscode/extensions.json`、`scripts/seed.ts`（不被 build 调用，孤立但无害）；**拒绝** `drizzle/0000_peaceful_sandman.sql`（relay 保留自有 0000_melodic_leo→0007 序列，避免迁覆盖现数据）、`src/routes/_user/dashboard.tsx`（relay 用 `dashboard/index.tsx`，stub 同 `/_user/dashboard/` fullPath 会触发 routeTree 重复）、`.tanstack/tmp/*`（上游临时垃圾）。

**合并零内容变化**：最终 staged 差异仅上述 4 个接受的 upstream-only 文件 +113 行。131 个 SAME 并入无 diff，19 个 ours 增量保留无 diff——纯属拓扑修补。

**验证全绿**：建立祖先后 `bun run typecheck` 0 错误、`bun run build` 通过（drizzle 跑完 relay 0000→0007 无报错，证明 upstream 0000 未漏入干扰）。`git merge-base HEAD upstream/main` 返回 `3d6a409`（建立前退码 1 = 不存在）；`git merge --is-ancestor 3d6a409 HEAD` 成功；再 `git merge upstream/main` 显示 `Already up to date`（正常三方行为，不再被拒）。

**从此** `git fetch upstream && git merge upstream/main` 是标准三方合并，本文件开头"同步流程（重复执行）"的 `git merge upstream/main` 正式可用。未来上游增量在 131 个骨架文件上若双方都改才需手解；relay 增量文件与 upstream 物理隔离，冲突不波及骨架。注意：**未来若 upstream 新增/重写了 `drizzle/0000_*` 或其自身的 dashboard stub，会再现本次排除的两类冲突，需同样取 ours**。

## 阶段 6 完成情况（2026-07-11）

阶段 5 残留的 40 个 tsc 错误全部清零（错误数演进：阶段 1 基线 110 → 阶段 3 完成时 86 → 阶段 5 完成时 40 → **阶段 6 完成时 0**）。

**表单迁移决策——弃 react-hook-form 受控范式**：relay 渠道表单原依赖 `react-hook-form` + 自写 `@/components/ui/form`，模板 ui 无 form.tsx。改为与模板 endpoint-form 一致的受控方案：
- 新增 `src/components/channels/channel-form-fields/channel-field.tsx`：受控 Input + Label + 描述 + 错误，统一接口 `ChannelFieldsProps`（`config/onChange/errors/disabled`）。
- 新增 `src/lib/channels/form-helpers.ts`：`getIn`/`setIn` 按点路径读写嵌套对象 + `flattenZodErrors` 把 zod 问题拍扁为 `{ fieldPath: message }`。
- 各 `{xx}-fields.tsx` 适配受控 props，不再 import `@/components/ui/form`。

**三个具体修复**：
1. `@/components/ui/form` 缺失（TS2307×11 + TS7031 隐式 any×27）→ 上面的受控 channel-field 重构覆盖。
2. `recent-logs.tsx` 的 `Link to="/logs"` 缺 search（TS2741×2）→ 补 `search={{ page: 1 }}`（logs 路由 `validateSearch` 返回 `page` 必填）。
3. `profile-form.tsx` 旧 `useSession`（TS2305）→ 改 `authClient.useSession()`（模板 client 接口）；新增 `_user/profile.tsx` 路由占位并注册进 routeTree。

**废弃清理**：删 `src/integrations/tanstack-query/`（devtools.tsx + root-provider.tsx），grep 确认零引用——`router.tsx` 已用 `@tanstack/react-router-with-query` 的 `routerWithQueryClient` 接管 QueryClient provider 与 devtools，TEMPLATE_SYNC 旧 relay `integrations` 目录的表项随之清结。

**验证全绿**：`bun run typecheck` 0 错误、`bun run lint` 0 错误（3 个良性 warning：`register.tsx` 未用 `SiGithub` 导入；`webhook.ts` + `form-helpers.ts` 空对象 fallback spread）、`bun run build` 通过（`db:migrate` + `vite build`，本地库 0007 已应用）。

**遗留待办（非阻塞）**：channels 域改受控后理论上 `@hookform/*` 可从 `dependencies` 移除，但阶段 6 未强制清——需后续 grep 确认全仓零 `react-hook-form` import 再 `bun remove`，避免误删仍在用的 resolver 引用。

## 阶段 5 完成情况（2026-07-11）

relay 6 个业务前端路由全部从 `src/routes/{channels,dashboard,endpoints,logs,settings}/` 搬到模板侧边栏布局 `_user/` 下，`createFileRoute` 路径已统一改 `/_user/...`，文件经 `@tanstack/router-generator` 重新生成 `routeTree.gen.ts` 注册进 union：

| 旧路径 | 新路径 | URL（不变） |
|---|---|---|
| `routes/channels/{index,new,$id/edit}.tsx` | `routes/_user/channels/...` | `/channels`、`/channels/new`、`/channels/$id/edit` |
| `routes/endpoints/{index,new,$id/edit}.tsx` | `routes/_user/endpoints/...` | `/endpoints`、`/endpoints/new`、`/endpoints/$id/edit` |
| `routes/logs/{index,$id,-search}` | `routes/_user/logs/...` | `/logs`、`/logs/$id` |
| `routes/settings/index.tsx` | `routes/_user/settings/index.tsx` | `/settings` |
| `routes/dashboard/index.tsx` | `routes/_user/dashboard/index.tsx` | `/dashboard` |

`_user` 是 pathless 布局路由（URL 不含 `_user` 前缀），故 `PageContainer` 的 `backTo="/channels"`、`Link to="/channels/new"`、`ROUTES.CHANNELS='/channels'` 等 URL 字面量全部保持有效，无需改动。`_user/route.tsx` 的侧边栏已是模板版（Sidebar + `mainMenuItems` + `filterMenuByRole`），relay 业务菜单项通过 `src/config/menu.tsx` + `src/constants/routes.ts` 已接入。

**`/` 首页冲突处理**：模板 `_public/index.tsx`（Landing 营销页）与 relay `src/routes/index.tsx`（redirect → `/dashboard`）都映射 fullPath `/`，TanStack Router 拒绝同 fullPath 重复。**用户决策：保留模板 Landing**，删 relay 顶层 `index.tsx`。访问 `/` → `_public` Landing，点"控制台"→ `/dashboard` → 未登录被 `_user/route.tsx` 的 `requireSession` redirect 到 `/login`。闭环成立。

**旧布局残留清理**：删除决策 2 弃用的 `src/components/layout/app-header.tsx`（旧顶部 header，grep 确认零引用）+ `src/routes/auth/{login,sign-up}.tsx`（relay 旧 auth 路由，用 `signIn`/`signUp` 函数式 API + framer-motion，只被 app-header 引用）+ `src/components/auth/auth-layout.tsx`（仅被旧 auth 路由用）。模板版 `_public/{login,register}.tsx`（用 `authClient.signIn.email` + GitHub OAuth + 邮箱验证 + session 缓存）已接力。删除后重生成 routeTree，`/auth/login`、`/auth/sign-up` 从 union 消失。

**routeTree 生成方式**：无 `tsr.config.json`，依赖 `@tanstack/router-generator` 默认配置（`routesDirectory=./src/routes`、`generatedRouteTree=./src/routeTree.gen.ts`）。vite 通过 `tanstackStart` 插件在 dev/build 时自动生成；本次阶段因需在未启动 dev 时一次性重生成，编写了临时脚本 `scripts/gen-routes.mjs`（`getConfig({}, root)` + `new Generator({config, root}).run({type:'rerun'})`），生成后即删除（不在仓库留存）。后续可直接 `bun run dev` 让插件持续维护。

**tsc 状态**：`bunx tsc --noEmit` 40 错误，**阶段 5 路由 union 错误为 0**（阶段 1 基线里 `/channels`/`/endpoints`/`/logs`/`/settings` 不在 to union 的大类错误已全部消除）。剩余 40 全部归入阶段 6：

| 错误类型（count） | 根因 | 阶段 6 处理 |
|---|---|---|
| TS2307 @/components/ui/form（11）+ TS7031 field 隐式 any（27） | 模板 ui 无 form.tsx，relay 渠道表单用 TanStack Form 封装 | 补 form 封装或改模板表单方案 |
| TS2741 search 缺失（2） | logs 路由 `validateSearch` 返回 `page` 必填，`recent-logs.tsx` 的 `Link to="/logs"` 未带 search | 改 normalize 返回全可选，或 Link 补 search |
| TS2305 useSession（1） | `profile-form.tsx` 用旧 `useSession`，模板 client 用 `authClient.useSession()` | 改用模板 auth 接口 |

错误数演进：阶段 1 基线 110 → 阶段 3 完成时 86 → **阶段 5 完成时 40**。

## 阶段 3 完成情况（2026-07-11）

9 个业务域全部从 TanStack API Routes（`createFileRoute` + `server.handlers`）迁到模板的 Elysia 单体 + `requireLogin`/`requireAdmin` macro，按计划顺序完成：

| 域 | 新路由文件 | 对外接口 | 鉴权 |
|---|---|---|---|
| stats | `routes/stats.ts` | GET /api/stats, GET /api/stats/chart | requireLogin |
| channels | `routes/channels.ts` | CRUD /api/channels[/:id] | requireLogin |
| endpoints | `routes/endpoints.ts` | CRUD /api/endpoints[/:id] + POST .../regenerate-token | requireLogin |
| logs | `routes/logs.ts` | GET /api/logs（分页+筛选）, GET /api/logs/:id | requireLogin |
| ai-presets | `routes/ai-presets.ts` | CRUD + POST .../preview | requireLogin |
| ai-providers | `routes/ai-providers.ts` | CRUD + GET .../models | requireLogin |
| api-keys | `routes/api-keys.ts` | GET（脱敏）, POST（一次性返回明文）, DELETE | requireLogin |
| telegram | `routes/telegram.ts` | POST /api/telegram/get-updates | requireLogin |
| push | `routes/push.ts` | POST/GET /api/push/:token | **无 requireLogin**（凭 endpoint token，executor 内校验）|
| auth | 模板自带 `routes/auth.ts`（`.mount(auth.handler)`）已覆盖旧 `/api/auth/$` | — | better-auth |

**统一契约**：新路由全部采用 Elysia 惯例——成功返回裸对象、错误返回 `{ error: "字符串" }`（与模板 storage/releases 等一致），弃用旧 `jsonResponse({ data })` / `errorResponse({ error: { code, message } })` 包裹。配套改了 8 个前端 hook 的 `fetchJson`（去 `json.data` / `json.error?.message`）：use-stats/use-channels/use-endpoints/use-push-logs/use-ai-presets/use-ai-providers/use-api-keys，及组件 telegram-fields.tsx、test-push-dialog.tsx。

**保留 `src/routes/api/$.ts`**：TanStack Router 的 `/api/$` catch-all 把所有 `/api/*` 转给 `api.handle(request)`，是 Elysia 路由真正生效的入口，**不能删**（阶段 5 前端路由归入 `_user/` 重生成 routeTree 时再处理）。

**业务工具恢复**：`generateEndpointToken`/`generateApiKey` 在阶段 1 骨架覆盖时随 `utils.ts` 丢了，新建独立增量文件 `src/lib/crypto-tokens.ts`（不污染模板 `utils.ts`，上游同步零冲突）。endpoints/api-keys/push 已用新文件。

**增量业务文件路径修齐**：`lib/push/executor.ts`、`lib/ai/process.ts`、`lib/channels/registry.ts` 的 `@/db` / `@/db/schemas/*.schema` 残留 import 全部改到 `@/lib/db` + `@/lib/db/schema/*`，与所有新路由一致（统一 postgres 驱动的同一 db 实例）。

**骨架增量（上游同步需留意合并）**：`src/lib/auth/auth.ts` 补回 GitHub OAuth socialProviders（relay 旧有、阶段 1 被模板版覆盖丢失），从 `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` 环境变量读取。这是 auth.ts 上已知第二处骨架增量（另一处是 userRelations）。

**删除的旧文件**：整个 `src/routes/api/` 下 9 个业务子目录 + `src/db/`（index.ts + schemas/）+ `src/middleware/`（api-auth.ts + auth.ts）+ `src/lib/api/response.ts`。保留 `src/routes/api/$.ts`。删除前已 grep 确认零残留 import。

**tsc 状态**：`bunx tsc --noEmit` 86 错误，全部属于阶段 5/6 预期（业务路由 `/channels`/`/endpoints`/`/logs` 等不在 routeTree union + `@/components/ui/form` 缺失），后端 Elysia 迁移相关错误为 **0**。错误数从阶段 1 基线 110 降到 86（删旧 createFileRoute 路由后"路径不在 union"错误减少）。

## 阶段 4 完成情况（2026-07-11）

**代码部分已完成**：relay 7 张业务表（channels/endpoints/push-logs/api-keys/ai-providers/ai-presets + 2 enums）从 `src/db/schemas/*.schema.ts` 迁到模板路径 `src/lib/db/schema/*.ts`，import 路径去 `.schema` 后缀，与模板 `auth.ts`+`config.ts` 并存。新增 `relations.ts`（业务表互相关系），扩展 `auth.ts` 的 `userRelations` 加入 6 张业务表 many。

**骨架增量（上游同步需留意合并）**：
- `src/lib/db/schema/auth.ts`：顶部 import 6 个业务表 + `userRelations` 加入业务表 many。
- `src/lib/db/schema/index.ts`：导出 6 个业务文件 + relations。oxfmt 会删中文注释，正式同步时用模板原两行 + relay 增量导出合并。

**验证**：`bun run db:generate` 成功解析全部 11 表，生成增量迁移形态**全部为生产安全操作**（无 DROP、无 ALTER TYPE、无 RENAME）：
```
CREATE TABLE config (; 5 列)
ALTER TABLE session ADD COLUMN impersonated_by  -- text 可空
ALTER TABLE user ADD COLUMN role / banned / ban_reason / ban_expires  -- 全部可空或有默认值
```
已回滚试生成物（0007 sql + journal + snapshot），保持 drizzle 目录于 checkpoint 干净态。

**⚠️ 待连库确认（生产数据，必须人工介入）**：
1. relay 生产库的 drizzle 迁移已执行到哪一条？特别是 **0006（删 channels 扁平列）是否已应用**——若未应用，生产 `channels` 表仍是扁平结构，需先补一条"扁平→config JSON"迁移。
2. 确认后，在干净流程里 `bun run db:generate` 正式生成 0007 增量迁移，连库 `bun run db:migrate` 应用。
3. 应用前建议对生产库做快照/备份（新增列是安全的，但首次跨模板迁移值得一次备份）。

**✅ 本地库验证完成（2026-07-11）**：本地库 `postgresql://postgres:123456@localhost:5432/relay` 确认 channels 已是 JSON 终态（8 列含 config、扁平列已删=0006 已应用），7 张 relay 业务表齐全。生成并应用 `drizzle/0007_bizarre_warbird.sql` 成功：CREATE config 表 + user 加 4 列 + session 加 impersonated_by，全部 ADD，本地数据无破坏。

**生产库提醒**：本地 ≠ 生产。生产应用 0007 前至少备份一次，并先 introspect 确认 channels 已是 JSON 终态。生产若用 db:push（非 migrate）维护，drizzle journal 表（在 `drizzle` schema）可能不存在，需观察。

旧 `src/db/schemas/` 暂留不删，等阶段 3 旧 API 路由连同 `@/db` 引用一起清理。
