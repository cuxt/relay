import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'
import { wecomParamsSchema, type WecomParams } from '../request-params'

export const wecomConfigSchema = z.object({
  webhook: z.url('请输入有效的 Webhook 地址'),
})

export type WecomConfig = z.infer<typeof wecomConfigSchema>

export const wecomConfigFields = [
  {
    key: 'webhook',
    label: 'Webhook 地址',
    placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
    type: 'url' as const,
    required: true,
    description: '企业微信群机器人的 Webhook 地址',
  },
]

export const wecomDefinition: ChannelDefinition<WecomConfig, WecomParams> = {
  type: 'wecom',
  label: '企微 Webhook',
  color: '#07c160',

  configSchema: wecomConfigSchema,
  configFields: wecomConfigFields,
  requestSchema: wecomParamsSchema,
  requestExample: { format: 'text', mentionedUserIds: ['@all'] },

  sendMessage: async ({
    message,
    config,
    params,
    endpoint,
  }: SendContext<WecomConfig, WecomParams>): Promise<SendResult> => {
    if (!config.webhook) {
      return { success: false, errorMessage: '未配置 Webhook 地址' }
    }

    const mentionedUserIds =
      params.mentionedUserIds ??
      endpoint.mentionedUserIds
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    const mentionedMobiles =
      params.mentionedMobiles ??
      endpoint.mentionedMobiles
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    const format = params.format ?? endpoint.messageType ?? 'text'

    const body =
      format === 'markdown'
        ? { msgtype: 'markdown', markdown: { content: message } }
        : {
            msgtype: 'text',
            text: {
              content: message,
              mentioned_list: mentionedUserIds,
              mentioned_mobile_list: mentionedMobiles,
            },
          }

    try {
      const res = await fetch(config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const resBody = await res.text()
      const json = JSON.parse(resBody)

      return {
        success: json.errcode === 0,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: json.errcode !== 0 ? json.errmsg : undefined,
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  },
}
