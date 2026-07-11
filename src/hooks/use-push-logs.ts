import { useQuery } from '@tanstack/react-query'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || '请求失败')
  return json as T
}

export const logKeys = {
  all: ['logs'] as const,
  list: (params: Record<string, string>) =>
    [...logKeys.all, 'list', params] as const,
  detail: (id: string) => [...logKeys.all, 'detail', id] as const
}

export function usePushLogs(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
  channelType?: string
  endpointId?: string
  startDate?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.status) searchParams.set('status', params.status)
  if (params.search) searchParams.set('search', params.search)
  if (params.channelType) searchParams.set('channelType', params.channelType)
  if (params.endpointId) searchParams.set('endpointId', params.endpointId)
  if (params.startDate) searchParams.set('startDate', params.startDate)

  const qs = searchParams.toString()

  return useQuery({
    queryKey: logKeys.list(Object.fromEntries(searchParams)),
    queryFn: () =>
      fetchJson<{
        items: any[]
        total: number
        page: number
        limit: number
        totalPages: number
      }>(`/api/logs${qs ? `?${qs}` : ''}`)
  })
}

export function usePushLogDetail(id: string) {
  return useQuery({
    queryKey: logKeys.detail(id),
    queryFn: () => fetchJson<any>(`/api/logs/${id}`),
    enabled: !!id
  })
}
