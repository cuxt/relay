import { SiWechat, SiTelegram, SiDiscord } from 'react-icons/si'
import { RiDingdingFill, RiWebhookFill, RiSmartphoneFill } from 'react-icons/ri'
import { Mail } from 'lucide-react'
import type { ChannelType } from '@/lib/channels/constants'
import { CHANNEL_TYPES } from '@/lib/channels/constants'
import { cn } from '@/lib/utils'

type IconProps = { className?: string; style?: React.CSSProperties }

function FeishuIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style}>
      <path
        d="M17 29C21 29 25 26.9339 28 23.4065C36 14 41.4242 16.8166 44 17.9998C38.5 20.9998 40.5 29.6233 33 35.9998C28.382 39.9259 23.4945 41.014 19 41C12.5231 40.9799 6.86226 37.7637 4 35.4063V16.9998"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.64808 15.8669C5.02231 14.9567 3.77715 14.7261 2.86694 15.3519C1.95673 15.9777 1.72615 17.2228 2.35192 18.1331L5.64808 15.8669ZM36.0021 35.7309C36.958 35.1774 37.2843 33.9539 36.7309 32.9979C36.1774 32.042 34.9539 31.7157 33.9979 32.2691L36.0021 35.7309ZM2.35192 18.1331C5.2435 22.339 10.7992 28.144 16.8865 32.2239C19.9345 34.2667 23.217 35.946 26.449 36.7324C29.6946 37.522 33.0451 37.4428 36.0021 35.7309L33.9979 32.2691C32.2049 33.3072 29.9929 33.478 27.3947 32.8458C24.783 32.2103 21.9405 30.7958 19.1135 28.9011C13.4508 25.106 8.2565 19.661 5.64808 15.8669L2.35192 18.1331Z"
        fill="currentColor"
      />
      <path
        d="M33.5947 17C32.84 14.7027 30.8551 9.94054 27.5947 7H11.5947C15.2174 10.6757 23.0002 16 27.0002 24"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const iconMap: Record<ChannelType, React.ComponentType<IconProps>> = {
  feishu: FeishuIcon,
  wecom: SiWechat,
  wecom_app: SiWechat,
  dingtalk: RiDingdingFill,
  telegram: SiTelegram,
  discord: SiDiscord,
  webhook: RiWebhookFill,
  email: Mail,
  bark: RiSmartphoneFill
}

interface ChannelIconProps {
  type: ChannelType
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showBackground?: boolean
}

export function ChannelIcon({
  type,
  className,
  size = 'md',
  showBackground = false
}: ChannelIconProps) {
  const config = CHANNEL_TYPES[type]
  if (!config) return null

  const Icon = iconMap[type]
  if (!Icon) return null

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const bgSizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  }

  if (showBackground) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg',
          bgSizeClasses[size],
          className
        )}
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        <Icon className={sizeClasses[size]} />
      </div>
    )
  }

  return (
    <Icon
      className={cn(sizeClasses[size], className)}
      style={{ color: config.color }}
    />
  )
}
