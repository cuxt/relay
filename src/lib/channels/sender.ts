import type { ChannelType } from './constants'
import type { Sender, SenderContext, SendResult } from './senders/types'
import { sendFeishu } from './senders/feishu'
import { sendWecom } from './senders/wecom'
import { sendWecomApp } from './senders/wecom-app'
import { sendDingtalk } from './senders/dingtalk'
import { sendTelegram } from './senders/telegram'
import { sendDiscord } from './senders/discord'
import { sendWebhook } from './senders/webhook'
import { sendEmail } from './senders/email'
import { sendBark } from './senders/bark'

const senderMap: Record<ChannelType, Sender> = {
  feishu: sendFeishu,
  wecom: sendWecom,
  wecom_app: sendWecomApp,
  dingtalk: sendDingtalk,
  telegram: sendTelegram,
  discord: sendDiscord,
  webhook: sendWebhook,
  email: sendEmail,
  bark: sendBark
}

export async function sendMessage(
  type: ChannelType,
  ctx: SenderContext
): Promise<SendResult> {
  const sender = senderMap[type]
  if (!sender) {
    return { success: false, errorMessage: `不支持的渠道类型: ${type}` }
  }
  return sender(ctx)
}
