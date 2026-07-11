import type { Session } from '@/lib/auth/session'

/**
 * 针对单个用户操作的弹窗 props：受目标用户、关闭回调、成功回调驱动。
 * user 为 null 时弹窗关闭。
 */
export interface UserModalProps {
  user: Session['user'] | null
  onClose: () => void
  onSuccess: () => void
}
