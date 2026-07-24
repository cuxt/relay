import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

interface PushChartProps {
  trend?: Array<{
    date: string
    total: number
    success: number
    failed: number
  }>
  isLoading: boolean
  isError?: boolean
  range: '7d' | '30d' | '90d'
  onRangeChange: (range: '7d' | '30d' | '90d') => void
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const date = new Date(label)
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-semibold ml-auto tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PushChart({
  trend,
  isLoading,
  isError,
  range,
  onRangeChange
}: PushChartProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">推送趋势</CardTitle>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              成功
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              失败
            </div>
          </div>
        </div>
        <CardAction>
          <Tabs
            value={range}
            onValueChange={v => onRangeChange(v as typeof range)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs px-2.5">
                7 天
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2.5">
                30 天
              </TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2.5">
                90 天
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-70 w-full rounded-lg" />
        ) : isError ? (
          <div className="flex h-70 items-center justify-center text-sm text-destructive">
            图表加载失败，请稍后重试
          </div>
        ) : !trend?.length ? (
          <div className="flex items-center justify-center h-70 text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={trend}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="success"
                name="成功"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gradSuccess)"
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="失败"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradFailed)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
