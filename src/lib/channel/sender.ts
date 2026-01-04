import type { FeishuConfig, WecomConfig } from './types'

/**
 * 发送飞书文本消息
 * @param config 飞书配置
 * @param content 消息内容
 */
export async function sendFeishuMessage(
  config: FeishuConfig,
  content: string
): Promise<void> {
  const { webhook } = config

  // 构建消息体
  const message = {
    msg_type: 'text',
    content: {
      text: content
    }
  }

  // 发送请求
  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`发送飞书消息失败: ${error}`)
  }

  const result = await response.json()

  // 检查飞书API返回的状态码
  if (result.code !== 0) {
    throw new Error(`飞书API错误: ${result.msg || '未知错误'}`)
  }
}

/**
 * 发送企业微信群机器人文本消息
 * @param config 企业微信配置
 * @param content 消息内容
 */
export async function sendWecomMessage(
  config: WecomConfig,
  content: string
): Promise<void> {
  const { webhook } = config

  // 构建消息体
  const message = {
    msgtype: 'text',
    text: {
      content: content
    }
  }

  // 发送请求
  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`发送企业微信消息失败: ${error}`)
  }

  const result = await response.json()

  // 检查企业微信API返回的状态码
  if (result.errcode !== 0) {
    throw new Error(`企业微信API错误: ${result.errmsg || '未知错误'}`)
  }
}

/**
 * 根据channel类型和配置发送消息
 * @param channelType 渠道类型
 * @param channelConfig 渠道配置
 * @param content 消息内容
 */
export async function sendMessage(
  channelType: string,
  channelConfig: any,
  content: string
): Promise<void> {
  switch (channelType) {
    case 'feishu':
      await sendFeishuMessage(channelConfig, content)
      break

    case 'wecom':
      await sendWecomMessage(channelConfig, content)
      break

    // 其他渠道类型暂未实现
    default:
      throw new Error(`不支持的渠道类型: ${channelType}`)
  }
}
