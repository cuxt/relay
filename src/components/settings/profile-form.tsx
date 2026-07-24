import { authClient } from '@/lib/auth/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ProfileForm() {
  const { data: session } = authClient.useSession()

  if (!session) return null

  const user = session.user
  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-4">
      <Avatar className="size-14 ring-2 ring-background">
        <AvatarImage src={user.image || undefined} alt={user.name} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-semibold">{user.name || '未设置姓名'}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        {user.createdAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    </div>
  )
}
