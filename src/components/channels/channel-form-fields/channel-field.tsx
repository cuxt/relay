/** 各渠道 fields 组件的统一受控接口 */
export interface ChannelFieldsProps {
  config: Record<string, unknown>
  onChange: (path: string, value: unknown) => void
  errors: Record<string, string>
  disabled?: boolean
}
