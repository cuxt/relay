import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import BoringAvatar from 'boring-avatars'

export interface AvatarProps {
  id: string
  src?: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 24,
  default: 32,
  lg: 40,
}

export function Avatar({
  id,
  src,
  size = 'default',
  className,
}: AvatarProps) {
  const avatarSize = sizeMap[size]

  if (src) {
    return (
      <BaseAvatar size={size} className={className}>
        <AvatarImage src={src} alt={id} />
        <AvatarFallback>
          <BoringAvatar size={avatarSize} name={id} variant="beam" />
        </AvatarFallback>
      </BaseAvatar>
    )
  }

  return (
    <BaseAvatar size={size} className={className}>
      <AvatarFallback>
        <BoringAvatar size={avatarSize} name={id} variant="beam" />
      </AvatarFallback>
    </BaseAvatar>
  )
}