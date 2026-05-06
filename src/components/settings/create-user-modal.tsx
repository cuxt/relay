import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const createMutation = useMutation({
    mutationFn: async (values: {
      name: string
      email: string
      password: string
      role: 'user' | 'admin'
    }) => {
      const res = await authClient.admin.createUser(values)
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('用户创建成功')
      formRef.current?.reset()
      onClose()
      onSuccess()
    },
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: (formData.get('role') as 'user' | 'admin') || 'user',
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建用户</DialogTitle>
          <DialogDescription>填写以下信息创建新用户</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">姓名</Label>
            <Input id="create-name" name="name" placeholder="用户姓名" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">邮箱</Label>
            <Input
              id="create-email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">密码</Label>
            <Input
              id="create-password"
              name="password"
              type="password"
              placeholder="至少 8 位密码"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            <Select name="role" defaultValue="user" items={{ user: '用户', admin: '管理员' }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
