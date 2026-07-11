import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateEndpointInput,
  UpdateEndpointInput
} from '@/lib/endpoints/validation'

export const endpointKeys = {
  all: ['endpoints'] as const,
  list: () => [...endpointKeys.all, 'list'] as const,
  detail: (id: string) => [...endpointKeys.all, 'detail', id] as const
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || '请求失败')
  return json as T
}

export function useEndpointList() {
  return useQuery({
    queryKey: endpointKeys.list(),
    queryFn: () => fetchJson<any[]>('/api/endpoints')
  })
}

export function useEndpointDetail(id: string) {
  return useQuery({
    queryKey: endpointKeys.detail(id),
    queryFn: () => fetchJson<any>(`/api/endpoints/${id}`),
    enabled: !!id
  })
}

export function useCreateEndpoint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEndpointInput) =>
      fetchJson('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: endpointKeys.list() })
    }
  })
}

export function useUpdateEndpoint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEndpointInput }) =>
      fetchJson(`/api/endpoints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: endpointKeys.list() })
      qc.invalidateQueries({ queryKey: endpointKeys.detail(id) })
    }
  })
}

export function useDeleteEndpoint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/endpoints/${id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('删除失败')
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: endpointKeys.list() })
    }
  })
}

export function useRegenerateToken() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ token: string }>(`/api/endpoints/${id}/regenerate-token`, {
        method: 'POST'
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: endpointKeys.list() })
    }
  })
}
