import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { aiPresets } from '@/lib/db/schema/ai-presets'
import { channels } from '@/lib/db/schema/channels'
import { endpointChannels, endpoints } from '@/lib/db/schema/endpoints'
import { pushLogs } from '@/lib/db/schema/push-logs'
import { processMessageWithAi } from '@/lib/ai/process'
import { getChannelMeta, type ChannelType } from '@/lib/channels/registry'
import { sendMessage } from '@/lib/channels/sender.server'
import type { AiCallMeta, AiResolver } from './template'
import { evaluate } from './template.server'

interface PushRequest {
  token: string
  payload: unknown
  params: Record<string, unknown>
  rawBody: string
  ip?: string
  userAgent?: string
}

interface DeliveryResult {
  channelId: string
  channelName: string
  channelType: ChannelType
  success: boolean
  message: string
  logId: string
}

interface PushResponse {
  success: boolean
  message: string
  results: DeliveryResult[]
}

function buildAiLogFields(aiMeta: AiCallMeta[]) {
  if (aiMeta.length === 0) {
    return {
      aiPresetId: null,
      aiProcessedMessage: null,
      aiLatencyMs: null,
      aiError: null,
    }
  }

  const errors = aiMeta
    .filter((meta) => meta.error)
    .map((meta) => `${meta.presetKey}: ${meta.error}`)
  return {
    aiPresetId: null,
    aiProcessedMessage: JSON.stringify(aiMeta),
    aiLatencyMs: aiMeta.reduce((sum, meta) => sum + meta.latencyMs, 0),
    aiError: errors.length > 0 ? errors.join('; ') : null,
  }
}

function readChannelParams(params: Record<string, unknown>, channelId: string) {
  const value = params[channelId]
  if (value === undefined) return {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`params.${channelId} 必须是 JSON 对象`)
  }
  return value as Record<string, unknown>
}

export async function executePush(req: PushRequest): Promise<PushResponse> {
  const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.token, req.token))

  if (!endpoint) {
    return { success: false, message: '端点不存在', results: [] }
  }
  if (!endpoint.enabled) {
    return { success: false, message: '端点已禁用', results: [] }
  }

  const boundChannels = await db
    .select({
      id: channels.id,
      name: channels.name,
      type: channels.type,
      enabled: channels.enabled,
      config: channels.config,
    })
    .from(endpointChannels)
    .innerJoin(channels, eq(endpointChannels.channelId, channels.id))
    .where(eq(endpointChannels.endpointId, endpoint.id))
    .orderBy(endpointChannels.createdAt)

  if (boundChannels.length === 0) {
    return { success: false, message: '端点未绑定渠道', results: [] }
  }

  const payloadText =
    typeof req.payload === 'string' ? req.payload : JSON.stringify(req.payload ?? null)
  let message: string
  let aiMeta: AiCallMeta[] = []

  if (endpoint.messageTemplate) {
    const presetCache = new Map<string, string>()
    const aiResolver: AiResolver = async (presetKey, input) => {
      let presetId = presetCache.get(presetKey)
      if (!presetId) {
        const [found] = await db
          .select({ id: aiPresets.id })
          .from(aiPresets)
          .where(and(eq(aiPresets.key, presetKey), eq(aiPresets.userId, endpoint.userId)))
        if (!found) throw new Error(`AI 预设 "${presetKey}" 不存在`)
        presetId = found.id
        presetCache.set(presetKey, presetId)
      }
      const result = await processMessageWithAi(presetId, input)
      if (result.success && result.processedMessage) return result.processedMessage
      throw new Error(result.errorMessage || 'AI 处理失败')
    }

    const resolved = await evaluate(
      endpoint.messageTemplate,
      { payload: req.payload, ip: req.ip, userAgent: req.userAgent },
      aiResolver
    )
    message = resolved.message
    aiMeta = resolved.aiMeta
  } else {
    const payload =
      typeof req.payload === 'object' && req.payload !== null
        ? (req.payload as Record<string, unknown>)
        : null
    message = typeof payload?.content === 'string' ? payload.content : payloadText
  }

  const aiLogFields = buildAiLogFields(aiMeta)
  const results = await Promise.all(
    boundChannels.map(async (channel) => {
      const channelType = channel.type as ChannelType
      const [log] = await db
        .insert(pushLogs)
        .values({
          endpointId: endpoint.id,
          channelId: channel.id,
          userId: endpoint.userId,
          requestBody: req.rawBody,
          requestIp: req.ip || null,
          requestUserAgent: req.userAgent || null,
          resolvedMessage: message,
          status: 'pending',
          ...aiLogFields,
        })
        .returning()

      const fail = async (errorMessage: string, responseStatus = 400) => {
        await db
          .update(pushLogs)
          .set({ status: 'failed', responseStatus, errorMessage })
          .where(eq(pushLogs.id, log.id))
        return {
          channelId: channel.id,
          channelName: channel.name,
          channelType,
          success: false,
          message: errorMessage,
          logId: log.id,
        }
      }

      if (!channel.enabled) return fail('渠道已禁用')

      let requestParams: Record<string, unknown>
      try {
        requestParams = readChannelParams(req.params, channel.id)
      } catch (error) {
        return fail(error instanceof Error ? error.message : '渠道参数格式错误')
      }

      const parsed = getChannelMeta(channelType).requestSchema.safeParse(requestParams)
      if (!parsed.success) {
        return fail(
          parsed.error.issues
            .map(
              (issue) => `params.${channel.id}.${issue.path.join('.') || 'value'}: ${issue.message}`
            )
            .join('; ')
        )
      }

      const startedAt = Date.now()
      const result = await sendMessage(channelType, {
        message,
        config: channel.config,
        params: parsed.data as Record<string, unknown>,
        endpoint,
      })
      const latencyMs = Date.now() - startedAt

      await db
        .update(pushLogs)
        .set({
          status: result.success ? 'success' : 'failed',
          responseBody: result.responseBody || null,
          responseStatus: result.responseStatus || null,
          errorMessage: result.errorMessage || null,
          latencyMs,
        })
        .where(eq(pushLogs.id, log.id))

      return {
        channelId: channel.id,
        channelName: channel.name,
        channelType,
        success: result.success,
        message: result.success ? '推送成功' : result.errorMessage || '推送失败',
        logId: log.id,
      }
    })
  )

  const successCount = results.filter((result) => result.success).length
  return {
    success: successCount === results.length,
    message:
      successCount === results.length
        ? `已成功推送到 ${successCount} 个渠道`
        : `成功 ${successCount} 个，失败 ${results.length - successCount} 个`,
    results,
  }
}
