import { db } from '../lib/db'
import { adminUsers, votingSystemStatus } from '../lib/db/schema'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('🌱 开始种子数据初始化...')

    // 创建默认管理员账号
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const [admin] = await db.insert(adminUsers).values({
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员',
      email: 'admin@voting-system.com',
    }).returning()

    console.log('✅ 管理员账号创建成功:', admin.username)

    // 创建投票系统状态
    await db.insert(votingSystemStatus).values({
      isVotingEnabled: true,
      maxVotesPerUser: 3,
      updatedBy: admin.id,
    })

    console.log('✅ 投票系统状态初始化成功')
    console.log('🎉 种子数据初始化完成!')
    console.log('')
    console.log('管理员登录信息:')
    console.log('用户名: admin')
    console.log('密码: admin123456')
    console.log('登录地址: http://localhost:3000/admin/sign-in')

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error)
    process.exit(1)
  }
}

seed()
