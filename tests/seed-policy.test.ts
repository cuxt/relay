import { describe, expect, test } from 'vitest'
import { decideSeed } from '../scripts/seed-policy'

describe('super seed policy', () => {
  test('skips when a super administrator exists', () => {
    expect(decideSeed('super-id', 'admin-id')).toEqual({ type: 'skip' })
  })

  test('promotes an administrator when no super administrator exists', () => {
    expect(decideSeed(undefined, 'admin-id')).toEqual({
      type: 'promote',
      userId: 'admin-id',
    })
  })

  test('creates an account only when neither role exists', () => {
    expect(decideSeed()).toEqual({ type: 'create' })
  })
})
