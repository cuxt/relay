import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface EndpointRankingProps {
  ranking?: Array<{
    name: string
    total: number
    success: number
    failed: number
  }>
  isLoading: boolean
  isError?: boolean
}

export function EndpointRanking({ ranking, isLoading, isError }: EndpointRankingProps) {
  const data = ranking || []
  const maxTotal = Math.max(...data.map(d => d.total), 1)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">端点调用排行</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-65 items-center justify-center text-sm text-destructive">
            排行加载失败
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-65 text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item, index) => {
              const pct = (item.total / maxTotal) * 100
              const successPct =
                item.total > 0 ? (item.success / item.total) * 100 : 0
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.04,
                    duration: 0.3
                  }}
                  className="relative rounded-lg px-3 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  {/* Background fill indicating relative volume */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg bg-muted/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      delay: index * 0.04 + 0.15,
                      duration: 0.5,
                      ease: 'easeOut'
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`flex h-5.5 w-5.5 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums shrink-0 ${
                          index === 0
                            ? 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                            : index === 1
                              ? 'bg-slate-400/15 text-slate-500 dark:bg-slate-400/20 dark:text-slate-400'
                              : index === 2
                                ? 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                                : 'bg-primary/8 text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="text-sm font-medium truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span className="tabular-nums">{item.success}</span>
                      </span>
                      {item.failed > 0 && (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span className="tabular-nums">{item.failed}</span>
                        </span>
                      )}
                      <span className="font-semibold text-sm tabular-nums min-w-[2ch] text-right">
                        {item.total}
                      </span>
                    </div>
                  </div>
                  {/* Stacked success/failed bar, width reflects relative volume */}
                  <div className="relative mt-1.5 ml-8 h-1 rounded-full bg-border/50">
                    <motion.div
                      className="flex h-full rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        delay: index * 0.04 + 0.3,
                        duration: 0.5,
                        ease: 'easeOut'
                      }}
                    >
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${successPct}%` }}
                      />
                      {item.failed > 0 && (
                        <div
                          className="bg-red-500 h-full"
                          style={{
                            width: `${item.total > 0 ? (item.failed / item.total) * 100 : 0}%`
                          }}
                        />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
