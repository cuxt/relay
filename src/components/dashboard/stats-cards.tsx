import { motion } from 'framer-motion'
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
    iconBg:
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
  },
  {
    key: 'successRate',
    label: '成功率',
    icon: CheckCircle2,
    format: (v: number) => `${v}%`,
    iconBg:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
  },
  {
    key: 'todayPushes',
    label: '今日推送',
    icon: Zap,
    format: (v: number) => v.toLocaleString(),
    iconBg:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
  },
  {
    key: 'activeEndpoints',
    label: '活跃端点',
    icon: Radio,
    format: (v: number) => v.toString(),
    iconBg:
      'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
  }
] as const

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-27.5 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const value = stats?.[card.key] ?? 0
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg shrink-0 ${card.iconBg}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight mt-0.5">
                      {card.format(value)}
                    </p>
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
