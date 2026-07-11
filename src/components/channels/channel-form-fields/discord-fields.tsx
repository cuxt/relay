import { ChannelField, type ChannelFieldsProps } from './channel-field'

export function DiscordFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  return (
    <ChannelField
      label="Webhook 地址"
      path="config.webhook"
      required
      value={config.webhook}
      onChange={onChange}
      disabled={disabled}
      placeholder="https://discord.com/api/webhooks/..."
      description="Discord 频道的 Webhook URL"
      error={errors['config.webhook']}
    />
  )
}
