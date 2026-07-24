import { createMessage } from '@upyo/core'
import { SmtpTransport } from '@upyo/smtp'
import { ResendTransport } from '@upyo/resend'
import { createMarkdownExit } from 'markdown-exit'
import type { SendContext, SendResult } from '../types'
import type { EmailParams } from '../request-params'
import type { EmailConfig } from './email'

const md = createMarkdownExit()
type ResolvedEmailParams = EmailParams & {
  from: string
  to: string[]
  subject: string
}

export function resolveEmailParams(
  config: Pick<EmailConfig, 'from' | 'to'>,
  params: EmailParams
): ResolvedEmailParams {
  return {
    ...params,
    from: params.from ?? config.from,
    to:
      params.to ??
      config.to
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    subject: params.subject ?? 'Relay 通知',
  }
}

function createEmailMessage(params: ResolvedEmailParams, message: string, isMarkdown: boolean) {
  return createMessage({
    from: params.from,
    to: params.to,
    cc: params.cc,
    bcc: params.bcc,
    replyTo: params.replyTo,
    subject: params.subject,
    content: isMarkdown ? { html: md.render(message), text: message } : { text: message },
  })
}

async function sendViaSmtp(
  config: EmailConfig & { provider: 'smtp' },
  params: ResolvedEmailParams,
  message: string,
  isMarkdown: boolean
) {
  const transport = new SmtpTransport({
    host: config.smtp.host,
    port: config.smtp.port || 465,
    secure: config.smtp.secure ?? true,
    auth: { user: config.smtp.user, pass: config.smtp.password },
  })
  return transport.send(createEmailMessage(params, message, isMarkdown))
}

async function sendViaResend(
  config: EmailConfig & { provider: 'resend' },
  params: ResolvedEmailParams,
  message: string,
  isMarkdown: boolean
) {
  const transport = new ResendTransport({ apiKey: config.resend.apiKey })
  return transport.send(createEmailMessage(params, message, isMarkdown))
}

export async function sendEmail({
  message,
  config,
  params,
  endpoint,
}: SendContext<EmailConfig, EmailParams>): Promise<SendResult> {
  if (config.provider === 'resend') {
    if (!config.resend?.apiKey) {
      return { success: false, errorMessage: '未配置 Resend API Key' }
    }
  } else if (!config.smtp?.host || !config.smtp?.user || !config.smtp?.password) {
    return { success: false, errorMessage: 'SMTP 配置不完整' }
  }

  try {
    const resolvedParams = resolveEmailParams(config, params)
    const isMarkdown = (params.format ?? endpoint.messageType ?? 'text') === 'markdown'
    const receipt =
      config.provider === 'resend'
        ? await sendViaResend(config, resolvedParams, message, isMarkdown)
        : await sendViaSmtp(config, resolvedParams, message, isMarkdown)

    if (!receipt.successful) {
      throw new Error(receipt.errorMessages.join(', '))
    }

    return {
      success: true,
      responseBody: JSON.stringify({ messageId: receipt.messageId }),
      responseStatus: 200,
    }
  } catch (error: unknown) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }
}
