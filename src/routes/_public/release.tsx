import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { releasesQueryOptions } from '@/lib/query-keys'

export const Route = createFileRoute('/_public/release')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(releasesQueryOptions())
  },
  pendingComponent: ReleasePending,
  component: ReleasePage,
})

function ReleasePending() {
  return (
    <div className="flex justify-center py-40">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}

const typeConfig: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  major: {
    label: '大版本',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
  minor: {
    label: '功能更新',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  patch: {
    label: '问题修复',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
}

function ReleasePage() {
  const { data: releases } = useSuspenseQuery(releasesQueryOptions())

  return (
    <div className="relative z-10 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold tracking-tight">更新日志</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            记录每一个版本的演进
          </p>
        </motion.div>

        <div className="relative">
          {releases.map((release, index) => {
            const config = typeConfig[release.type] || typeConfig.patch

            return (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.06,
                }}
                className="group relative pl-8 last:pb-0 pb-8"
              >
                {index < releases.length - 1 && (
                  <div className="absolute left-[7px] top-6 h-[calc(100%-24px)] w-px bg-border" />
                )}

                <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-background ring-2 ring-border group-hover:bg-primary/10 group-hover:ring-primary/30 transition-colors" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold">{release.title}</span>
                      <span
                        className={cn(
                          'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
                          config.badge
                        )}
                      >
                        v{release.version}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(release.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {release.changes.map((change, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span
                            className={cn(
                              'mt-1.5 h-1 w-1 rounded-full shrink-0',
                              config.dot
                            )}
                          />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}