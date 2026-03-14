import { useActionState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { authClient } from '@/lib/auth/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
})

interface RegisterState {
  error: string | null
}

function RegisterPage() {
  const navigate = useNavigate()

  const [state, submitAction, isPending] = useActionState(
    async (_prev: RegisterState, formData: FormData): Promise<RegisterState> => {
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string

      if (!name || !email || !password) {
        return { error: '请填写所有必填项' }
      }

      if (password.length < 8) {
        return { error: '密码至少 8 位' }
      }

      if (password !== confirmPassword) {
        return { error: '两次输入的密码不一致' }
      }

      try {
        const result = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (result.error) {
          return { error: result.error.message || '注册失败' }
        }
        navigate({ to: '/dashboard' })
        return { error: null }
      } catch {
        return { error: '注册失败，请重试' }
      }
    },
    { error: null }
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">创建账户</h2>
        <p className="text-sm text-muted-foreground mt-1">开始使用 TanStack Start Template</p>
      </div>

      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={submitAction} className="space-y-5">
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
              minLength={8}
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

      <Link to="/login" className="block">
        <Button variant="outline" className="w-full rounded-full" size="lg">
          登录
        </Button>
      </Link>
    </motion.div>
  )
}
