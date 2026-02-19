import { z } from 'zod/v4'

export const createEndpointSchema = z.object({
  name: z.string().min(1, '请输入端点名称').max(50, '名称不能超过 50 个字符'),
  channelId: z.string().min(1, '请选择关联渠道'),
  enabled: z.boolean().default(true),
  messageTemplate: z.string().optional(),
  messageType: z.enum(['text', 'markdown']).default('text'),
  mentionedUserIds: z.string().optional(),
  mentionedMobiles: z.string().optional()
})

export type CreateEndpointInput = z.infer<typeof createEndpointSchema>

export const updateEndpointSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  channelId: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  messageTemplate: z.string().optional(),
  messageType: z.enum(['text', 'markdown']).optional(),
  mentionedUserIds: z.string().optional(),
  mentionedMobiles: z.string().optional()
})

export type UpdateEndpointInput = z.infer<typeof updateEndpointSchema>
