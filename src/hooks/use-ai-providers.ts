import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateAiProviderInput,
  UpdateAiProviderInput
} from '@/lib/ai/validation'

export const aiProviderKeys = {
  all: ['ai-providers'] as const,
  list: () => [...aiProviderKeys.all, 'list'] as const,
  detail: (id: string) => [...aiProviderKeys.all, 'detail', id] as const,
  models: (id: string) => [...aiProviderKeys.all, 'models', id] as const
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || '请求失败')
  return json as T
}

export function useAiProviderList() {
  return useQuery({
    queryKey: aiProviderKeys.list(),
    queryFn: () => fetchJson<any[]>('/api/ai-providers')
  })
}

export function useCreateAiProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAiProviderInput) =>
      fetchJson('/api/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiProviderKeys.list() })
    }
  })
}

export function useUpdateAiProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiProviderInput }) =>
      fetchJson(`/api/ai-providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: aiProviderKeys.list() })
      qc.invalidateQueries({ queryKey: aiProviderKeys.detail(id) })
    }
  })
}

export function useAiProviderModels(providerId: string) {
  return useQuery({
    queryKey: aiProviderKeys.models(providerId),
    queryFn: () =>
      fetchJson<string[]>(`/api/ai-providers/${providerId}/models`),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
    retry: false
  })
}

export function useDeleteAiProvider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ai-providers/${id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('删除失败')
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiProviderKeys.list() })
    }
  })
}
