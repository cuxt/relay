import { z } from 'zod/v4'

export const createAiProviderSchema = z.object({
  name: z.string().min(1, '请输入名称').max(50, '名称不能超过 50 个字符'),
  baseUrl: z.url('请输入有效的 URL'),
  apiKey: z.string().min(1, '请输入 API Key'),
  enabled: z.boolean().default(true)
})

export type CreateAiProviderInput = z.infer<typeof createAiProviderSchema>

export const updateAiProviderSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  baseUrl: z.url().optional(),
  apiKey: z.string().min(1).optional(),
  enabled: z.boolean().optional()
})

export type UpdateAiProviderInput = z.infer<typeof updateAiProviderSchema>

export const createAiPresetSchema = z.object({
  name: z.string().min(1, '请输入名称').max(50, '名称不能超过 50 个字符'),
  key: z
    .string()
    .min(1, '请输入 Key')
    .max(30, 'Key 不能超过 30 个字符')
    .regex(/^[a-zA-Z_]+$/, 'Key 只能包含字母和下划线'),
  providerId: z.string().min(1, '请选择 AI 服务'),
  model: z.string().min(1, '请输入模型名称'),
  systemPrompt: z.string().min(1, '请输入系统提示词'),
  enabled: z.boolean().default(true)
})

export type CreateAiPresetInput = z.infer<typeof createAiPresetSchema>

export const updateAiPresetSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  key: z
    .string()
    .min(1)
    .max(30)
    .regex(/^[a-zA-Z_]+$/)
    .optional(),
  providerId: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  systemPrompt: z.string().min(1).optional(),
  enabled: z.boolean().optional()
})

export type UpdateAiPresetInput = z.infer<typeof updateAiPresetSchema>
