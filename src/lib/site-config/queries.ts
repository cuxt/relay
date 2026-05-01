import { createServerFn } from '@tanstack/react-start'
import { inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { config } from '@/lib/db/schema'
import { adminMiddleware } from '@/middleware/admin'

export interface SiteConfig {
  siteName: string
  iconType: string
  iconValue: string
}

export interface SystemInfo {
  version: string
  startTime: number
  nodeVersion: string
}

const defaultConfig: SiteConfig = {
  siteName: 'Start Template',
  iconType: 'lucide',
  iconValue: 'bubbles',
}

const KEY_MAP = {
  site_name: 'siteName',
  icon_type: 'iconType',
  icon_value: 'iconValue',
} as const

const FIELD_TO_KEY = {
  siteName: 'site_name',
  iconType: 'icon_type',
  iconValue: 'icon_value',
} as const

export const getSiteConfig = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SiteConfig> => {
    const rows = await db
      .select()
      .from(config)
      .where(inArray(config.key, ['site_name', 'icon_type', 'icon_value']))

    const result = { ...defaultConfig }

    for (const row of rows) {
      if (row.deletedAt) continue
      const field = KEY_MAP[row.key as keyof typeof KEY_MAP]
      if (field) {
        result[field] = row.value
      }
    }

    return result
  }
)

export const getSystemInfo = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SystemInfo> => {
    const startTime = Date.now() - (process.uptime() * 1000)
    return {
      version: process.env.npm_package_version || '1.0.0',
      startTime,
      nodeVersion: process.version,
    }
  }
)

export const updateSiteConfig = createServerFn({ method: 'POST' })
  .inputValidator((data: { siteName: string; iconType: string; iconValue: string }) => data)
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const entries = Object.entries(FIELD_TO_KEY) as [keyof typeof FIELD_TO_KEY, string][]

    await Promise.all(
      entries.map(([field, key]) =>
        db
          .insert(config)
          .values({ key, value: data[field] })
          .onConflictDoUpdate({
            target: config.key,
            set: { value: data[field], updatedAt: new Date() },
          })
      )
    )
  })
