import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { authClient } from '@/lib/auth/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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

export const Route = createFileRoute('/_app/settings/security')({
  component: SecuritySettings,
})

function SecuritySettings() {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

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
    },
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmNewPassword = formData.get('confirmNewPassword') as string

    if (!currentPassword || !newPassword) {
      toast.error('请填写所有字段')
      return
    }
    if (newPassword.length < 8) {
      toast.error('新密码至少 8 位')
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('两次密码不一致')
      return
    }

    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await authClient.deleteUser()
      navigate({ to: '/' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-160">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> 修改密码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="输入当前密码"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="输入新密码"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">确认新密码</Label>
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                placeholder="再次输入新密码"
                required
              />
            </div>
            <Button
              type="submit"
              className="rounded-full"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              更新密码
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">危险操作</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            删除账户后，所有数据将被永久移除且无法恢复。
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" className="rounded-full" />}>
              删除账户
            </AlertDialogTrigger>
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
        </CardContent>
      </Card>
    </div>
  )
}
