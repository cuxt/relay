import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateChannelInput, UpdateChannelInput } from '@/lib/channels/validation'

export const channelKeys = {
  all: ['channels'] as const,
  list: () => [...channelKeys.all, 'list'] as const,
  options: (params: { page: number; limit: number; search: string }) =>
    [...channelKeys.all, 'options', params] as const,
  detail: (id: string) => [...channelKeys.all, 'detail', id] as const,
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || '请求失败')
  return json as T
}

export function useChannelList() {
  return useQuery({
    queryKey: channelKeys.list(),
    queryFn: () => fetchJson<any[]>('/api/channels'),
  })
}

export function useChannelOptions(params: { page: number; limit?: number; search?: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 10),
  })
  if (params.search) query.set('search', params.search)

  return useQuery({
    queryKey: channelKeys.options({
      page: params.page,
      limit: params.limit ?? 10,
      search: params.search ?? '',
    }),
    queryFn: () =>
      fetchJson<{
        items: Array<{
          id: string
          name: string
          type: string
          enabled: boolean
        }>
        total: number
        page: number
        limit: number
        totalPages: number
      }>(`/api/channels/options?${query}`),
  })
}

export function useChannelDetail(id: string) {
  return useQuery({
    queryKey: channelKeys.detail(id),
    queryFn: () => fetchJson<any>(`/api/channels/${id}`),
    enabled: !!id,
  })
}

export function useCreateChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChannelInput) =>
      fetchJson('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.list() })
    },
  })
}

export function useUpdateChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChannelInput }) =>
      fetchJson(`/api/channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: channelKeys.list() })
      qc.invalidateQueries({ queryKey: channelKeys.detail(id) })
    },
  })
}

export function useDeleteChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/channels/${id}`, { method: 'DELETE' }).then((res) => {
        if (!res.ok) throw new Error('删除失败')
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelKeys.list() })
    },
  })
}
