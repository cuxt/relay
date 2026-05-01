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
    <div className="flex justify-center py-28">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}

const typeColors: Record<string, string> = {
  major: 'bg-red-500',
  minor: 'bg-blue-500',
  patch: 'bg-green-500',
}

const typeLabels: Record<string, string> = {
  major: '大版本',
  minor: '功能更新',
  patch: '问题修复',
}

function ReleasePage() {
  const { data: releases } = useSuspenseQuery(releasesQueryOptions())

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="py-12 px-6 md:px-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-10">更新日志</h2>
        <div className="relative space-y-0">
          {releases.map((release, index) => (
            <div key={release.version} className="relative flex gap-4 pb-6 last:pb-0">
              {index < releases.length - 1 && (
                <div className="absolute left-1.75 top-4 bottom-0 w-px bg-border" />
              )}
              <div className="relative shrink-0 mt-1.5">
                <div className={cn('h-3.5 w-3.5 rounded-full border-2 border-background', typeColors[release.type])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="rounded-lg border border-border p-5 mb-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{release.title}</h4>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full text-white', typeColors[release.type])}>
                        v{release.version}
                      </span>
                    </div>
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {new Date(release.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}