import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EASE } from '@/constants'

const techStack = ['TanStack Start', 'React 19', 'shadcn/ui', 'Drizzle ORM']

export function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Radial fade mask */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 20%, hsl(var(--background)) 70%)',
        }}
      />

      <div className="px-6 md:px-12 py-20 text-center max-w-3xl mx-auto">
        {/* Tech stack badges */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center justify-center flex-wrap gap-2 mb-8"
        >
          {techStack.map((tech, i) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}
            >
              <Badge variant="outline" className="text-xs font-normal px-3 py-1">
                {tech}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-5 bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent"
        >
          通用全栈
          <br />
          起步模板
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="text-lg text-muted-foreground mb-12"
        >
          认证、用户管理、主题、仪表盘 — 开箱即用，专注你的业务逻辑
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          className="flex items-center justify-center gap-3"
        >
          <Link to="/register">
            <Button
              size="lg"
              className="rounded-full h-12 px-10 text-base shadow-lg shadow-primary/25"
            >
              开始使用
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
