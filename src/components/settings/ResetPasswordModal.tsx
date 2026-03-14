import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Loader2, Dices, Copy, Eye, EyeOff } from 'lucide-react'
import { customAlphabet } from 'nanoid'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*',
  16
)

interface ResetPasswordModalProps {
  user: {
    id: string
    name: string
    email: string
  } | null
  onClose: () => void
  onSuccess: () => void
}

export function ResetPasswordModal({
  user,
  onClose,
  onSuccess
}: ResetPasswordModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)

  const resetMutation = useMutation({
    mutationFn: async ({
      userId,
      newPassword
    }: {
      userId: string
      newPassword: string
    }) => {
      const res = await authClient.admin.setUserPassword({
        userId,
        newPassword
      })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('密码已重置')
      onClose()
      onSuccess()
    },
  })

  const handleGenerate = () => {
    const pwd = generatePassword()
    if (inputRef.current) {
      // 使用 native setter 触发 React 受控更新
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )!.set!
      nativeSetter.call(inputRef.current, pwd)
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      setVisible(true)
    }
  }

  const handleCopy = async () => {
    const value = inputRef.current?.value
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success('已复制到剪贴板')
  }

  const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault()
    if (!user) return
    const formData = new FormData(e.currentTarget)
    resetMutation.mutate({
      userId: user.id,
      newPassword: formData.get('password') as string
    })
  }

  return (
    <Dialog open={!!user} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            为用户 <strong>{user?.name}</strong> ({user?.email}) 设置新密码
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
                  type={visible ? 'text' : 'password'}
                  minLength={8}
                  placeholder="至少 8 个字符"
                  className="pr-9"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setVisible(v => !v)}
                  tabIndex={-1}
                >
                  {visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
              {resetMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              确认重置
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
