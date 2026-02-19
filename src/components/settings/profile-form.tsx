import { useSession } from '@/lib/auth/client'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ProfileForm() {
  const { data: session } = useSession()

  if (!session) return null

  const user = session.user
  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">个人资料</h2>
        <p className="text-sm text-muted-foreground">查看您的账户信息</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-3 pb-6 border-b">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">
                {user.name || '未设置姓名'}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 pt-6">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={user.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input value={user.email} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
