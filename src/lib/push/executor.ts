import { db } from '@/db'
import { endpoints } from '@/db/schemas/endpoints.schema'
import { channels } from '@/db/schemas/channels.schema'
import { pushLogs } from '@/db/schemas/push-logs.schema'
import { eq } from 'drizzle-orm'
import { sendMessage } from '@/lib/channels/sender'
import { replaceTemplate } from './template'
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

  // 解析消息
  let message: string
  const bodyStr =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body)

  if (ep.messageTemplate) {
    message = replaceTemplate(ep.messageTemplate, req.body, {
      ip: req.ip,
      userAgent: req.userAgent
    })
  } else {
    // 尝试直接使用 body.content 或整个 body
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

  // 创建日志记录（状态 pending）
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
      status: 'pending'
    })
    .returning()

  // 执行发送
  const startTime = Date.now()

  const result = await sendMessage(ch.type as ChannelType, {
    message,
    channel: ch,
    endpoint: ep
  })

  const latencyMs = Date.now() - startTime

  // 更新日志
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
