import { ChannelField, type ChannelFieldsProps } from './channel-field'

export function DingtalkFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  return (
    <>
      <ChannelField
        label="Webhook 地址"
        path="config.webhook"
        required
        value={config.webhook}
        onChange={onChange}
        disabled={disabled}
        placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
        description="钉钉自定义机器人的 Webhook 地址"
        error={errors['config.webhook']}
      />
      <ChannelField
        label="签名密钥"
        path="config.secret"
        value={config.secret}
        onChange={onChange}
        disabled={disabled}
        placeholder="签名密钥（可选）"
        description="如果启用了加签，请填写密钥"
        error={errors['config.secret']}
      />
    </>
  )
}
