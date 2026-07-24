/** 客户端安全的渠道元数据 */
export interface ChannelMeta<TConfig = Record<string, unknown>, TParams = Record<string, unknown>> {
  type: string
  label: string
  color: string
  configSchema: import('zod/v4').ZodType<TConfig>
  configFields: ConfigFieldDef[]
  requestSchema: import('zod/v4').ZodType<TParams>
  requestExample: TParams
}

/** 服务端发送消息的上下文和结果 */
export interface SendContext<TConfig = Record<string, unknown>, TParams = Record<string, unknown>> {
  message: string
  config: TConfig
  params: TParams
  endpoint: {
    messageType: string | null
    mentionedUserIds: string | null
    mentionedMobiles: string | null
  }
}

export interface SendResult {
  success: boolean
  responseBody?: string
  responseStatus?: number
  errorMessage?: string
}

export type SendFn<TConfig = Record<string, unknown>, TParams = Record<string, unknown>> = (
  ctx: SendContext<TConfig, TParams>
) => Promise<SendResult>

/** 完整的渠道定义 = 元数据 + 发送函数（仅服务端用） */
export interface ChannelDefinition<
  TConfig = Record<string, unknown>,
  TParams = Record<string, unknown>,
> extends ChannelMeta<TConfig, TParams> {
  sendMessage: SendFn<TConfig, TParams>
}

export interface ConfigFieldDef {
  /** JSON path in config, e.g. "smtp.host" */
  key: string
  label: string
  placeholder?: string
  description?: string
  type?: 'text' | 'password' | 'number' | 'url' | 'select' | 'checkbox' | 'textarea' | 'hidden'
  required?: boolean
  defaultValue?: unknown
  options?: Array<{ value: string; label: string }>
}
