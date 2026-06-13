import { z } from 'zod/v4'
import { channelMeta } from './registry'

const baseSchema = z.object({
  name: z.string().min(1, '请输入渠道名称').max(50, '名称不能超过 50 个字符'),
  enabled: z.boolean().default(true)
})

/** 创建：每种渠道类型对应一个 schema，config 由对应渠道的 configSchema 校验 */
const schemas = Object.entries(channelMeta).map(([type, meta]) =>
  baseSchema.extend({
    type: z.literal(type),
    config: meta.configSchema
  })
)

export const createChannelSchema = z.discriminatedUnion('type', schemas as any)

export type CreateChannelInput = z.infer<typeof createChannelSchema>

/** 更新：所有字段 optional，config 运行时按 type 校验 */
export const updateChannelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional()
})

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>
