import { motion } from 'motion/react'
import { Activity, CheckCircle2, Zap, Radio } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  stats?: {
    totalPushes: number
    successRate: number
    todayPushes: number
    activeEndpoints: number
  }
  isLoading: boolean
}

const cards = [
  {
    key: 'totalPushes',
    label: '总推送数',
    icon: Activity,
    format: (v: number) => v.toLocaleString(),
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15'
  },
  {
    key: 'successRate',
    label: '成功率',
    icon: CheckCircle2,
    format: (v: number) => `${v}%`,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15'
  },
  {
    key: 'todayPushes',
    label: '今日推送',
    icon: Zap,
    format: (v: number) => v.toLocaleString(),
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15'
  },
  {
    key: 'activeEndpoints',
    label: '活跃端点',
    icon: Radio,
    format: (v: number) => v.toString(),
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 dark:bg-violet-500/15'
  }
] as const

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-26 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const value = stats?.[card.key] ?? 0
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
          >
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[13px] font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-[28px] font-bold tracking-tight leading-none">
                      {card.format(value)}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}
                  >
                    <card.icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
