import { useState } from 'react'
import { createFileRoute, redirect, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { getSession, sessionKey } from '@/lib/auth/session'
import { Input } from '@/components/x/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants'

export const Route = createFileRoute('/_public/login')({
  beforeLoad: async ({ context }) => {
    // 复用 _user 路由的 session 缓存，避免重复请求 getSession()
    const session = await context.queryClient.ensureQueryData({
      queryKey: sessionKey,
      queryFn: getSession,
    })
    if (session) {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    setIsPending(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        // requireEmailVerification 下，未验证邮箱用户无法登录
        if (result.error.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(email)
          toast.error('邮箱未验证，请先验证邮箱后再登录')
        } else {
          toast.error(result.error.message || '登录失败')
        }
        return
      }

      queryClient.removeQueries({ queryKey: sessionKey })
      await router.invalidate()
      await navigate({ to: ROUTES.DASHBOARD })
    } catch {
      // 登录已成功，仅跳转/失效缓存失败
      toast.error('登录成功，跳转失败，请刷新页面')
    } finally {
      setIsPending(false)
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail) return
    setResending(true)
    try {
      const result = await authClient.sendVerificationEmail({ email: unverifiedEmail })
      if (result.error) {
        toast.error(result.error.message || '发送验证邮件失败')
        return
      }
      toast.success('验证邮件已发送，请查收')
      setUnverifiedEmail(null)
    } catch {
      toast.error('发送验证邮件失败，请重试')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">欢迎回来</h2>
          <p className="text-sm text-muted-foreground mt-1">登录你的账户以继续</p>
        </div>

        {unverifiedEmail && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <p className="text-amber-700 dark:text-amber-400">
              邮箱 <span className="font-medium">{unverifiedEmail}</span> 尚未验证，请点击邮箱中的验证链接后再登录。
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs"
              disabled={resending}
              onClick={handleResendVerification}
            >
              {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              重新发送验证邮件
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="输入密码"
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            登录
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            还没有账户？
          </span>
        </div>

        <Link to={ROUTES.REGISTER} className="block">
          <Button variant="outline" className="w-full rounded-full" size="lg">
            创建账户
          </Button>
        </Link>
      </div>
    </div>
  )
}
