import type { ChannelType } from '@/lib/channels/registry'
import { FeishuFields } from './feishu-fields'
import { WecomFields } from './wecom-fields'
import { WecomAppFields } from './wecom-app-fields'
import { DingtalkFields } from './dingtalk-fields'
import { TelegramFields } from './telegram-fields'
import { DiscordFields } from './discord-fields'
import { WebhookFields } from './webhook-fields'
import { EmailFields } from './email-fields'
import { BarkFields } from './bark-fields'
import type { UseFormReturn } from 'react-hook-form'

interface ChannelFormFieldsProps {
  type: ChannelType
  form: UseFormReturn<any>
}

const fieldComponents: Record<ChannelType, React.ComponentType> = {
  feishu: FeishuFields,
  wecom: WecomFields,
  wecom_app: WecomAppFields,
  dingtalk: DingtalkFields,
  telegram: TelegramFields,
  discord: DiscordFields,
  webhook: WebhookFields,
  email: EmailFields,
  bark: BarkFields
}

export function ChannelFormFields({ type }: ChannelFormFieldsProps) {
  const Component = fieldComponents[type]
  return Component ? <Component /> : null
}
