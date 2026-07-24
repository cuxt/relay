import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

interface ChannelBreakdownProps {
  distribution?: Array<{ type: string; count: number }>
  isLoading: boolean
  isError?: boolean
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const fill = payload[0].payload?.fill
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: fill }}
        />
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-lg font-bold mt-1 tabular-nums">{value}</p>
    </div>
  )
}

export function ChannelBreakdown({
  distribution,
  isLoading,
  isError,
}: ChannelBreakdownProps) {
  const chartData = (distribution || []).map(d => ({
    name: CHANNEL_TYPES[d.type as ChannelType]?.label || d.type,
    value: d.count,
    fill: CHANNEL_TYPES[d.type as ChannelType]?.color || '#6b7280'
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">渠道分布</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-75 w-full rounded-lg" />
        ) : isError ? (
          <div className="flex h-75 items-center justify-center text-sm text-destructive">
            图表加载失败
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-75 text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold tabular-nums">{total}</p>
                  <p className="text-xs text-muted-foreground">总计</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
              {chartData.map(d => (
                <div
                  key={d.name}
                  className="flex items-center gap-2 text-sm min-w-0"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-muted-foreground truncate">
                    {d.name}
                  </span>
                  <span className="ml-auto font-medium tabular-nums shrink-0">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
