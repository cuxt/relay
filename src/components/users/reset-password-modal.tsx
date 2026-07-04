import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Loader2, Dices, Copy } from 'lucide-react'
import { customAlphabet } from 'nanoid'
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Modal } from '@/components/x/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/x/input'
import { AUTH } from '@/constants'
import type { UserModalProps } from './types'

const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*',
  AUTH.GENERATED_PASSWORD_LENGTH
)

export function ResetPasswordModal({ user, onClose, onSuccess }: UserModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const resetMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const res = await authClient.admin.setUserPassword({
        userId,
        newPassword,
      })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('密码已重置')
      onClose()
      onSuccess()
    },
    onError: () => toast.error('重置密码失败，请重试'),
  })

  const handleGenerate = () => {
    const pwd = generatePassword()
    if (inputRef.current) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )!.set!
      nativeSetter.call(inputRef.current, pwd)
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const handleCopy = async () => {
    const value = inputRef.current?.value
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success('已复制到剪贴板')
  }

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault()
    if (!user) return
    const formData = new FormData(e.currentTarget)
    resetMutation.mutate({
      userId: user.id,
      newPassword: formData.get('password') as string,
    })
  }

  return (
    <Modal open={!!user} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>重置密码</DialogTitle>
        <DialogDescription>
          {user ? (
            <>
              为用户 <strong>{user.name}</strong> ({user.email}) 设置新密码
            </>
          ) : (
            '设置新密码'
          )}
        </DialogDescription>
      </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">新密码</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  id="reset-password"
                  name="password"
                  type="password"
                  minLength={AUTH.PASSWORD_MIN_LENGTH}
                  placeholder="至少 8 个字符"
                  className="pr-9"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopy}
                title="复制密码"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleGenerate}
                title="自动生成密码"
              >
                <Dices className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={resetMutation.isPending}>
              {resetMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              确认重置
            </Button>
          </DialogFooter>
        </form>
    </Modal>
  )
}
