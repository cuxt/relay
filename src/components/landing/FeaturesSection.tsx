import { Shield, Palette, Cable } from 'lucide-react'
import { motion } from 'motion/react'
import { Separator } from '@/components/ui/separator'

const highlights = [
  {
    icon: Shield,
    title: '认证与用户管理',
    description: '登录注册、会话管理、角色权限、Admin 面板，一站配齐',
  },
  {
    icon: Palette,
    title: '仪表盘与主题',
    description: '统计图表、活动时间线、亮暗模式与多主色动态切换',
  },
  {
    icon: Cable,
    title: '全栈类型安全',
    description: 'Server Functions + Middleware + Zod，端到端类型推导',
  },
]

const ease = [0.22, 1, 0.36, 1] as const

export function FeaturesSection() {
  return (
    <div className="px-6 md:px-12 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease,
              }}
              className="flex flex-col md:flex-row"
            >
              {/* Separator between items */}
              {index > 0 && (
                <>
                  <Separator
                    orientation="vertical"
                    className="hidden md:block mx-8 h-auto self-stretch"
                  />
                  <Separator className="md:hidden my-8" />
                </>
              )}

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
