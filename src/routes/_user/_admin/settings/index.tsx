import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Server, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_user/_admin/settings/')({
  component: SystemSettings,
})

function formatUptime(startTime: number): string {
  const diff = Date.now() - startTime
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} 天 ${hours % 24} 小时`
  } else if (hours > 0) {
    return `${hours} 小时 ${minutes % 60} 分钟`
  } else if (minutes > 0) {
    return `${minutes} 分钟 ${seconds % 60} 秒`
  } else {
    return `${seconds} 秒`
  }
}

function formatStartTime(startTime: number): string {
  return new Date(startTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function SystemSettings() {
  const { systemInfo } = Route.useRouteContext()
  const [uptime, setUptime] = useState(formatUptime(systemInfo.startTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(formatUptime(systemInfo.startTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [systemInfo.startTime])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">系统配置</h1>
        <p className="text-sm text-muted-foreground mt-1">查看系统运行状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">系统版本</p>
              <p className="text-xl font-semibold">v{systemInfo.version}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">运行时间</p>
              <p className="text-xl font-semibold" suppressHydrationWarning>{uptime}</p>
              <p className="text-xs text-muted-foreground mt-1">
                启动于 {formatStartTime(systemInfo.startTime)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}