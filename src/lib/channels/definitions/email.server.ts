import { createMessage } from '@upyo/core'
import { SmtpTransport } from '@upyo/smtp'
import { ResendTransport } from '@upyo/resend'
import { createMarkdownExit } from 'markdown-exit'
import type { SendContext, SendResult } from '../types'
import type { EmailConfig } from './email'

const md = createMarkdownExit()

async function sendViaSMTP(
  config: EmailConfig & { provider: 'smtp' },
  recipients: string[],
  subject: string,
  message: string,
  isMarkdown: boolean
) {
  const smtp = config.smtp
  const transport = new SmtpTransport({
    host: smtp.host,
    port: smtp.port || 465,
    secure: smtp.secure ?? true,
    auth: { user: smtp.user, pass: smtp.password }
  })

  const msg = createMessage({
    from: config.from,
    to: recipients,
    subject,
    content: isMarkdown
      ? { html: md.render(message), text: message }
      : { text: message }
  })

  const receipt = await transport.send(msg)

  if (!receipt.successful) {
    throw new Error(receipt.errorMessages.join(', '))
  }

  return { messageId: receipt.messageId }
}

async function sendViaResend(
  config: EmailConfig & { provider: 'resend' },
  recipients: string[],
  subject: string,
  message: string,
  isMarkdown: boolean
) {
  const transport = new ResendTransport({
    apiKey: config.resend.apiKey
  })

  const msg = createMessage({
    from: config.from,
    to: recipients,
    subject,
    content: isMarkdown
      ? { html: md.render(message), text: message }
      : { text: message }
  })

  const receipt = await transport.send(msg)

  if (!receipt.successful) {
    throw new Error(receipt.errorMessages.join(', '))
  }

  return { messageId: receipt.messageId }
}

export async function sendEmail({ message, config, endpoint }: SendContext<EmailConfig>): Promise<SendResult> {
  if (!config.from || !config.to) {
    return { success: false, errorMessage: '未配置发件人或收件人' }
  }

  if (config.provider === 'resend') {
    if (!config.resend?.apiKey) {
      return { success: false, errorMessage: '未配置 Resend API Key' }
    }
  } else {
    if (!config.smtp?.host || !config.smtp?.user || !config.smtp?.password) {
      return { success: false, errorMessage: 'Email SMTP 配置不完整' }
    }
  }

  const messageType = endpoint.messageType || 'text'
  const isMarkdown = messageType === 'markdown'
  const recipients = config.to.split(',').map(s => s.trim()).filter(Boolean)
  const subject = 'Relay 通知'

  try {
    const result =
      config.provider === 'resend'
        ? await sendViaResend(config as EmailConfig & { provider: 'resend' }, recipients, subject, message, isMarkdown)
        : await sendViaSMTP(config as EmailConfig & { provider: 'smtp' }, recipients, subject, message, isMarkdown)

    return {
      success: true,
      responseBody: JSON.stringify(result),
      responseStatus: 200
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return { success: false, errorMessage }
  }
}
