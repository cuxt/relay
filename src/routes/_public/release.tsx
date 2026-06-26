import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { CACHE, EASE, I18N } from '@/constants'
import type { Release } from '@/config/releases'
import { cn } from '@/lib/utils'

const releaseQuery = () =>
  queryOptions({
    queryKey: ['releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases')

      if (!response.ok) {
        throw new Error(`获取更新日志失败：${response.status}`)
      }

      return response.json() as Promise<Release[]>
    },
    staleTime: CACHE.RELEASES_STALE_TIME,
  })

export const Route = createFileRoute('/_public/release')({
  loader: ({ context }) => context.queryClient.ensureQueryData(releaseQuery()),
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

const styles: Record<string, { badge: string; dot: string }> = {
  major: {
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
  minor: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  patch: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
}

function ReleasePage() {
  const { data: releases } = useSuspenseQuery(releaseQuery())

  return (
    <div className="relative z-10 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold tracking-tight">更新日志</h1>
          <p className="mt-2 text-sm text-muted-foreground">记录每一个版本的演进</p>
        </motion.div>

        <div className="relative">
          {releases.map((release, index) => {
            const style = styles[release.type] ?? styles.patch

            return (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: index * 0.06 }}
                className="group relative pb-8 pl-8 last:pb-0"
              >
                {index < releases.length - 1 && (
                  <div className="absolute left-[7px] top-6 h-[calc(100%-24px)] w-px bg-border" />
                )}
                <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-background ring-2 ring-border transition-colors group-hover:bg-primary/10 group-hover:ring-primary/30" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-base font-semibold">{release.title}</span>
                      <span
                        className={cn(
                          'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
                          style.badge
                        )}
                      >
                        v{release.version}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(release.date).toLocaleDateString(I18N.LOCALE, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {release.changes.map((change) => (
                        <li
                          key={change}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', style.dot)} />
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
