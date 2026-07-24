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

export function Avatar({ id, src, size = 'default', className }: AvatarProps) {
  const avatarSize = sizeMap[size]

  return (
    <BaseAvatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={id} />}
      <AvatarFallback>
        <span aria-hidden="true" className="flex">
          <BoringAvatar size={avatarSize} name={id} variant="beam" />
        </span>
      </AvatarFallback>
    </BaseAvatar>
  )
}
