import { motion } from 'motion/react'
import { ChannelTopology } from '@/components/landing/channel-topology'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { EASE } from '@/constants'

export function Hero() {
  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-col items-start"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            统一推送接口 · 多渠道分发
          </span>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            把每一次告警，
            <br />
            送到该去的地方。
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            自部署的多渠道消息推送服务。一个 HTTP 端点把请求体插值进模板，
            再分发到配置好的渠道。告警、自动化、运维通知，交给一行 curl。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button size="lg" className="h-11 rounded-full px-8">
                开始使用
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="h-11 rounded-full px-8">
                查看控制台
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <ChannelTopology />
        </motion.div>
      </div>
    </div>
  )
}
