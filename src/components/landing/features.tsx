import { motion } from 'motion/react'
import { Separator } from '@/components/ui/separator'
import { EASE } from '@/constants'

const highlights = [
  {
    title: '认证与用户管理',
    description: '登录注册、会话、角色权限和用户管理保留在清晰的后台工作流里。',
  },
  {
    title: 'Elysia 后端',
    description: '业务 API 统一挂在 Elysia app 下，Better Auth 按官方 handler 直接接入。',
  },
  {
    title: '安静界面',
    description: '页面减少卡片背景和装饰层级，保留文字、间距和必要的操作。',
  },
]

export function Features() {
  return (
    <div className="px-6 pb-24 md:px-12">
      <div className="mx-auto max-w-3xl">
        <Separator className="mb-10" />
        <div className="space-y-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: EASE
              }}
              className="grid gap-2 border-b border-border pb-8 md:grid-cols-[10rem_1fr]"
            >
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
