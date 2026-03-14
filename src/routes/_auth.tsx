import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Bubbles } from 'lucide-react'
import { motion } from 'motion/react'
import { getSession } from '@/lib/auth/session'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand area */}
      <div className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-primary">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/8" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
              <Bubbles className="h-9 w-9 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">TanStack Start Template</h2>
            <p className="text-white/85 text-base max-w-100">
              通用全栈起步模板，快速启动你的下一个项目
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right form area */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-100">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
