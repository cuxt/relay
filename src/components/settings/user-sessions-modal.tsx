import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { Loader2, Globe, Monitor, Clock, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { I18N } from '@/constants'

interface UserSessionsModalProps {
  user: {
    id: string
    name: string
    email: string
  } | null
  onClose: () => void
}

interface SessionRecord {
  id: string
  token: string
  createdAt: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
}

export function UserSessionsModal({ user, onClose }: UserSessionsModalProps) {
  const queryClient = useQueryClient()
  const [revokeToken, setRevokeToken] = useState<string | null>(null)

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['admin', 'user-sessions', user?.id],
    queryFn: async () => {
      if (!user) return []
      const res = await authClient.admin.listUserSessions({ userId: user.id })
      return (res.data?.sessions ?? []) as unknown as SessionRecord[]
    },
    enabled: !!user,
  })

  const revokeMutation = useMutation({
    mutationFn: async (sessionToken: string) => {
      const res = await authClient.admin.revokeUserSession({ sessionToken })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      toast.success('会话已撤销')
      setRevokeToken(null)
      queryClient.invalidateQueries({
        queryKey: ['admin', 'user-sessions', user?.id],
      })
    },
  })

  return (
    <>
      <Dialog open={!!user} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{user?.name} 的会话</DialogTitle>
            <DialogDescription>共 {sessions.length} 个会话</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">暂无会话</p>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="space-y-3 pr-3">
                {sessions.map((record) => {
                  const expired = new Date(record.expiresAt) < new Date()
                  return (
                    <div key={record.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={expired ? 'destructive' : 'secondary'}>
                          {expired ? '已过期' : '活跃'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setRevokeToken(record.token)}
                          disabled={revokeMutation.isPending}
                          title="撤销会话"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1.5 text-sm items-center">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" /> IP
                        </span>
                        <span className="font-mono text-xs">{record.ipAddress || '-'}</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Monitor className="h-3.5 w-3.5" /> UA
                        </span>
                        <Tooltip>
                          <TooltipTrigger
                            render={<span className="truncate text-xs cursor-default" />}
                          >
                            {record.userAgent || '-'}
                          </TooltipTrigger>
                          {record.userAgent && (
                            <TooltipContent className="max-w-80 break-all">
                              {record.userAgent}
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> 创建
                        </span>
                        <span className="text-xs">
                          {new Date(record.createdAt).toLocaleString(I18N.LOCALE)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeToken} onOpenChange={(v) => !v && setRevokeToken(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>撤销会话</AlertDialogTitle>
            <AlertDialogDescription>确定要撤销该会话吗？用户将被强制下线。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              disabled={revokeMutation.isPending}
              onClick={() => revokeToken && revokeMutation.mutate(revokeToken)}
            >
              {revokeMutation.isPending ? '撤销中...' : '确认撤销'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
