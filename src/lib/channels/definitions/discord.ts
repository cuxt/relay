import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'

export const discordConfigSchema = z.object({
  webhook: z.url('请输入有效的 Webhook 地址')
})

export type DiscordConfig = z.infer<typeof discordConfigSchema>

export const discordConfigFields = [
  {
    key: 'webhook',
    label: 'Webhook 地址',
    placeholder: 'https://discord.com/api/webhooks/...',
    type: 'url' as const,
    required: true,
    description: 'Discord 频道的 Webhook URL'
  }
]

export const discordDefinition: ChannelDefinition<DiscordConfig> = {
  type: 'discord',
  label: 'Discord',
  color: '#5865f2',

  configSchema: discordConfigSchema,
  configFields: discordConfigFields,

  sendMessage: async ({ message, config }: SendContext<DiscordConfig>): Promise<SendResult> => {
    if (!config.webhook) {
      return { success: false, errorMessage: '未配置 Discord Webhook 地址' }
    }

    try {
      const res = await fetch(config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      })

      const resBody = await res.text()

      return {
        success: res.status >= 200 && res.status < 300,
        responseBody: resBody || undefined,
        responseStatus: res.status,
        errorMessage: res.status >= 300 ? resBody : undefined
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  }
}
