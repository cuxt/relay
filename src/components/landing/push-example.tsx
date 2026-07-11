import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { EASE } from '@/constants'

/** 一次推送被分发的演示样本 */
const samples = [
  { label: '飞书', color: '#3370ff', message: '告警: CPU 使用率过高' },
  { label: 'Telegram', color: '#26a5e4', message: '告警: CPU 使用率过高' },
  { label: '邮件', color: '#ea580c', message: '告警: CPU 使用率过高' },
]

export function PushExample() {
  return (
    <div className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight">一行 curl，分发到所有渠道</h2>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
            端点独立、凭 token 鉴权。请求体字段插值进消息模板，模板不变的前提下，
            根据每个渠道的格式各自渲染。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="grid items-center gap-4 overflow-hidden rounded-xl border border-border bg-muted/30 p-4 md:grid-cols-[1fr_auto_1fr] md:gap-0 md:p-6"
        >
          {/* 请求 */}
          <div className="rounded-lg bg-background p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">请求</p>
            <pre className="overflow-x-auto text-[12.5px] leading-6">
              <code>{`curl -X POST \\
  /api/push/{token} \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "告警",
    "content": "CPU 使用率过高"
  }'`}</code>
            </pre>
          </div>

          {/* 模板 */}
          <div className="flex flex-col items-center gap-2 px-0 py-2 md:px-6">
            <p className="text-xs text-muted-foreground">模板</p>
            <code className="rounded-md bg-background px-2 py-1 text-[12.5px]">
              {'${body.title}: ${body.content}'}
            </code>
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
          </div>

          {/* 渠道结果 */}
          <div className="space-y-2 rounded-lg bg-background p-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">渠道收到</p>
            {samples.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </span>
                <span className="truncate text-foreground">{s.message}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
