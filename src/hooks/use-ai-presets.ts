import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateAiPresetInput,
  UpdateAiPresetInput
} from '@/lib/ai/validation'

export const aiPresetKeys = {
  all: ['ai-presets'] as const,
  list: () => [...aiPresetKeys.all, 'list'] as const,
  detail: (id: string) => [...aiPresetKeys.all, 'detail', id] as const
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || '请求失败')
  return json as T
}

export function useAiPresetList() {
  return useQuery({
    queryKey: aiPresetKeys.list(),
    queryFn: () => fetchJson<any[]>('/api/ai-presets')
  })
}

export function useCreateAiPreset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAiPresetInput) =>
      fetchJson('/api/ai-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiPresetKeys.list() })
    }
  })
}

export function useUpdateAiPreset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiPresetInput }) =>
      fetchJson(`/api/ai-presets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: aiPresetKeys.list() })
      qc.invalidateQueries({ queryKey: aiPresetKeys.detail(id) })
    }
  })
}

export function useDeleteAiPreset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/ai-presets/${id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('删除失败')
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: aiPresetKeys.list() })
    }
  })
}

export function useAiPresetPreview() {
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      fetchJson<{ processedMessage: string; latencyMs: number }>(
        `/api/ai-presets/${id}/preview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        }
      )
  })
}
