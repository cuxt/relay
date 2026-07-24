import { describe, expect, test } from 'bun:test'
import { createEndpointSchema, updateEndpointSchema } from '@/lib/endpoints/validation'

describe('endpoint channel bindings', () => {
  test('requires at least one channel when creating an endpoint', () => {
    expect(createEndpointSchema.safeParse({ name: 'alerts', channelIds: [] }).success).toBe(false)
    expect(
      createEndpointSchema.safeParse({
        name: 'alerts',
        channelIds: ['channel-a', 'channel-b'],
      }).success
    ).toBe(true)
  })

  test('updates all channel bindings as one array', () => {
    expect(
      updateEndpointSchema.safeParse({
        channelIds: ['channel-a', 'channel-b'],
      }).success
    ).toBe(true)
    expect(updateEndpointSchema.safeParse({ channelIds: [] }).success).toBe(false)
  })
})
