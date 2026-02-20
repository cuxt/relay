import { useSession } from '@/lib/auth/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ProfileForm() {
  const { data: session } = useSession()

  if (!session) return null

  const user = session.user
  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-14 w-14">
        <AvatarImage src={user.image || undefined} alt={user.name} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{user.name || '未设置姓名'}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.createdAt && (
          <p className="text-xs text-muted-foreground mt-0.5">
            注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    </div>
  )
}
