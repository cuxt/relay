import { createFileRoute } from '@tanstack/react-router'
import { siteConfig } from '@/config/site'

export const Route = createFileRoute('/_user/dashboard')({
  component: DashboardPage,
})

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function DashboardPage() {
  const { user } = Route.useRouteContext()
  const greeting = getGreeting()

  return (
    <section className="max-w-2xl border-b border-border pb-8">
      <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
      <h1 className="mt-4 text-3xl font-semibold">
        {greeting}，{user.name}
      </h1>
      <p className="mt-4 leading-7 text-muted-foreground">
        这里是你的工作台。没有额外背景，没有多余卡片，只留下接下来要做的事。
      </p>
    </section>
  )
}
