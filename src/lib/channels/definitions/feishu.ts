import { z } from 'zod/v4'
import type { ConfigFieldDef } from '../types'

export const feishuConfigSchema = z.object({
  webhook: z.url('请输入有效的 Webhook 地址'),
  secret: z.string().optional(),
})

export type FeishuConfig = z.infer<typeof feishuConfigSchema>

export const feishuConfigFields: ConfigFieldDef[] = [
  {
    key: 'webhook',
    label: 'Webhook 地址',
    placeholder: 'https://open.feishu.cn/open-apis/bot/v2/hook/...',
    type: 'url',
    required: true,
    description: '飞书自定义机器人的 Webhook 地址',
  },
  {
    key: 'secret',
    label: '签名密钥',
    placeholder: '签名密钥（可选）',
    description: '如果启用了签名校验，请填写密钥',
  },
]
