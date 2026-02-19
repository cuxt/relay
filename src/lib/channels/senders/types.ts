export interface SendResult {
  success: boolean
  responseBody?: string
  responseStatus?: number
  errorMessage?: string
}

export interface SenderContext {
  message: string
  channel: {
    webhookUrl: string | null
    secret: string | null
    botToken: string | null
    chatId: string | null
    corpId: string | null
    agentId: string | null
    appSecret: string | null
    smtpHost: string | null
    smtpPort: number | null
    smtpSecure: boolean | null
    smtpUser: string | null
    smtpPassword: string | null
    emailFrom: string | null
    emailTo: string | null
    emailProvider: string | null
    resendApiKey: string | null
    barkServerUrl: string | null
    barkDeviceKey: string | null
    webhookMethod: string | null
    webhookHeaders: Record<string, string> | null
  }
  endpoint: {
    messageType: string | null
    mentionedUserIds: string | null
    mentionedMobiles: string | null
  }
}

export type Sender = (ctx: SenderContext) => Promise<SendResult>
