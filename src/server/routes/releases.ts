import { Elysia, t } from 'elysia'
import { releases } from '@/config/releases'

export const releaseRoutes = new Elysia({ name: 'releases' }).get(
  '/api/releases',
  () => releases.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  {
    detail: {
      tags: ['更新日志'],
      summary: '获取更新日志',
    },
    response: {
      200: t.Array(
        t.Object({
          version: t.String(),
          date: t.String(),
          type: t.Union([t.Literal('major'), t.Literal('minor'), t.Literal('patch')]),
          title: t.String(),
          changes: t.Array(t.String()),
        })
      ),
    },
  }
)
