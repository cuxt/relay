import { useState, useEffect } from 'react'
import { SiGithub } from 'react-icons/si'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function LinkedAccounts() {
  const [githubLinked, setGithubLinked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    authClient.listAccounts().then((res) => {
      if (res.data) {
        setGithubLinked(res.data.some((account) => account.providerId === 'github'))
      }
      setLoading(false)
    })
  }, [])

  const handleLink = async () => {
    setActionLoading(true)
    await authClient.linkSocial({
      provider: 'github',
      callbackURL: '/settings',
    })
  }

  const handleUnlink = async () => {
    setActionLoading(true)
    try {
      const res = await authClient.unlinkAccount({ providerId: 'github' })
      if (res.error) {
        toast.error(res.error.message || '解绑失败')
      } else {
        setGithubLinked(false)
        toast.success('已解绑 GitHub')
      }
    } catch {
      toast.error('解绑过程中发生错误')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/30 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border">
          <SiGithub className="size-4.5" />
        </div>
        <div>
          <p className="text-sm font-medium">GitHub</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {loading ? '加载中...' : githubLinked ? '已绑定' : '未绑定'}
          </p>
        </div>
      </div>
      {!loading && (
        <Button
          variant={githubLinked ? 'outline' : 'default'}
          size="sm"
          disabled={actionLoading}
          onClick={githubLinked ? handleUnlink : handleLink}
        >
          {actionLoading && (
            <Loader2 className="size-3.5 animate-spin" />
          )}
          {githubLinked ? '解绑' : '绑定'}
        </Button>
      )}
    </div>
  )
}
