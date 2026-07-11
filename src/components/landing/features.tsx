import { motion } from 'motion/react'
import { Braces, LineChart, Send, Share2 } from 'lucide-react'
import { EASE } from '@/constants'

const features = [
  {
    icon: Send,
    title: '统一推送接口',
    description:
      '一个 HTTP 端点 + token 鉴权。告警脚本和自动化流程接入时只对接一个 URL，无需关心目标平台。',
  },
  {
    icon: Braces,
    title: '模板插值',
    description:
      '端点配置消息模板，请求体字段自动插值。同一请求按渠道各自渲染，接入侧逻辑保持不变。',
  },
  {
    icon: Share2,
    title: '多渠道分发',
    description:
      '飞书、企微、钉钉、Telegram、Discord、邮件、Bark、Webhook——渠道按需挂载，新增渠道不动接入侧。',
  },
  {
    icon: LineChart,
    title: '日志与仪表盘',
    description:
      '每次推送留痕：端点/渠道筛选、Markdown 渲染详情。仪表盘给出趋势、渠道分布与端点排名。',
  },
]

export function Features() {
  return (
    <div className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10 text-2xl font-semibold tracking-tight"
        >
          接入一次，分发到任何地方
        </motion.h2>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, ease: EASE, delay: index * 0.08 }}
              className="flex flex-col gap-3 bg-background p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium">{item.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
