import { config } from 'dotenv'
import { resolve } from 'path'
import { db } from '../src/lib/db'
import { adminUsers, votingSystemStatus } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function seed() {
  try {
    console.log('🌱 开始种子数据初始化...')

    // 创建默认管理员账号（如果不存在）
    const hashedPassword = await bcrypt.hash('admin123456', 12)

    let admin;
    try {
      [admin] = await db.insert(adminUsers).values({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        email: 'admin@voting-system.com',
      }).returning()
      console.log('✅ 管理员账号创建成功:', admin.username)
    } catch (error: any) {
      if (error.cause?.code === '23505') {
        // 管理员已存在，获取现有管理员
        const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.username, 'admin')).limit(1)
        if (existingAdmin.length > 0) {
          admin = existingAdmin[0]
          console.log('ℹ️ 管理员账号已存在:', admin.username)
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    // 创建投票系统状态（如果不存在）
    try {
      await db.insert(votingSystemStatus).values({
        isVotingEnabled: true,
        maxVotesPerUser: 3,
        updatedBy: admin.id,
      })
      console.log('✅ 投票系统状态初始化成功')
    } catch (error: any) {
      if (error.cause?.code === '23505') {
        console.log('ℹ️ 投票系统状态已存在')
      } else {
        throw error
      }
    }

    console.log('🎉 种子数据初始化完成!')
    console.log('')
    console.log('管理员登录信息:')
    console.log('用户名: admin')
    console.log('密码: admin123456')
    console.log('登录地址: http://localhost:3000/admin/sign-in')

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error)
    process.exit(1)
  } finally {
    // 确保进程正常退出
    process.exit(0)
  }
}

seed()
