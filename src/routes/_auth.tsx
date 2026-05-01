import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { getSession } from '@/lib/auth/session'
import { AppLogo } from '@/components/layout/AppLogo'

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
  const { siteConfig } = Route.useRouteContext()

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand area */}
      <div className="hidden md:flex flex-col items-center justify-center p-12 relative overflow-hidden bg-primary">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/8" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center relative z-10">
            <div className="mx-auto mb-8 flex justify-center [&_a]:p-0 [&_a]:text-white [&_a]:hover:text-white [&_span]:text-3xl [&_span]:font-bold">
              <AppLogo siteConfig={siteConfig} />
            </div>
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
