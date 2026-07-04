import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Loader2 } from 'lucide-react'
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Modal } from '@/components/x/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { UserModalProps } from './types'

export function EditModal({ user, onClose, onSuccess }: UserModalProps) {
  const editMutation = useMutation({
    mutationFn: async ({
      userId,
      name,
      email,
    }: {
      userId: string
      name: string
      email: string
    }) => {
      const res = await authClient.admin.updateUser({
        userId,
        data: { name, email },
      })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('用户信息已更新')
      onClose()
      onSuccess()
    },
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    if (!user) return
    const formData = new FormData(e.currentTarget)
    editMutation.mutate({
      userId: user.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    })
  }

  return (
    <Modal open={!!user} onClose={onClose}>
      <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>修改用户姓名和邮箱</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">姓名</Label>
            <Input id="edit-name" name="name" defaultValue={user?.name ?? ''} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">邮箱</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              defaultValue={user?.email ?? ''}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
    </Modal>
  )
}
