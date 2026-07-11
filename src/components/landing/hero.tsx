import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { EASE } from '@/constants'

export function Hero() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-24 md:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-start">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8 text-sm text-muted-foreground"
        >
          TanStack Start + ElysiaJS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl"
        >
          写给新项目的第一封信。
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
        >
          认证、用户管理、主题和后台入口已经放好；后端由 ElysiaJS
          接管，页面保持安静、清楚、像一页可以继续书写的纸。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          className="mt-10"
        >
          <Link to="/register">
            <Button size="lg" className="h-11 rounded-full px-8">
              开始使用
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
