import { useState } from 'react'
import { createFileRoute, redirect, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { getSession } from '@/lib/auth/session'
import { userRouteContextQueryKey } from '@/lib/query-keys'
import { Input } from '@/components/x/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { siteConfig } from '@/config/site'
import { ROUTES, AUTH } from '@/constants'

export const Route = createFileRoute('/_public/register')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || !email || !password) {
      toast.error('请填写所有必填项')
      return
    }

    if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
      toast.error('密码至少 8 位')
      return
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    setIsPending(true)
    try {
      const result = await authClient.signUp.email({ email, password, name })
      if (result.error) {
        toast.error(result.error.message || '注册失败')
        return
      }
      queryClient.removeQueries({ queryKey: userRouteContextQueryKey })
      await router.invalidate()
      await navigate({ to: ROUTES.DASHBOARD })
    } catch {
      toast.error('注册失败，请重试')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">创建账户</h2>
        <p className="text-sm text-muted-foreground mt-1">开始使用 {siteConfig.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name" name="name" placeholder="你的名字" className="pl-9" required />
          </div>
        </div>

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
              placeholder="至少 8 位密码"
              className="pl-9"
              required
              minLength={AUTH.PASSWORD_MIN_LENGTH}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              className="pl-9"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full rounded-full" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          注册
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          已有账户？
        </span>
      </div>

      <Link to={ROUTES.LOGIN} className="block">
        <Button variant="outline" className="w-full rounded-full" size="lg">
          登录
        </Button>
      </Link>
      </div>
    </div>
  )
}
