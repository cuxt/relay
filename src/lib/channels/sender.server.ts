import { sendByChannelType } from './senders.server'
import type { ChannelType } from './registry'
import type { SendResult } from './types'

export async function sendMessage(
  type: ChannelType,
  ctx: {
    message: string
    config: Record<string, unknown>
    params: Record<string, unknown>
    endpoint: {
      messageType: string | null
      mentionedUserIds: string | null
      mentionedMobiles: string | null
    }
  }
): Promise<SendResult> {
  return sendByChannelType(type, ctx as any)
}

export type { SendResult } from './types'
