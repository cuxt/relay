import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import type { UserModalProps } from './types'

export function DeleteModal({ user, onClose, onSuccess }: UserModalProps) {
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.removeUser({ userId })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('用户已删除')
      onClose()
      onSuccess()
    },
    onError: () => toast.error('删除用户失败，请重试'),
  })

  return (
    <AlertDialog open={!!user} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除用户</AlertDialogTitle>
          <AlertDialogDescription>
            {user ? (
              <>
                确定要删除用户 <strong>{user.name}</strong> ({user.email}) 吗？
                <br />
                <span className="text-destructive">此操作不可撤销，用户的所有数据将被永久删除。</span>
              </>
            ) : (
              '确定要删除该用户吗？'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && deleteMutation.mutate(user.id)}
            className={buttonVariants({ variant: 'destructive' })}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
