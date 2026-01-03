import { z } from 'zod'
import { CHANNEL_TYPES } from './index'

// Config validation schema
export const channelConfigSchema = z.object({
  webhook: z.url({ message: '请输入有效的 URL 地址' }),
  secret: z.string().optional()
})

// Create channel validation
export const createChannelSchema = z.object({
  name: z.string().min(1, '渠道名称不能为空').max(100),
  type: z.enum([
    CHANNEL_TYPES.EMAIL,
    CHANNEL_TYPES.WEBHOOK,
    CHANNEL_TYPES.DINGTALK,
    CHANNEL_TYPES.WECOM,
    CHANNEL_TYPES.WECOM_APP,
    CHANNEL_TYPES.TELEGRAM,
    CHANNEL_TYPES.FEISHU,
    CHANNEL_TYPES.DISCORD,
    CHANNEL_TYPES.BARK
  ]),
  config: channelConfigSchema,
  status: z.enum(['active', 'inactive']).optional().default('active')
})

// Update channel validation (all fields optional)
export const updateChannelSchema = createChannelSchema.partial()

export type CreateChannelInput = z.infer<typeof createChannelSchema>
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>
