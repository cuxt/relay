import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { config } from '@/lib/db/schema'

/** 读取配置并按泛型解析；键不存在返回 null */
export async function get<T>(key: string): Promise<T | null> {
  const row = await db
    .select({ value: config.value })
    .from(config)
    .where(eq(config.key, key))
    .limit(1)
  if (!row[0]) return null
  try {
    return JSON.parse(row[0].value) as T
  } catch {
    return null
  }
}

/** 写入配置（JSON 序列化） */
export async function set<T>(key: string, value: T): Promise<void> {
  const serialized = JSON.stringify(value)
  await db
    .insert(config)
    .values({ key, value: serialized })
    .onConflictDoUpdate({
      target: config.key,
      set: { value: serialized, updatedAt: new Date() },
    })
}
