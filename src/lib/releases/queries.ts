import { createServerFn } from '@tanstack/react-start'
import { releases } from '@/config/releases'

export type { Release } from '@/config/releases'

export const fetchReleases = createServerFn({ method: 'GET' }).handler(
  async () => {
    return releases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
)