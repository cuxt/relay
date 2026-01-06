import { sendFeishuMessage } from './senders/feishu'
import { sendWecomMessage } from './senders/wecom'
import type { WecomTextMessageOptions } from './types'

/**
 * 根据channel类型和配置发送消息
 * @param channelType 渠道类型
 * @param channelConfig 渠道配置
 * @param content 消息内容（字符串或企业微信消息选项对象）
 */
export async function sendMessage(
  channelType: string,
  channelConfig: any,
  content: string | WecomTextMessageOptions
): Promise<void> {
  switch (channelType) {
    case 'feishu':
      await sendFeishuMessage(channelConfig, content as string)
      break

    case 'wecom':
      // 如果是字符串，转换为 WecomTextMessageOptions 对象
      const wecomOptions: WecomTextMessageOptions =
        typeof content === 'string' ? { content } : content
      await sendWecomMessage(channelConfig, wecomOptions)
      break

    // 其他渠道类型暂未实现
    default:
      throw new Error(`不支持的渠道类型: ${channelType}`)
  }
}
