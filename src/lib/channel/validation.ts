import { z } from 'zod'
import { CHANNEL_TYPES, type ChannelType } from './index'

// Config validation schema
export const channelConfigSchema = z.object({
  webhook: z.string().url({ message: '请输入有效的 URL 地址' }),
  secret: z.string().default('')
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
  status: z.enum(['active', 'inactive']).default('active')
})

// Update channel validation (all fields optional)
export const updateChannelSchema = createChannelSchema.partial()

// Form input types (for TanStack Form)
export type CreateChannelInput = {
  name: string
  type: ChannelType
  config: {
    webhook: string
    secret: string
  }
  status: 'active' | 'inactive'
}

export type UpdateChannelInput = Partial<CreateChannelInput>

// Validation output types
export type CreateChannelOutput = z.infer<typeof createChannelSchema>
export type UpdateChannelOutput = z.infer<typeof updateChannelSchema>
