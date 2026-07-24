import { Elysia, t } from 'elysia'
import { executePush } from '@/lib/push/executor'

interface PushEnvelope {
  payload: unknown
  params?: Record<string, unknown>
}

function parseEnvelope(rawBody: string): PushEnvelope {
  const value = JSON.parse(rawBody) as unknown
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('请求体必须是 JSON 对象')
  }
  if (!Object.hasOwn(value, 'payload')) {
    throw new Error('请求体缺少 payload')
  }

  const envelope = value as Record<string, unknown>
  if (
    envelope.params !== undefined &&
    (!envelope.params || typeof envelope.params !== 'object' || Array.isArray(envelope.params))
  ) {
    throw new Error('params 必须是 JSON 对象')
  }

  return {
    payload: envelope.payload,
    params: (envelope.params as Record<string, unknown> | undefined) ?? {},
  }
}

/** 对外推送入口。渠道凭据来自持久化配置，params 仅覆盖本次发送参数。 */
export const pushRoutes = new Elysia({ name: 'push' }).post(
  '/api/push/:token',
  async ({ request, params, status }) => {
    const rawBody = await request.text()

    let envelope: PushEnvelope
    try {
      envelope = parseEnvelope(rawBody)
    } catch (error) {
      return status(400, {
        error: error instanceof Error ? error.message : '请求体格式错误',
      })
    }

    const result = await executePush({
      token: params.token,
      payload: envelope.payload,
      params: envelope.params ?? {},
      rawBody,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    if (result.results.length > 0) {
      return result
    }

    return status(400, { error: result.message })
  },
  {
    detail: {
      tags: ['推送'],
      summary: '发送推送',
      description: 'payload 用于消息模板，params 按渠道 ID 分组并覆盖对应渠道的默认发送参数。',
    },
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String(),
        results: t.Array(
          t.Object({
            channelId: t.String(),
            channelName: t.String(),
            channelType: t.String(),
            success: t.Boolean(),
            message: t.String(),
            logId: t.String(),
          })
        ),
      }),
      400: t.Object({ error: t.String() }),
    },
  }
)
