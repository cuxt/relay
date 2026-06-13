import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'

export const wecomConfigSchema = z.object({
  webhook: z.url('请输入有效的 Webhook 地址')
})

export type WecomConfig = z.infer<typeof wecomConfigSchema>

export const wecomConfigFields = [
  {
    key: 'webhook',
    label: 'Webhook 地址',
    placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
    type: 'url' as const,
    required: true,
    description: '企业微信群机器人的 Webhook 地址'
  }
]

export const wecomDefinition: ChannelDefinition<WecomConfig> = {
  type: 'wecom',
  label: '企微 Webhook',
  color: '#07c160',

  configSchema: wecomConfigSchema,
  configFields: wecomConfigFields,

  sendMessage: async ({ message, config, endpoint }: SendContext<WecomConfig>): Promise<SendResult> => {
    if (!config.webhook) {
      return { success: false, errorMessage: '未配置 Webhook 地址' }
    }

    const mentionedList = endpoint.mentionedUserIds
      ? endpoint.mentionedUserIds.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const mentionedMobileList = endpoint.mentionedMobiles
      ? endpoint.mentionedMobiles.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const messageType = endpoint.messageType || 'text'

    const body =
      messageType === 'markdown'
        ? { msgtype: 'markdown', markdown: { content: message } }
        : {
            msgtype: 'text',
            text: {
              content: message,
              mentioned_list: mentionedList,
              mentioned_mobile_list: mentionedMobileList
            }
          }

    try {
      const res = await fetch(config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const resBody = await res.text()
      const json = JSON.parse(resBody)

      return {
        success: json.errcode === 0,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: json.errcode !== 0 ? json.errmsg : undefined
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  }
}
