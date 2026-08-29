import { describe, expect, test } from 'vitest'
import { evaluate } from '@/lib/push/template.server'

describe('push template date formatting', () => {
  test('formats the current time with date-fns format', async () => {
    const result = await evaluate("${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}", {
      payload: {},
    })

    expect(result.message).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })

  test('formats a payload date with a custom pattern', async () => {
    const result = await evaluate(
      "${format(new Date(payload.time), 'yyyy/MM/dd')}",
      { payload: { time: '2026-07-24T12:00:00' } }
    )

    expect(result.message).toBe('2026/07/24')
  })
})
