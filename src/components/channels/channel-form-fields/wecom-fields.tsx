import { ChannelField, type ChannelFieldsProps } from './channel-field'

export function WecomFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  return (
    <ChannelField
      label="Webhook 地址"
      path="config.webhook"
      required
      value={config.webhook}
      onChange={onChange}
      disabled={disabled}
      placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
      description="企业微信群机器人的 Webhook 地址"
      error={errors['config.webhook']}
    />
  )
}
