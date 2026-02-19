import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

interface ChannelBreakdownProps {
  distribution?: Array<{ type: string; count: number }>
  isLoading: boolean
}

export function ChannelBreakdown({
  distribution,
  isLoading
}: ChannelBreakdownProps) {
  const chartData = (distribution || []).map(d => ({
    name: CHANNEL_TYPES[d.type as ChannelType]?.label || d.type,
    value: d.count,
    fill: CHANNEL_TYPES[d.type as ChannelType]?.color || '#6b7280'
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">渠道分布</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-75 w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-75 text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
