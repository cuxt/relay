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
    authClient.listAccounts().then(res => {
      if (res.data) {
        setGithubLinked(res.data.some(a => a.providerId === 'github'))
      }
      setLoading(false)
    })
  }, [])

  const handleLink = async () => {
    setActionLoading(true)
    await authClient.linkSocial({
      provider: 'github',
      callbackURL: '/settings'
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <SiGithub className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-medium">GitHub</p>
          <p className="text-xs text-muted-foreground">
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
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          )}
          {githubLinked ? '解绑' : '绑定'}
        </Button>
      )}
    </div>
  )
}
