import { z } from 'zod/v4'
import type { ConfigFieldDef } from '../types'

export const dingtalkConfigSchema = z.object({
  webhook: z.url('请输入有效的 Webhook 地址'),
  secret: z.string().optional(),
})

export type DingtalkConfig = z.infer<typeof dingtalkConfigSchema>

export const dingtalkConfigFields: ConfigFieldDef[] = [
  {
    key: 'webhook',
    label: 'Webhook 地址',
    placeholder: 'https://oapi.dingtalk.com/robot/send?access_token=...',
    type: 'url',
    required: true,
    description: '钉钉自定义机器人的 Webhook 地址',
  },
  {
    key: 'secret',
    label: '签名密钥',
    placeholder: '签名密钥（可选）',
    description: '如果启用了加签，请填写密钥',
  },
]
