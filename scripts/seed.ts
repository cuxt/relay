/**
 * 数据库种子脚本 - 创建初始管理员用户
 *
 * 运行方式: bun run db:seed
 */

import { db } from '../src/lib/db'
import { user, config } from '../src/lib/db/schema'
import { auth } from '../src/lib/auth/auth'
import { eq } from 'drizzle-orm'

async function seed() {
  const adminEmail = 'admin@example.com'
  const adminPassword = '12345678'

  console.log('🌱 开始数据库种子...')

  try {
    const existingUsers = await db.select().from(user).limit(1)

    if (existingUsers.length > 0) {
      console.log('⚠️  数据库中已存在用户，跳过种子数据创建')
      process.exit(0)
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: '管理员',
      },
    })

    if (!result) {
      throw new Error('创建用户失败')
    }

    await db
      .update(user)
      .set({
        role: 'admin',
        emailVerified: true,
      })
      .where(eq(user.email, adminEmail))

    console.log('✅ 管理员用户创建成功！')
    console.log('📧 邮箱:', adminEmail)
    console.log('🔑 密码:', adminPassword)
    console.log('⚠️  请在生产环境中立即修改密码！')

    // 插入默认站点配置
    await db
      .insert(config)
      .values([
        { key: 'site_name', value: 'Tanstack Template' },
        { key: 'icon_type', value: 'lucide' },
        { key: 'icon_value', value: 'bubbles' },
      ])
      .onConflictDoNothing()

    console.log('✅ 默认站点配置已创建')

    process.exit(0)
  } catch (error) {
    console.error('❌ 创建管理员用户失败:', error)
    process.exit(1)
  }
}

seed()
