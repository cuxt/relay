import { motion } from 'framer-motion'
import { ChannelIcon } from '@/components/shared/channel-icon'
import { CHANNEL_TYPE_LIST, CHANNEL_TYPES } from '@/lib/channels/constants'
import type { ChannelType } from '@/lib/channels/constants'
import { cn } from '@/lib/utils'

interface ChannelTypeSelectProps {
  value?: ChannelType
  onChange: (type: ChannelType) => void
  disabled?: boolean
}

export function ChannelTypeSelect({
  value,
  onChange,
  disabled
}: ChannelTypeSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHANNEL_TYPE_LIST.map((item, index) => (
        <motion.button
          key={item.value}
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02, duration: 0.15 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => !disabled && onChange(item.value)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer',
            value === item.value
              ? 'border-primary bg-primary/10 text-foreground font-medium'
              : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <ChannelIcon type={item.value} size="sm" />
          <span>{item.label}</span>
        </motion.button>
      ))}
    </div>
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
