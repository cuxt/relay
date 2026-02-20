import { db } from '@/db'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { aiPresets } from '@/db/schemas/ai-presets.schema'
import { eq, and } from 'drizzle-orm'
import { sendMessage } from '@/lib/channels/sender'
import { parse, hasAiCalls, resolveSync, resolve } from './template'
import type { ResolveContext, AiResolver, AiCallMeta } from './template'
import { processMessageWithAi } from '@/lib/ai/process'
import type { ChannelType } from '@/lib/channels/constants'

interface PushRequest {
  token: string
  body: unknown
  ip?: string
  userAgent?: string
}

interface PushResponse {
  success: boolean
  message: string
  logId?: string
}

function buildAiLogFields(aiMeta: AiCallMeta[]) {
  if (aiMeta.length === 0) {
    return {
      aiPresetId: null,
      aiProcessedMessage: null,
      aiLatencyMs: null,
      aiError: null
    }
  }

  const totalLatency = aiMeta.reduce((sum, m) => sum + m.latencyMs, 0)
  const errors = aiMeta
    .filter(m => m.error)
    .map(m => `${m.presetKey}: ${m.error}`)

  return {
    aiPresetId: null,
    aiProcessedMessage: JSON.stringify(aiMeta),
    aiLatencyMs: totalLatency,
    aiError: errors.length > 0 ? errors.join('; ') : null
  }
}

export async function executePush(req: PushRequest): Promise<PushResponse> {
  // 查找端点
  const [ep] = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.token, req.token))

  if (!ep) {
    return { success: false, message: '端点不存在' }
  }

  if (!ep.enabled) {
    return { success: false, message: '端点已禁用' }
  }

  // 查找渠道
  const [ch] = await db
    .select()
    .from(channels)
    .where(eq(channels.id, ep.channelId))

  if (!ch) {
    return { success: false, message: '渠道不存在' }
  }

  if (!ch.enabled) {
    return { success: false, message: '渠道已禁用' }
  }

  // 构建消息
  const bodyStr =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body)

  const ctx: ResolveContext = {
    body: req.body,
    ip: req.ip,
    userAgent: req.userAgent
  }

  let message: string
  let aiMeta: AiCallMeta[] = []

  if (ep.messageTemplate) {
    const nodes = parse(ep.messageTemplate)

    if (hasAiCalls(nodes)) {
      // 构建 aiResolver
      const presetCache = new Map<string, string>()
      const aiResolver: AiResolver = async (presetKey, input) => {
        let presetId = presetCache.get(presetKey)
        if (!presetId) {
          const [found] = await db
            .select({ id: aiPresets.id })
            .from(aiPresets)
            .where(
              and(eq(aiPresets.key, presetKey), eq(aiPresets.userId, ep.userId))
            )
          if (!found) throw new Error(`AI 预设 "${presetKey}" 不存在`)
          presetId = found.id
          presetCache.set(presetKey, presetId)
        }
        const result = await processMessageWithAi(presetId, input)
        if (result.success && result.processedMessage)
          return result.processedMessage
        throw new Error(result.errorMessage || 'AI 处理失败')
      }

      const resolved = await resolve(nodes, ctx, aiResolver)
      message = resolved.message
      aiMeta = resolved.aiMeta
    } else {
      message = resolveSync(nodes, ctx)
    }
  } else {
    // 无模板：用 body.content 或整个 body
    const bodyObj =
      typeof req.body === 'object' && req.body !== null
        ? (req.body as Record<string, unknown>)
        : null
    if (bodyObj?.content && typeof bodyObj.content === 'string') {
      message = bodyObj.content
    } else {
      message = bodyStr
    }
  }

  // 日志 + 发送 + 更新
  const aiLogFields = buildAiLogFields(aiMeta)
  const [log] = await db
    .insert(pushLogs)
    .values({
      endpointId: ep.id,
      channelId: ch.id,
      userId: ep.userId,
      requestBody: bodyStr,
      requestIp: req.ip || null,
      requestUserAgent: req.userAgent || null,
      resolvedMessage: message,
      status: 'pending',
      ...aiLogFields
    })
    .returning()

  const startTime = Date.now()
  const result = await sendMessage(ch.type as ChannelType, {
    message,
    channel: ch,
    endpoint: ep
  })
  const latencyMs = Date.now() - startTime

  await db
    .update(pushLogs)
    .set({
      status: result.success ? 'success' : 'failed',
      responseBody: result.responseBody || null,
      responseStatus: result.responseStatus || null,
      errorMessage: result.errorMessage || null,
      latencyMs
    })
    .where(eq(pushLogs.id, log.id))

  return {
    success: result.success,
    message: result.success ? '推送成功' : result.errorMessage || '推送失败',
    logId: log.id
  }
}
