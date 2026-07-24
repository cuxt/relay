import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'
import { telegramParamsSchema, type TelegramParams } from '../request-params'

export const telegramConfigSchema = z.object({
  botToken: z.string().min(1, '请输入 Bot Token'),
  chatId: z.string().min(1, '请输入默认 Chat ID'),
})

export type TelegramConfig = z.infer<typeof telegramConfigSchema>

export const telegramConfigFields = [
  {
    key: 'botToken',
    label: 'Bot Token',
    placeholder: '123456:ABC-DEF...',
    required: true,
    description: '通过 @BotFather 获取的 Bot Token',
  },
  {
    key: 'chatId',
    label: '默认 Chat ID',
    placeholder: '聊天 ID',
    required: true,
    description: '请求未传 chatId 时使用的默认聊天/频道/群组',
  },
]

export const telegramDefinition: ChannelDefinition<TelegramConfig, TelegramParams> = {
  type: 'telegram',
  label: 'Telegram',
  color: '#26a5e4',

  configSchema: telegramConfigSchema,
  configFields: telegramConfigFields,
  requestSchema: telegramParamsSchema,
  requestExample: {
    chatId: '-1001234567890',
    parseMode: 'MarkdownV2',
    disableWebPagePreview: false,
  },

  sendMessage: async ({
    message,
    config,
    params,
    endpoint,
  }: SendContext<TelegramConfig, TelegramParams>): Promise<SendResult> => {
    const chatId = params.chatId ?? config.chatId
    if (!config.botToken || !chatId) {
      return { success: false, errorMessage: 'Telegram 配置不完整' }
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode:
            params.parseMode ?? (endpoint.messageType === 'markdown' ? 'MarkdownV2' : undefined),
          link_preview_options:
            params.disableWebPagePreview === undefined
              ? undefined
              : { is_disabled: params.disableWebPagePreview },
        }),
      })

      const resBody = await res.text()
      const json = JSON.parse(resBody)

      return {
        success: json.ok === true,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: !json.ok ? json.description : undefined,
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  },
}
