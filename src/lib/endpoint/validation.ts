import { z } from 'zod'

// Config验证（灵活的JSON对象）
export const endpointConfigSchema = z
  .object({
    msg_type: z.string().optional(),
    content: z.string().optional(),
    // 企业微信专用字段
    mentioned_list: z.array(z.string()).optional(),
    mentioned_mobile_list: z.array(z.string()).optional()
  })
  .loose()
  .optional()

// 创建Endpoint验证
export const createEndpointSchema = z.object({
  name: z.string().min(1, '端点名称不能为空').max(100),
  channelId: z.string().min(1, '必须选择关联渠道'),
  config: endpointConfigSchema,
  status: z.enum(['active', 'inactive']).optional().default('active')
})

// 更新Endpoint验证（所有字段可选）
export const updateEndpointSchema = z.object({
  name: z.string().min(1, '端点名称不能为空').max(100).optional(),
  channelId: z.string().min(1, '必须选择关联渠道').optional(),
  config: endpointConfigSchema,
  status: z.enum(['active', 'inactive']).optional()
})

export type CreateEndpointInput = z.infer<typeof createEndpointSchema>
export type UpdateEndpointInput = z.infer<typeof updateEndpointSchema>
