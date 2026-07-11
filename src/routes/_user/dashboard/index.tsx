import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { PushChart } from '@/components/dashboard/push-chart'
import { ChannelBreakdown } from '@/components/dashboard/channel-breakdown'
import { EndpointRanking } from '@/components/dashboard/endpoint-ranking'
import { RecentLogs } from '@/components/dashboard/recent-logs'
import { useStatsOverview, useStatsChart } from '@/hooks/use-stats'

export const Route = createFileRoute('/_user/dashboard/')({
  component: DashboardPage
})

function DashboardPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')
  const { data: stats, isLoading: statsLoading } = useStatsOverview()
  const { data: chartData, isLoading: chartLoading } = useStatsChart(range)

  return (
    <PageContainer title="仪表盘" description="查看推送统计和系统概览">
      <div className="space-y-6">
        <StatsCards stats={stats} isLoading={statsLoading} />

        <PushChart
          trend={chartData?.trend}
          isLoading={chartLoading}
          range={range}
          onRangeChange={setRange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-0">
            <EndpointRanking
              ranking={chartData?.endpointRanking}
              isLoading={chartLoading}
            />
          </div>
          <ChannelBreakdown
            distribution={chartData?.distribution}
            isLoading={chartLoading}
          />
        </div>

        <RecentLogs />
      </div>
    </PageContainer>
  )
}
