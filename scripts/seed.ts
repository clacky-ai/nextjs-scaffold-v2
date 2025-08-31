import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';
import { nanoid } from 'nanoid';
import { db } from '../server/db/index';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function seedDatabase() {
  console.log('🌱 开始种子数据初始化...');

  // 1. 创建默认管理员账号（如果不存在）
  let admin;
  try {
    admin = await db.adminUser.create({
      data: {
        id: nanoid(),
        username: 'admin',
        password: await bcrypt.hash('admin123456', 12),
        name: '系统管理员',
        email: 'admin@test.com',
      }
    });
    console.log('✅ 管理员账号创建成功:', admin.username);
  } catch (error: any) {
    if (error.code === 'P2002') {
      // 管理员已存在，获取现有管理员
      const existingAdmin = await db.adminUser.findUnique({
        where: { username: 'admin' }
      });
      if (existingAdmin) {
        admin = existingAdmin;
        console.log('ℹ️ 管理员账号已存在:', admin.username);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  try {
    // 2. 创建默认用户
    console.log('创建默认用户...');
    const defaultUser = {
      id: nanoid(),
      email: 'test@test.com',
      password: await bcrypt.hash('123456', 10),
      realName: '张三',
      phone: '13800138001',
      organization: '科技公司A',
      department: '研发部',
      position: '高级工程师',
      isActive: true,
    };

    await db.user.create({
      data: defaultUser
    });
    console.log('✅ 默认用户创建成功:', defaultUser.email);
  } catch (error: any) {
    if (error.code === 'P2002') {
      // 用户已存在
      console.log('ℹ️ 测试用户账号已存在: test@test.com');
    } else {
      throw error;
    }
  }

  console.log('✅ 默认用户创建完成');

  console.log('🎉 种子数据初始化完成!');
  console.log('');
  console.log('默认登录信息:');
  console.log('管理员 - admin@test.com / admin123456');
  console.log('用户1 - test@test.com / 123456');
}

// 运行种子数据初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('种子数据初始化成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('种子数据初始化失败:', error);
      process.exit(1);
    });
}
