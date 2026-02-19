import { createFileRoute } from '@tanstack/react-router'
import { PageContainer } from '@/components/layout/page-container'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { PushChart } from '@/components/dashboard/push-chart'
import { ChannelBreakdown } from '@/components/dashboard/channel-breakdown'
import { RecentLogs } from '@/components/dashboard/recent-logs'
import { useStatsOverview, useStatsChart } from '@/hooks/use-stats'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage
})

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStatsOverview()
  const { data: chartData, isLoading: chartLoading } = useStatsChart('7d')

  return (
    <PageContainer title="仪表盘" description="查看推送统计和系统概览">
      <div className="space-y-6">
        <StatsCards stats={stats} isLoading={statsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PushChart />
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
