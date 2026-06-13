import { z } from 'zod/v4'
import type { ChannelDefinition, SendContext, SendResult } from '../types'

export const barkConfigSchema = z.object({
  server: z.url('请输入有效的 Bark 服务器地址'),
  key: z.string().min(1, '请输入设备密钥')
})

export type BarkConfig = z.infer<typeof barkConfigSchema>

export const barkConfigFields = [
  {
    key: 'server',
    label: 'Bark 服务器地址',
    placeholder: 'https://api.day.app',
    type: 'url' as const,
    required: true,
    description: '自部署的 Bark 服务器地址'
  },
  {
    key: 'key',
    label: '设备密钥',
    placeholder: '设备密钥',
    required: true,
    description: 'Bark App 中显示的设备密钥'
  }
]

export const barkDefinition: ChannelDefinition<BarkConfig> = {
  type: 'bark',
  label: 'Bark',
  color: '#f59e0b',

  configSchema: barkConfigSchema,
  configFields: barkConfigFields,

  sendMessage: async ({ message, config }: SendContext<BarkConfig>): Promise<SendResult> => {
    if (!config.server || !config.key) {
      return { success: false, errorMessage: 'Bark 配置不完整' }
    }

    const url = `${config.server.replace(/\/$/, '')}/${config.key}`

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Relay 通知',
          body: message
        })
      })

      const resBody = await res.text()
      const json = JSON.parse(resBody)

      return {
        success: json.code === 200,
        responseBody: resBody,
        responseStatus: res.status,
        errorMessage: json.code !== 200 ? json.message : undefined
      }
    } catch (err: any) {
      return { success: false, errorMessage: err.message }
    }
  }
}
