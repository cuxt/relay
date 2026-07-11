import { ChannelField, type ChannelFieldsProps } from './channel-field'

export function BarkFields({ config, onChange, errors, disabled }: ChannelFieldsProps) {
  return (
    <>
      <ChannelField
        label="Bark 服务器地址"
        path="config.server"
        required
        value={config.server}
        onChange={onChange}
        disabled={disabled}
        placeholder="https://api.day.app"
        description="自部署的 Bark 服务器地址"
        error={errors['config.server']}
      />
      <ChannelField
        label="设备密钥"
        path="config.key"
        required
        value={config.key}
        onChange={onChange}
        disabled={disabled}
        placeholder="设备密钥"
        description="Bark App 中显示的设备密钥"
        error={errors['config.key']}
      />
    </>
  )
}
