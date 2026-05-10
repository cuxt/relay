export interface Release {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  title: string
  changes: string[]
}

export const releases: Release[] = [
  {
    version: '1.3.1',
    date: '2026-05-10',
    type: 'patch',
    title: '用户头像与界面优化',
    changes: [
      '引入 boring-avatars 生成用户头像（beam 风格）',
      '新增自定义 Avatar 组件（src/components/x/avatar.tsx）',
      '用户菜单、个人资料页显示生成式头像',
      '用户管理页面添加头像列，响应式自适应布局',
      '表格支持 sm/md/lg 断点隐藏/显示列',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-05-10',
    type: 'minor',
    title: '路由系统重构',
    changes: [
      '重构路由目录结构：从 _app/_auth 迁移到 _user/_public 双层架构',
      '新增公开路由：/login 登录页、/register 注册页、/ 公共首页',
      '用户路由优化：/dashboard、/profile、/users、/settings',
      '统一用户区域根路由 _user/route.tsx',
      '优化 Logo/SiteIcon 组件，移除不必要的依赖',
      '删除弃用的 API 路由 (favicon.ts)',
      '新增 vite-env.d.ts 类型定义',
    ],
  },
  {
    version: '1.2.3',
    date: '2026-05-06',
    type: 'patch',
    title: '性能优化',
    changes: [
      '启用 Better Auth Cookie 缓存，减少数据库查询',
      '优化 siteConfig 使用 TanStack Query 缓存',
    ],
  },
  {
    version: '1.2.2',
    date: '2026-05-06',
    type: 'patch',
    title: '优化 Logo 组件',
    changes: [
      'Logo 组件移除对 SidebarProvider 的依赖，可在任意上下文使用',
      '修复 _auth 布局使用 Logo 组件时的 context 错误',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-05-06',
    type: 'patch',
    title: '统一文件命名风格',
    changes: [
      '简化 landing 目录组件命名（HeroSection → hero, FeaturesSection → features）',
      '简化 layout 目录组件命名（AppLogo → logo, ThemeToggle, UserMenu 等）',
      '简化 settings 目录组件命名（CreateUserModal → create-user-modal 等）',
      '统一 hooks 目录命名（useTheme → use-theme, useSidebar → use-sidebar）',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-05-06',
    type: 'minor',
    title: '增强开发与服务端构建能力',
    changes: [
      '集成 TanStack Devtools Vite 插件，提升开发调试体验',
      '集成 Nitro Vite 插件，为服务端运行与构建提供支持',
    ],
  },
  {
    version: '1.1.2',
    date: '2026-05-05',
    type: 'patch',
    title: '修复侧边栏刷新闪烁',
    changes: ['侧边栏展开状态改为服务端读取 Cookie 初始化，避免刷新时先折叠后展开'],
  },
  {
    version: '1.1.1',
    date: '2026-05-02',
    type: 'patch',
    title: '优化侧边栏交互',
    changes: [
      '侧边栏默认折叠状态',
      '折叠时子菜单通过 Popover 弹出',
      '修复系统维护页面 Hydration 警告',
      '解决刷新页面时侧边栏闪烁问题',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-01',
    type: 'minor',
    title: '主题重新设计',
    changes: ['新增暖色调主题（浅色/深色）', '优化边框与阴影样式', '增大圆角尺寸至 0.75rem'],
  },
  {
    version: '1.0.0',
    date: '2026-05-01',
    type: 'major',
    title: '初始版本发布',
    changes: [
      '基于 TanStack Start 构建项目',
      '集成 Better-auth 认证系统',
      '配置 Drizzle ORM 数据库',
      '实现登录、注册页面',
      '完成侧边栏导航布局',
      '集成主题切换功能',
      '集成 sonner 消息通知',
      '集成 Motion 动画库',
      '集成 Recharts 图表库',
      '添加 shadcn/ui 组件库（60+ 组件）',
      '实现用户管理页面',
      '实现系统配置页面',
      '实现更新日志页面',
      '添加 Carousel 轮播组件',
      '添加 Field 输入域组件',
      '添加 Tooltip 提示组件',
      '配置 oxlint 代码检查工具',
      '配置 VSCode 格式化设置',
      '升级所有依赖到最新版本',
    ],
  },
]
