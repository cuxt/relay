import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { Loader2, Lock, User, Mail, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/x'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/x/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMutation } from '@tanstack/react-query'
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
import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/_user/profile')({
  component: ProfileSettings,
})

function ProfileSettings() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [changeEmailOpen, setChangeEmailOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      if (res.error) throw res.error
      return res.data
    },
    onSuccess: () => {
      toast.success('密码已更新')
      setChangePasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
  })

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error('请填写所有字段')
      return
    }
    if (newPassword.length < 8) {
      toast.error('新密码至少 8 位')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次密码不一致')
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const changeEmailMutation = useMutation({
    mutationFn: async ({ newEmail }: { newEmail: string }) => {
      const res = await authClient.changeEmail({ newEmail, callbackURL: '/profile' })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      setChangeEmailOpen(false)
      setNewEmail('')
    },
  })

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await authClient.deleteUser()
      if (res.error) throw res.error
      await router.invalidate()
      await navigate({ to: '/' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar
              id={user.id}
              src={user.image}
              size="lg"
              className="h-16 w-16"
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <h5 className="font-semibold text-base">{user.name}</h5>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </Badge>
                <span className="text-muted-foreground">ID：{user.id}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>账户管理</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="binding">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="binding" className="gap-1.5">
                <User className="h-4 w-4" />
                账户绑定
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Lock className="h-4 w-4" />
                安全设置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="binding" className="mt-4 space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">邮箱</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setChangeEmailOpen(true)}>
                        修改邮箱
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>修改邮箱</DialogTitle>
                      <DialogDescription>
                        输入新的邮箱地址，我们会发送验证链接到该邮箱。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="newEmail">新邮箱</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangeEmailOpen(false)}>
                        取消
                      </Button>
                      <Button
                        onClick={() => changeEmailMutation.mutate({ newEmail })}
                        disabled={!newEmail || changeEmailMutation.isPending}
                      >
                        {changeEmailMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        发送验证链接
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4 space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">密码</p>
                    <p className="text-sm text-muted-foreground">定期更改密码可以提高账户安全性</p>
                  </div>
                </div>
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setChangePasswordOpen(true)}>
                        修改密码
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>修改密码</DialogTitle>
                      <DialogDescription>
                        请输入当前密码和新密码。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="输入当前密码"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="输入新密码（至少 8 位）"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="再次输入新密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                        取消
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        更新密码
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">删除账户</p>
                    <p className="text-sm text-muted-foreground">删除后所有数据将被永久移除</p>
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
                        onClick={handleDeleteAccount}
                        className={buttonVariants({ variant: 'destructive' })}
                        disabled={deleting}
                      >
                        {deleting ? '删除中...' : '确认删除'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
