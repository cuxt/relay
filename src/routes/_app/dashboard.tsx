import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage
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
    <Card>
      <CardContent className="p-7">
        <h3 className="text-xl font-bold">
          {greeting}，{user.name}
        </h3>
        <p className="text-muted-foreground mt-2 text-[15px]">
          欢迎使用 Tanstack Start Template
        </p>
      </CardContent>
    </Card>
  )
}
