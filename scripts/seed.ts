import { config } from 'dotenv'
import { resolve } from 'path'
import { nanoid } from 'nanoid'
import bcrypt from 'bcrypt'
import { db } from '../server/db/index'
import {
  users,
  categories,
  scoreDimensions,
  votingSessions,
  type InsertUser,
  type InsertCategory,
  type InsertScoreDimension,
  type InsertVotingSession
} from '../server/db/schema'

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function seedDatabase() {
  console.log('🌱 开始种子数据初始化...')

  try {
    // 1. 创建默认管理员用户
    console.log('创建默认用户...')
    const hashedPassword = await bcrypt.hash('admin123456', 10)

    const defaultUsers: InsertUser[] = [
      {
        id: nanoid(),
        email: 'admin@voting.com',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        organization: '系统',
        department: '技术部',
        position: '管理员',
        isActive: true,
      },
      {
        id: nanoid(),
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 10),
        realName: '张三',
        phone: '13800138001',
        organization: '科技公司A',
        department: '研发部',
        position: '高级工程师',
        isActive: true,
      },
      {
        id: nanoid(),
        email: 'user2@example.com',
        password: await bcrypt.hash('password123', 10),
        realName: '李四',
        phone: '13800138002',
        organization: '科技公司B',
        department: '产品部',
        position: '产品经理',
        isActive: true,
      }
    ]

    await db.insert(users).values(defaultUsers).onConflictDoNothing()
    console.log('✅ 默认用户创建完成')

    // 2. 创建项目分类
    console.log('创建项目分类...')
    const defaultCategories: InsertCategory[] = [
      {
        id: nanoid(),
        name: 'Web应用',
        description: '基于Web技术的应用程序',
        color: '#3B82F6',
        isActive: true,
      },
      {
        id: nanoid(),
        name: '移动应用',
        description: 'iOS、Android等移动端应用',
        color: '#10B981',
        isActive: true,
      },
      {
        id: nanoid(),
        name: '人工智能',
        description: 'AI/ML相关项目',
        color: '#8B5CF6',
        isActive: true,
      },
      {
        id: nanoid(),
        name: '物联网',
        description: 'IoT设备和系统',
        color: '#F59E0B',
        isActive: true,
      },
      {
        id: nanoid(),
        name: '区块链',
        description: '区块链和加密货币相关',
        color: '#EF4444',
        isActive: true,
      }
    ]

    await db.insert(categories).values(defaultCategories).onConflictDoNothing()
    console.log('✅ 项目分类创建完成')

    // 3. 创建评分维度
    console.log('创建评分维度...')
    const defaultDimensions: InsertScoreDimension[] = [
      {
        id: nanoid(),
        name: '技术创新性',
        description: '项目在技术方面的创新程度和先进性',
        maxScore: 10,
        weight: '1.20',
        sortOrder: 1,
        isActive: true,
      },
      {
        id: nanoid(),
        name: '实用价值',
        description: '项目的实际应用价值和市场前景',
        maxScore: 10,
        weight: '1.15',
        sortOrder: 2,
        isActive: true,
      },
      {
        id: nanoid(),
        name: '完成度',
        description: '项目的完整性和功能实现程度',
        maxScore: 10,
        weight: '1.10',
        sortOrder: 3,
        isActive: true,
      },
      {
        id: nanoid(),
        name: '用户体验',
        description: '界面设计和用户交互体验',
        maxScore: 10,
        weight: '1.05',
        sortOrder: 4,
        isActive: true,
      },
      {
        id: nanoid(),
        name: '展示效果',
        description: '项目演示和展示的效果',
        maxScore: 10,
        weight: '1.00',
        sortOrder: 5,
        isActive: true,
      }
    ]

    await db.insert(scoreDimensions).values(defaultDimensions).onConflictDoNothing()
    console.log('✅ 评分维度创建完成')

    // 4. 创建默认投票会话
    console.log('创建默认投票会话...')
    const now = new Date()
    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 明天开始
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 一周后结束

    const defaultSession: InsertVotingSession = {
      id: nanoid(),
      name: '2024年度创新项目评选',
      description: '年度最具创新性和实用价值的项目评选活动',
      startTime,
      endTime,
      maxVotesPerUser: 3,
      isActive: true,
      allowSelfVoting: false,
    }

    await db.insert(votingSessions).values([defaultSession]).onConflictDoNothing()
    console.log('✅ 默认投票会话创建完成')

    console.log('🎉 种子数据初始化完成!')
    console.log('')
    console.log('默认登录信息:')
    console.log('管理员 - admin@voting.com / admin123456')
    console.log('用户1 - user1@example.com / password123')
    console.log('用户2 - user2@example.com / password123')

  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error)
    throw error
  }
}

// 运行种子数据初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('种子数据初始化成功完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('种子数据初始化失败:', error)
      process.exit(1)
    })
}
