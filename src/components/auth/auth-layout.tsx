import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-primary)_0%,transparent_50%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-primary)_0%,transparent_50%)] opacity-60" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Relay</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              多渠道消息
              <br />
              通知中继
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-md">
              一个 Webhook 入口，转发到飞书、企微、钉钉、Telegram、Discord
              等多个通知渠道。
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { label: '9 个渠道', desc: '覆盖主流平台' },
              { label: '模板引擎', desc: '灵活消息格式' },
              { label: '推送日志', desc: '完整追踪记录' }
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-4"
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs text-primary-foreground/50 mt-1">
                  {item.desc}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
