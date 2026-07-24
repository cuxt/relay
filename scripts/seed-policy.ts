export type SeedAction = { type: 'skip' } | { type: 'promote'; userId: string } | { type: 'create' }

export function decideSeed(superId?: string, adminId?: string): SeedAction {
  if (superId) return { type: 'skip' }
  if (adminId) return { type: 'promote', userId: adminId }
  return { type: 'create' }
}
