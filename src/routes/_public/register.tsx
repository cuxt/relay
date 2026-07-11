import { cloneElement, useState, type ReactElement } from 'react'
import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/x/input'
import { siteConfig } from '@/config/site'
import { AUTH, ROUTES } from '@/constants'
import { authClient } from '@/lib/auth/client'
import { getSession, sessionKey } from '@/lib/auth/session'

export const Route = createFileRoute('/_public/register')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) throw redirect({ to: ROUTES.DASHBOARD })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const confirm = String(form.get('confirmPassword') ?? '')

    if (!name || !email || !password) {
      toast.error('请填写所有必填项')
      return
    }

    if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
      toast.error(`密码至少 ${AUTH.PASSWORD_MIN_LENGTH} 位`)
      return
    }

    if (password !== confirm) {
      toast.error('两次输入的密码不一致')
      return
    }

    setPending(true)
    try {
      const result = await authClient.signUp.email({ email, password, name })
      if (result.error) {
        toast.error(result.error.message || '注册失败')
        return
      }
      queryClient.removeQueries({ queryKey: sessionKey })
      await router.invalidate()
      await navigate({ to: ROUTES.DASHBOARD })
    } catch {
      toast.error('注册失败，请重试')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">创建账户</h2>
          <p className="mt-1 text-sm text-muted-foreground">开始使用 {siteConfig.name}</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Field icon={<User />} id="name" label="姓名" placeholder="你的名字" />
          <Field
            icon={<Mail />}
            id="email"
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
          />
          <Field
            icon={<Lock />}
            id="password"
            label="密码"
            type="password"
            placeholder={`至少 ${AUTH.PASSWORD_MIN_LENGTH} 位密码`}
            minLength={AUTH.PASSWORD_MIN_LENGTH}
          />
          <Field
            icon={<Lock />}
            id="confirmPassword"
            label="确认密码"
            type="password"
            placeholder="再次输入密码"
          />

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
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

function Field({
  icon,
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  minLength,
}: {
  icon: ReactElement<{ className?: string }>
  id: string
  label: string
  type?: string
  placeholder: string
  autoComplete?: string
  minLength?: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {cloneElement(icon, {
          className: 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
        })}
        <Input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          className="pl-9"
          required
        />
      </div>
    </div>
  )
}
