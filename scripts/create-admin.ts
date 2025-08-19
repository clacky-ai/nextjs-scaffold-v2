import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { storage } from '../server/storage';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    const adminData = {
      id: nanoid(),
      username: 'admin',
      password: await bcrypt.hash('admin123456', 10),
      name: '系统管理员',
      email: 'admin@voting.com',
    };

    // 检查是否已存在
    const existingAdmin = await storage.getAdminUserByUsername(adminData.username);
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username:', adminData.username);
      console.log('Password: admin123456');
      return;
    }

    const admin = await storage.createAdminUser(adminData);
    console.log('Admin user created successfully!');
    console.log('Username:', admin.username);
    console.log('Password: admin123456');
    console.log('Email:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
