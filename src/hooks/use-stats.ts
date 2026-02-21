import { useQuery } from '@tanstack/react-query'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || '请求失败')
  return json.data
}

export const statsKeys = {
  overview: ['stats', 'overview'] as const,
  chart: (range: string) => ['stats', 'chart', range] as const
}

export function useStatsOverview() {
  return useQuery({
    queryKey: statsKeys.overview,
    queryFn: () =>
      fetchJson<{
        totalPushes: number
        successRate: number
        todayPushes: number
        activeEndpoints: number
      }>('/api/stats')
  })
}

export function useStatsChart(range: '7d' | '30d' | '90d' = '7d') {
  return useQuery({
    queryKey: statsKeys.chart(range),
    queryFn: () =>
      fetchJson<{
        trend: Array<{
          date: string
          total: number
          success: number
          failed: number
        }>
        distribution: Array<{ type: string; count: number }>
        endpointRanking: Array<{
          name: string
          total: number
          success: number
          failed: number
        }>
      }>(`/api/stats/chart?range=${range}`)
  })
}
