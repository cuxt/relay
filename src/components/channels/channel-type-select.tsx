import { ChannelIcon } from '@/components/shared/channel-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CHANNEL_TYPE_LIST, CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'

interface ChannelTypeSelectProps {
  value?: ChannelType
  onChange: (type: ChannelType) => void
  disabled?: boolean
}

export function ChannelTypeSelect({ value, onChange, disabled }: ChannelTypeSelectProps) {
  const selected = value ? CHANNEL_TYPES[value] : null

  return (
    <Select
      value={value}
      onValueChange={(next) => next && onChange(next as ChannelType)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full sm:max-w-sm" aria-label="渠道类型">
        <SelectValue placeholder="选择渠道类型">
          {selected && value ? (
            <span className="inline-flex h-5 items-center gap-2 leading-none">
              <ChannelIcon type={value} size="sm" className="shrink-0" />
              <span className="leading-5">{selected.label}</span>
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        {CHANNEL_TYPE_LIST.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            <span className="flex h-5 items-center gap-2 leading-none">
              <ChannelIcon type={item.value} size="sm" className="shrink-0" />
              <span className="leading-5">{item.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** 编辑模式下只读展示当前渠道类型 */
export function ChannelTypeBadge({ type }: { type: ChannelType }) {
  const meta = CHANNEL_TYPES[type]
  if (!meta) return null

  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 w-fit">
      <ChannelIcon type={type} size="sm" />
      <span className="text-sm font-medium">{meta.label}</span>
    </div>
  )
}
