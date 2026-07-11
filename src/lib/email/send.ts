import { createMessage, type Message, type Transport } from '@upyo/core'
import { SmtpTransport } from '@upyo/smtp'
import { ResendTransport } from '@upyo/resend'
import { get } from '@/lib/config/kv'
import { EMAIL_CONFIG_KEY, type EmailConfig } from '@/constants'

/** 根据配置构造传输实例 */
function createTransport(cfg: EmailConfig): Transport {
  if (cfg.transport === 'smtp') {
    if (!cfg.host) throw new Error('SMTP host 未配置')
    return new SmtpTransport({
      host: cfg.host,
      port: cfg.port ?? 587,
      secure: cfg.secure ?? false,
      auth: cfg.username
        ? { user: cfg.username, pass: cfg.password ?? '', method: 'plain' }
        : undefined,
    })
  }
  if (cfg.transport === 'resend') {
    if (!cfg.apiKey) throw new Error('Resend apiKey 未配置')
    return new ResendTransport({ apiKey: cfg.apiKey })
  }
  throw new Error(`不支持的邮件传输方式: ${cfg.transport satisfies never}`)
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

/** 发送邮件，失败抛错 */
export async function send({ to, subject, html, text }: SendEmailInput): Promise<void> {
  const cfg = await get<EmailConfig>(EMAIL_CONFIG_KEY)
  if (!cfg) throw new Error('邮件服务未配置，请前往管理后台「邮件设置」完成配置')
  if (!cfg.from) throw new Error('邮件发件地址未配置')

  const transport = createTransport(cfg)
  const message: Message = createMessage({
    from: cfg.from,
    to,
    subject,
    content: { html, text },
  })
  const receipt = await transport.send(message)
  if (!receipt.successful) {
    throw new Error(receipt.errorMessages.join(', '))
  }
}
