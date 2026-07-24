import { useRef, useState, type ReactNode } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Lock, Mail, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/x/avatar'
import { uploadFile } from '@/lib/storage/upload'
import { Input } from '@/components/x/input'
import { AUTH, ROLES, ROUTES, roleLabel } from '@/constants'
import { authClient } from '@/lib/auth/client'
import { sessionKey } from '@/lib/auth/session'

export const Route = createFileRoute('/_user/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [passOpen, setPassOpen] = useState(false)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const changeEmail = useMutation({
    mutationFn: async () => {
      const res = await authClient.changeEmail({ newEmail: email, callbackURL: ROUTES.PROFILE })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('验证链接已发送')
      setEmailOpen(false)
      setEmail('')
    },
    onError: () => toast.error('发送验证邮件失败，请重试'),
  })

  const changePass = useMutation({
    mutationFn: async () => {
      const res = await authClient.changePassword({
        currentPassword: oldPass,
        newPassword: newPass,
      })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('密码已更新')
      setPassOpen(false)
      setOldPass('')
      setNewPass('')
      setConfirmPass('')
    },
    onError: () => toast.error('更新密码失败，请重试'),
  })

  const canSubmitPass =
    !!oldPass && !!newPass && newPass.length >= AUTH.PASSWORD_MIN_LENGTH && newPass === confirmPass

  const changeAvatar = useMutation({
    mutationFn: async (file: File) => {
      const { accessUrl } = await uploadFile(file, { prefix: 'avatars' })
      const res = await authClient.updateUser({ image: accessUrl })
      if (res.error) throw res.error
      return accessUrl
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: sessionKey })
      await router.invalidate()
      toast.success('头像已更新')
    },
    onError: () => toast.error('更新头像失败，请重试'),
  })

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) changeAvatar.mutate(file)
  }

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const res = await authClient.deleteUser()
      if (res.error) throw res.error
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: sessionKey })
      await router.invalidate()
      await navigate({ to: ROUTES.HOME })
    },
    onError: () => toast.error('删除账户失败，请重试'),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="grid gap-6 border-b border-border pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">个人设置</p>
          <h1 className="mt-3 text-3xl font-semibold">{user.name}</h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            管理登录身份、邮箱和账户安全。这里保留必要操作，其他信息交给系统自动维护。
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={changeAvatar.isPending}
          title="更换头像"
          className="group relative inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <Avatar id={user.id} src={user.image} size="lg" className="h-20 w-20" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {changeAvatar.isPending ? '上传中…' : '更换'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickAvatar}
          />
        </button>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-medium">身份</h2>
        <div className="divide-y divide-border border-y border-border">
          <InfoRow label="用户 ID" value={user.id} />
          <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr]">
            <p className="text-sm text-muted-foreground">角色</p>
            <div>
              <Badge variant={user.role === ROLES.SUPER ? 'default' : 'secondary'}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-medium">账户</h2>
        <div className="divide-y divide-border border-y border-border">
          <ActionRow
            icon={<Mail className="h-4 w-4" />}
            label="邮箱"
            value={user.email}
            action={
              <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" className="rounded-full">
                      修改
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>修改邮箱</DialogTitle>
                    <DialogDescription>验证链接会发送到新的邮箱地址。</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="email">新邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEmailOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={() => changeEmail.mutate()}
                      disabled={!email || changeEmail.isPending}
                    >
                      {changeEmail.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      发送验证
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          />

          <ActionRow
            icon={<Lock className="h-4 w-4" />}
            label="密码"
            value="定期更新密码可以降低账户风险"
            action={
              <Dialog open={passOpen} onOpenChange={setPassOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" className="rounded-full">
                      修改
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>修改密码</DialogTitle>
                    <DialogDescription>请输入当前密码和新密码。</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <PassField
                      id="oldPass"
                      label="当前密码"
                      value={oldPass}
                      onChange={setOldPass}
                      autoComplete="current-password"
                    />
                    <PassField
                      id="newPass"
                      label="新密码"
                      value={newPass}
                      onChange={setNewPass}
                      autoComplete="new-password"
                    />
                    <PassField
                      id="confirmPass"
                      label="确认新密码"
                      value={confirmPass}
                      onChange={setConfirmPass}
                      autoComplete="new-password"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPassOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={() => changePass.mutate()}
                      disabled={!canSubmitPass || changePass.isPending}
                    >
                      {changePass.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      更新密码
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-medium text-destructive">危险操作</h2>
        <div className="border-y border-border py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <Trash2 className="mt-1 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">删除账户</p>
                <p className="mt-1 text-sm text-muted-foreground">删除后所有数据将被永久移除。</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm" className="rounded-full">
                    删除账户
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确定要删除账户吗？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作不可撤销，你的所有数据将被永久删除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAccount.mutate()}
                    className={buttonVariants({ variant: 'destructive' })}
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 py-5 md:grid-cols-[9rem_1fr]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-all text-sm">{value}</p>
    </div>
  )
}

function ActionRow({
  icon,
  label,
  value,
  action,
}: {
  icon: ReactNode
  label: string
  value: string
  action: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <span className="mt-1 text-muted-foreground">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">{value}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function PassField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
      />
    </div>
  )
}
