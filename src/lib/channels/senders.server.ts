/** 服务端专属：聚合所有渠道的 sendMessage 函数 */
import type { ChannelType } from './registry'
import type { SendFn, SendContext, SendResult } from './types'

// 含 Node.js 依赖的发送函数
import { sendFeishu } from './definitions/feishu.server'
import { sendDingtalk } from './definitions/dingtalk.server'
import { sendEmail } from './definitions/email.server'

// 无 Node.js 依赖的发送函数（直接从 definition 导出）
import { wecomDefinition } from './definitions/wecom'
import { wecomAppDefinition } from './definitions/wecom-app'
import { telegramDefinition } from './definitions/telegram'
import { discordDefinition } from './definitions/discord'
import { webhookDefinition } from './definitions/webhook'
import { barkDefinition } from './definitions/bark'

type WildcardSendFn = (ctx: SendContext<Record<string, unknown>>) => Promise<SendResult>

function asWildcard<TConfig, TParams>(fn: SendFn<TConfig, TParams>): WildcardSendFn {
  return fn as WildcardSendFn
}

const senders: Record<ChannelType, WildcardSendFn> = {
  feishu: asWildcard(sendFeishu),
  wecom: asWildcard(wecomDefinition.sendMessage),
  wecom_app: asWildcard(wecomAppDefinition.sendMessage),
  dingtalk: asWildcard(sendDingtalk),
  telegram: asWildcard(telegramDefinition.sendMessage),
  discord: asWildcard(discordDefinition.sendMessage),
  webhook: asWildcard(webhookDefinition.sendMessage),
  email: asWildcard(sendEmail),
  bark: asWildcard(barkDefinition.sendMessage),
}

export async function sendByChannelType(
  type: ChannelType,
  ctx: SendContext<Record<string, unknown>>
): Promise<SendResult> {
  const sender = senders[type]
  if (!sender) {
    return { success: false, errorMessage: `不支持的渠道类型: ${type}` }
  }
  return sender(ctx)
}
