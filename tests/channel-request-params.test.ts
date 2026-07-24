import { describe, expect, test } from 'bun:test'
import { channelMeta } from '@/lib/channels/registry'
import { emailParamsSchema, telegramParamsSchema } from '@/lib/channels/request-params'
import { resolveEmailParams } from '@/lib/channels/definitions/email.server'

describe('channel request params', () => {
  test('all generated API examples satisfy their channel schema', () => {
    for (const meta of Object.values(channelMeta)) {
      expect(meta.requestSchema.safeParse(meta.requestExample).success).toBe(true)
    }
  })

  test('email request params are optional so channel defaults can be used', () => {
    expect(emailParamsSchema.safeParse({}).success).toBe(true)
    expect(
      emailParamsSchema.safeParse({
        from: 'sender@example.com',
        to: ['receiver@example.com'],
        subject: 'Override subject',
      }).success
    ).toBe(true)
  })

  test('email request params override configured sender and recipients', () => {
    const defaults = {
      from: 'default@example.com',
      to: 'first@example.com, second@example.com',
    }

    expect(resolveEmailParams(defaults, {})).toMatchObject({
      from: 'default@example.com',
      to: ['first@example.com', 'second@example.com'],
      subject: 'Relay 通知',
    })
    expect(
      resolveEmailParams(defaults, {
        from: 'override@example.com',
        to: ['target@example.com'],
      })
    ).toMatchObject({
      from: 'override@example.com',
      to: ['target@example.com'],
    })
  })

  test('telegram chat id can override the configured default', () => {
    expect(telegramParamsSchema.safeParse({}).success).toBe(true)
    expect(telegramParamsSchema.safeParse({ chatId: '-1001234567890' }).success).toBe(true)
  })
})
