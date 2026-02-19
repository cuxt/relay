import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { signUp } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/auth-layout'

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage
})

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' as const }
  })
}

function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 8) {
      setError('密码长度至少为 8 位')
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp.email({ email, password, name })
      if (result.error) {
        setError(result.error.message || '注册失败')
      } else {
        navigate({ to: '/', replace: true })
      }
    } catch {
      setError('注册过程中发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fieldVariants} custom={0} className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">创建账户</h1>
          <p className="text-sm text-muted-foreground">
            填写以下信息注册您的账户
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fieldVariants} custom={1} className="space-y-2">
            <Label htmlFor="name">姓名（可选）</Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入姓名"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={2} className="space-y-2">
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

          <motion.div variants={fieldVariants} custom={3} className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码（至少 8 位）"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </motion.div>

          <motion.div variants={fieldVariants} custom={4} className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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

          <motion.div variants={fieldVariants} custom={5}>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={fieldVariants} custom={6} className="text-center text-sm">
          <span className="text-muted-foreground">已有账户？</span>{' '}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            立即登录
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
