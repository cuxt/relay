import type { ChannelType } from '@/lib/channels/registry'
import { channelMeta } from '@/lib/channels/registry'
import { TelegramFields } from './telegram-fields'
import { WebhookFields } from './webhook-fields'
import { EmailFields } from './email-fields'
import type { ChannelFieldsProps } from './channel-field'
import { DynamicChannelFields } from './dynamic-fields'

const customFieldComponents: Partial<
  Record<ChannelType, React.ComponentType<ChannelFieldsProps>>
> = {
  telegram: TelegramFields,
  webhook: WebhookFields,
  email: EmailFields,
}

export function ChannelFormFields({
  type,
  config,
  onChange,
  errors,
  disabled
}: { type: ChannelType } & ChannelFieldsProps) {
  const CustomFields = customFieldComponents[type]
  if (CustomFields) {
    return (
      <CustomFields config={config} onChange={onChange} errors={errors} disabled={disabled} />
    )
  }

  return (
    <DynamicChannelFields
      fields={channelMeta[type].configFields}
      config={config}
      onChange={onChange}
      errors={errors}
      disabled={disabled}
    />
  )
}

