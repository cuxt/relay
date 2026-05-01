export interface Release {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  title: string
  changes: string[]
}

export const releases: Release[] = [
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
