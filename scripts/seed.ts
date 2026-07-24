/**
 * 数据库种子脚本 - 初始化超级管理员
 *
 * 运行方式: bun run db:seed
 */

import { client, db } from '../src/lib/db'
import { user } from '../src/lib/db/schema'
import { auth } from '../src/lib/auth/auth'
import { asc, eq } from 'drizzle-orm'
import { ROLES } from '../src/constants'
import { decideSeed } from './seed-policy'

const SUPER_NAME = '超级管理员'
const SUPER_EMAIL = 'admin@xbxin.com'
const SUPER_PASSWORD = '12345678'

async function seedSuper() {
  console.log('🌱 开始数据库种子...')

  try {
    const [existingSuper] = await db.select().from(user).where(eq(user.role, ROLES.SUPER)).limit(1)

    const [adminUser] = await db
      .select()
      .from(user)
      .where(eq(user.role, ROLES.ADMIN))
      .orderBy(asc(user.createdAt))
      .limit(1)

    const action = decideSeed(existingSuper?.id, adminUser?.id)

    if (action.type === 'skip') {
      console.log('✅ 系统已存在超级管理员，无需初始化')
      return
    }

    if (action.type === 'promote') {
      await db.update(user).set({ role: ROLES.SUPER }).where(eq(user.id, action.userId))
      console.log('✅ 现有管理员已提升为超级管理员！')
      return
    }

    const created = await auth.api.signUpEmail({
      body: {
        email: SUPER_EMAIL,
        password: SUPER_PASSWORD,
        name: SUPER_NAME,
      },
    })

    if (!created) {
      throw new Error('创建超级管理员失败')
    }

    await db
      .update(user)
      .set({
        name: SUPER_NAME,
        role: ROLES.SUPER,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, created.user.id))

    console.log('✅ 超级管理员种子账号创建成功！')
    console.log('📧 邮箱:', SUPER_EMAIL)
    console.log('🔑 密码:', SUPER_PASSWORD)
    console.log('⚠️  请在生产环境中立即修改密码！')
  } catch (error) {
    console.error('❌ 初始化超级管理员失败:', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

await seedSuper()
