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
  DialogDescription
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

interface BanUserModalProps {
  user: {
    id: string
    name: string
    email: string
  } | null
  onClose: () => void
  onSuccess: () => void
}

const banDurations = [
  { label: '1 小时', value: '3600' },
  { label: '24 小时', value: '86400' },
  { label: '7 天', value: '604800' },
  { label: '30 天', value: '2592000' },
  { label: '永久', value: 'permanent' }
]

export function BanUserModal({ user, onClose, onSuccess }: BanUserModalProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const banMutation = useMutation({
    mutationFn: async (params: {
      userId: string
      banReason?: string
      banExpiresIn?: number
    }) => {
      const res = await authClient.admin.banUser(params)
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('用户已封禁')
      formRef.current?.reset()
      onClose()
      onSuccess()
    }
  })

  const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault()
    if (!user) return
    const formData = new FormData(e.currentTarget)
    const reason = formData.get('reason') as string
    const duration = formData.get('duration') as string
    banMutation.mutate({
      userId: user.id,
      banReason: reason || undefined,
      banExpiresIn:
        duration && duration !== 'permanent' ? Number(duration) : undefined
    })
  }

  return (
    <Dialog open={!!user} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>封禁用户</DialogTitle>
          <DialogDescription>
            将封禁用户 <strong>{user?.name}</strong> ({user?.email})
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">封禁原因</Label>
            <Textarea
              id="ban-reason"
              name="reason"
              placeholder="输入封禁原因（可选）"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>封禁时长</Label>
            <Select name="duration" defaultValue="permanent" items={Object.fromEntries(banDurations.map(d => [d.value, d.label]))}>
              <SelectTrigger>
                <SelectValue placeholder="选择时长" />
              </SelectTrigger>
              <SelectContent>
                {banDurations.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={banMutation.isPending}
            >
              {banMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              确认封禁
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
