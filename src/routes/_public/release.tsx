import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Loader2, Inbox } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { releasesQueryOptions } from '@/lib/query-keys'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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

function ReleasePage() {
  const { data: releases } = useSuspenseQuery(releasesQueryOptions())

  if (releases.length === 0) {
    return (
      <div className="py-20 px-6 md:px-12 max-w-200 mx-auto">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">暂无更新日志</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="py-12 px-6 md:px-12 max-w-200 mx-auto">
        <h2 className="text-2xl font-bold mb-10">更新日志</h2>
        <div className="relative space-y-0">
          {releases.map((release, index) => (
            <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
              {index < releases.length - 1 && (
                <div className="absolute left-1.75 top-4 bottom-0 w-px bg-border" />
              )}
              <div className="relative shrink-0 mt-1.5">
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 border-background',
                    release.prerelease ? 'bg-amber-500' : 'bg-primary'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Card className="mb-2">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">
                          <a
                            href={release.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {release.name}
                          </a>
                        </h4>
                        <Badge variant={release.prerelease ? 'secondary' : 'default'}>
                          {release.tag}
                        </Badge>
                      </div>
                      <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                        {new Date(release.date).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {release.body && (
                      <div
                        className="prose dark:prose-invert text-foreground"
                        dangerouslySetInnerHTML={{ __html: release.body }}
                      />
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={release.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {release.author.login[0]}
                        </AvatarFallback>
                      </Avatar>
                      <a
                        href={release.author.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {release.author.login}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
