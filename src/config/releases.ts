export interface Release {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  title: string
  changes: string[]
}

export const releases: Release[] = [
  {
    version: '1.0.0',
    date: '2026-07-11',
    type: 'major',
    title: '迁移到 TanStack Start 模板',
    changes: [
      '以 tanstack-start-template 1.8.2 为基线重铺骨架：vite/tsconfig/drizzle 配置与 60+ shadcn/ui 组件逐字对齐，弃 React Compiler 与 vitest，接入 oxlint + oxfmt',
      '后端 9 个业务域（stats/channels/endpoints/logs/ai-presets/ai-providers/api-keys/telegram/push）从 TanStack API Routes 迁到 Elysia 单体 + requireLogin macro，统一返回契约（成功裸对象、错误 status + {error}）',
      '渠道 schema 7 张业务表迁到模板路径 src/lib/db/schema/*，新增 relations.ts 与 auth userRelations 扩展；drizzle 0007 增量迁移（建 config 表、user/session ADD COLUMN），对生产数据安全',
      '前端 6 个业务路由归入侧边栏布局 _user/，URL 字面量不变；删旧顶部 AppHeader 与 relay auth 路由，复用模板的 _public 登录/注册与 GitHub OAuth',
      '渠道表单弃 react-hook-form，改为与模板 endpoint-form 一致的受控范式（channel-field + form-helpers 嵌套点路径读写）',
      '业务工具函数独立成 src/lib/crypto-tokens.ts（generateEndpointToken/generateApiKey），不污染模板 utils.ts',
      '与 upstream 建立共同祖先（一次性 unrelated histories 合并），此后 git merge upstream 为标准三方合并，可持续享受模板更新',
    ],
  },
  {
    version: '0.9.1',
    date: '2026-07-05',
    type: 'patch',
    title: '端点表单 AI 插入与模板撤销重做',
    changes: [
      '修复端点表单点击「ai()」插入预设时报错 MenuGroupContext is missing：DropdownMenuLabel 未包裹在 DropdownMenuGroup 内，已用 DropdownMenuGroup 包裹预设列表项',
      'AI 预设项长名称改用 truncate 单行截断 + base-ui Tooltip，hover 300ms 显示完整名称，避免撑破菜单宽度',
      '消息模板支持 Ctrl+Z / Ctrl+Y 撤销重做：自管 undo/redo 历史栈，统一写入入口 commitTemplate，不再依赖 deprecated 的 document.execCommand',
    ],
  },
  {
    version: '0.9.0',
    date: '2025-06-13',
    type: 'minor',
    title: '渠道配置架构重构',
    changes: [
      '【Breaking】渠道配置从数据库 20 个扁平列迁移为单一 JSON config 字段，迁移前请备份数据库',
      '【Breaking】移除 @/lib/channels/senders/* 与 nodemailer，发送逻辑拆入 definitions/*.server.ts + senders.server.ts，邮件改用 @upyo/core + @upyo/smtp + @upyo/resend',
      '渠道配置统一为 JSON config 字段，支持任意渠道类型的灵活配置',
      '客户端/服务端代码隔离：含 Node.js 依赖的发送逻辑（飞书/钉钉 crypto、邮件 upyo）拆入 .server.ts，registry 仅导出客户端安全的元数据',
      '各渠道类型配置表单组件化，支持字段校验、密码输入、动态选项',
    ],
  },
]
