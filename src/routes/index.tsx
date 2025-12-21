import { createFileRoute, redirect } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/auth'
import { authClient } from '@/lib/auth/client'

export const Route = createFileRoute('/')({
  component: HomePage,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href
        }
      })
    }
  },
  server: {
    middleware: [authMiddleware]
  }
})

function HomePage() {
  return (
    <div className="flex flex-col h-full overflow-auto p-6 px-4 w-full">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">欢迎使用 Relay</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          基于 TanStack Start 构建的现代化全栈应用
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        <Card
          title="快速开始"
          description="了解如何构建和部署您的第一个应用"
          href="https://tanstack.com/start"
        />
        <Card
          title="认证系统"
          description="使用 better-auth 实现安全认证"
          href="/auth/login"
        />
        <Card title="数据库" description="通过 Drizzle ORM 管理数据" />
        <Card title="API 路由" description="构建类型安全的 API 端点" />
        <Card title="服务器函数" description="编写安全的服务器端代码" />
        <Card title="SSR 支持" description="完整的服务器端渲染支持" />
      </div>
    </div>
  )
}

function Card({
  title,
  description,
  href
}: {
  title: string
  description: string
  href?: string
}) {
  const content = (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined}>
        {content}
      </a>
    )
  }

  return content
}
