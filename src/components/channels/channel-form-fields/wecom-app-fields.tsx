import { ChannelField, type ChannelFieldsProps } from './channel-field'

export function WecomAppFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  return (
    <>
      <ChannelField
        label="Corp ID"
        path="config.corpId"
        required
        value={config.corpId}
        onChange={onChange}
        disabled={disabled}
        placeholder="企业 ID"
        description="企业微信的企业 ID"
        error={errors['config.corpId']}
      />
      <ChannelField
        label="Agent ID"
        path="config.agentId"
        required
        value={config.agentId}
        onChange={onChange}
        disabled={disabled}
        placeholder="应用 ID"
        description="企业微信应用的 Agent ID"
        error={errors['config.agentId']}
      />
      <ChannelField
        label="App Secret"
        path="config.secret"
        required
        type="password"
        value={config.secret}
        onChange={onChange}
        disabled={disabled}
        placeholder="应用密钥"
        description="企业微信应用的密钥"
        error={errors['config.secret']}
      />
    </>
  )
}
