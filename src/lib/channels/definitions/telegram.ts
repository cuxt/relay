import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'

export const telegramConfigSchema = z.object({
  botToken: z.string().min(1, '请输入 Bot Token'),
  chatId: z.string().min(1, '请输入 Chat ID')
})

export type TelegramConfig = z.infer<typeof telegramConfigSchema>

export const telegramConfigFields = [
  {
    key: 'botToken',
    label: 'Bot Token',
    placeholder: '123456:ABC-DEF...',
    required: true,
    description: '通过 @BotFather 获取的 Bot Token'
  },
  {
    key: 'chatId',
    label: 'Chat ID',
    placeholder: '聊天 ID',
    required: true,
    description: '目标聊天/频道/群组的 ID'
  }
]

export const telegramDefinition: ChannelDefinition<TelegramConfig> = {
  type: 'telegram',
  label: 'Telegram',
  color: '#26a5e4',

  configSchema: telegramConfigSchema,
  configFields: telegramConfigFields,

  sendMessage: async ({ message, config, endpoint }: SendContext<TelegramConfig>): Promise<SendResult> => {
    if (!config.botToken || !config.chatId) {
      return { success: false, errorMessage: 'Telegram 配置不完整' }
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
    const messageType = endpoint.messageType || 'text'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: messageType === 'markdown' ? 'MarkdownV2' : undefined
        })
      })

      const resBody = await res.text()
      const json = JSON.parse(resBody)

      return {
        success: json.ok === true,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: !json.ok ? json.description : undefined
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  }
}
