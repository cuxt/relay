import { db } from '@/lib/db'
import { aiPresets } from '@/lib/db/schema/ai-presets'
import { aiProviders } from '@/lib/db/schema/ai-providers'
import { eq } from 'drizzle-orm'
import { chatCompletion } from './chat'

interface AiProcessResult {
  success: boolean
  processedMessage?: string
  errorMessage?: string
  latencyMs: number
  presetId: string
}

export async function processMessageWithAi(
  presetId: string,
  message: string
): Promise<AiProcessResult> {
  // 查找预设
  const [preset] = await db
    .select()
    .from(aiPresets)
    .where(eq(aiPresets.id, presetId))

  if (!preset) {
    return {
      success: false,
      errorMessage: 'AI 预设不存在',
      latencyMs: 0,
      presetId
    }
  }

  if (!preset.enabled) {
    return {
      success: false,
      errorMessage: 'AI 预设已禁用',
      latencyMs: 0,
      presetId
    }
  }

  // 查找 provider
  const [provider] = await db
    .select()
    .from(aiProviders)
    .where(eq(aiProviders.id, preset.providerId))

  if (!provider) {
    return {
      success: false,
      errorMessage: 'AI 服务不存在',
      latencyMs: 0,
      presetId
    }
  }

  if (!provider.enabled) {
    return {
      success: false,
      errorMessage: 'AI 服务已禁用',
      latencyMs: 0,
      presetId
    }
  }

  // 调用 AI
  const result = await chatCompletion({
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    model: preset.model,
    systemPrompt: preset.systemPrompt,
    userMessage: message
  })

  return {
    success: result.success,
    processedMessage: result.content,
    errorMessage: result.errorMessage,
    latencyMs: result.latencyMs,
    presetId
  }
}
