import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { SiGithub } from 'react-icons/si'
import { signIn } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/auth-layout'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage
})

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const }
  })
}

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message || '登录失败')
      } else {
        navigate({ to: '/', replace: true })
      }
    } catch {
      setError('登录过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fieldVariants} custom={0} className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-sm text-muted-foreground">
            输入您的邮箱和密码登录
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fieldVariants} custom={1} className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={2} className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={fieldVariants} custom={3}>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={fieldVariants} custom={3.5}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} custom={3.7}>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true)
              signIn.social({ provider: 'github', callbackURL: '/dashboard' })
            }}
          >
            <SiGithub className="mr-2 h-4 w-4" />
            GitHub 登录
          </Button>
        </motion.div>

        <motion.div
          variants={fieldVariants}
          custom={4}
          className="text-center text-sm"
        >
          <span className="text-muted-foreground">还没有账户？</span>{' '}
          <Link
            to="/auth/sign-up"
            className="text-primary font-medium hover:underline"
          >
            立即注册
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
