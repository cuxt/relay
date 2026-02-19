import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useStatsChart } from '@/hooks/use-stats'

export function PushChart() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')
  const { data, isLoading } = useStatsChart(range)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">推送趋势</CardTitle>
        <Tabs value={range} onValueChange={v => setRange(v as typeof range)}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2.5">
              7天
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2.5">
              30天
            </TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2.5">
              90天
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-75 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tickFormatter={v => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="success"
                name="成功"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="failed"
                name="失败"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
