import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'
import { webhookParamsSchema, type WebhookParams } from '../request-params'

export const webhookConfigSchema = z.object({
  webhook: z.url('请输入有效的 URL 地址'),
  method: z.enum(['GET', 'POST']).default('POST'),
  headers: z.record(z.string(), z.string()).optional(),
})

export type WebhookConfig = z.infer<typeof webhookConfigSchema>

export const webhookConfigFields = [
  {
    key: 'webhook',
    label: 'URL',
    placeholder: 'https://...',
    type: 'url' as const,
    required: true,
    description: '目标服务的 URL 地址',
  },
  {
    key: 'method',
    label: '请求方法',
    placeholder: 'POST',
    type: 'select' as const,
    defaultValue: 'POST',
    description: '默认 POST，支持 GET/POST',
    options: [
      { value: 'POST', label: 'POST' },
      { value: 'GET', label: 'GET' },
    ],
  },
  {
    key: 'headers',
    label: '自定义 Headers',
    placeholder: '{"Authorization": "Bearer ..."}',
    description: '自定义请求头（JSON 格式）',
  },
]

export const webhookDefinition: ChannelDefinition<WebhookConfig, WebhookParams> = {
  type: 'webhook',
  label: '自定义 Webhook',
  color: '#6366f1',

  configSchema: webhookConfigSchema,
  configFields: webhookConfigFields,
  requestSchema: webhookParamsSchema,
  requestExample: { headers: { 'X-Source': 'relay' }, data: { event: 'notification' } },

  sendMessage: async ({
    message,
    config,
    params,
  }: SendContext<WebhookConfig, WebhookParams>): Promise<SendResult> => {
    if (!config.webhook) {
      return { success: false, errorMessage: '未配置 Webhook 地址' }
    }

    const method = config.method || 'POST'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
      ...params.headers,
    }

    const url = new URL(config.webhook)
    Object.entries(params.query ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })

    try {
      const init: RequestInit = { method, headers }

      if (method !== 'GET') {
        init.body = JSON.stringify({ content: message, ...params.data })
      }

      const res = await fetch(url, init)
      const resBody = await res.text()

      return {
        success: res.status >= 200 && res.status < 300,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: res.status >= 300 ? resBody : undefined,
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  },
}
