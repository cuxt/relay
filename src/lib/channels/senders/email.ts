import nodemailer from 'nodemailer'
import { createMarkdownExit } from 'markdown-exit'
import type { Sender } from './types'

const md = createMarkdownExit()

async function sendViaSMTP(
  channel: Parameters<Sender>[0]['channel'],
  recipients: string[],
  subject: string,
  message: string,
  isMarkdown: boolean
) {
  const transporter = nodemailer.createTransport({
    host: channel.smtpHost!,
    port: channel.smtpPort || 465,
    secure: channel.smtpSecure ?? true,
    auth: {
      user: channel.smtpUser!,
      pass: channel.smtpPassword!
    }
  })

  const mailOptions: nodemailer.SendMailOptions = {
    from: channel.emailFrom!,
    to: recipients.join(', '),
    subject
  }

  if (isMarkdown) {
    mailOptions.html = md.render(message)
    mailOptions.text = message
  } else {
    mailOptions.text = message
  }

  const info = await transporter.sendMail(mailOptions)
  return { messageId: info.messageId }
}

async function sendViaResend(
  channel: Parameters<Sender>[0]['channel'],
  recipients: string[],
  subject: string,
  message: string,
  isMarkdown: boolean
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channel.resendApiKey}`
    },
    body: JSON.stringify({
      from: channel.emailFrom!,
      to: recipients,
      subject,
      ...(isMarkdown
        ? { html: md.render(message), text: message }
        : { text: message })
    })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `Resend API error: ${res.status}`)
  }

  return { messageId: data.id }
}

export const sendEmail: Sender = async ({ message, channel, endpoint }) => {
  const provider = channel.emailProvider || 'smtp'

  if (provider === 'resend') {
    if (!channel.resendApiKey) {
      return { success: false, errorMessage: '未配置 Resend API Key' }
    }
  } else {
    if (!channel.smtpHost || !channel.smtpUser || !channel.smtpPassword) {
      return { success: false, errorMessage: 'Email SMTP 配置不完整' }
    }
  }

  if (!channel.emailFrom || !channel.emailTo) {
    return { success: false, errorMessage: '未配置发件人或收件人' }
  }

  const messageType = endpoint.messageType || 'text'
  const isMarkdown = messageType === 'markdown'
  const recipients = channel.emailTo
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const subject = 'Relay 通知'

  try {
    const result =
      provider === 'resend'
        ? await sendViaResend(channel, recipients, subject, message, isMarkdown)
        : await sendViaSMTP(channel, recipients, subject, message, isMarkdown)

    return {
      success: true,
      responseBody: JSON.stringify(result),
      responseStatus: 200
    }
  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  }
}
