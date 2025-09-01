import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const execAsync = promisify(exec);

// 数据库配置
function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  return process.env.DATABASE_URL;
}

function getPostgresUrl() {
  const databaseUrl = getDatabaseUrl();
  // 将数据库名替换为 postgres 来连接到默认数据库
  return databaseUrl.replace(/\/[^\/]+(\?|$)/, '/postgres$1');
}

function getDatabaseName() {
  const databaseUrl = getDatabaseUrl();
  // 从 DATABASE_URL 中提取数据库名
  const match = databaseUrl.match(/\/([^\/\?]+)(\?|$)/);
  return match ? match[1] : 'default';
}

const dbName = getDatabaseName();

// 创建数据库
async function createDatabase() {
  console.log('🔧 步骤1: 创建数据库...');

  // 连接到 postgres 数据库来创建目标数据库
  const postgresUrl = getPostgresUrl();

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: postgresUrl,
      },
    },
  });

  try {
    const result = await prisma.$queryRaw<Array<{ exists: number }>>`
      SELECT 1 as exists FROM pg_database WHERE datname = ${dbName}
    `;

    if (result.length === 0) {
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ 数据库 ${dbName} 创建成功`);
    } else {
      console.log(`ℹ️ 数据库 ${dbName} 已存在`);
    }
  } catch (error) {
    console.error('❌ 创建数据库失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行数据库迁移
async function runMigrations() {
  console.log('🔧 步骤2: 初始化数据表...');

  try {
    // 生成 Prisma 客户端
    console.log('生成 Prisma 客户端...');
    const generateResult = await execAsync('npx prisma generate', {
      cwd: process.cwd()
    });
    if (generateResult.stdout) {
      console.log(generateResult.stdout);
    }

    // 执行数据库迁移
    console.log('执行数据库迁移...');
    const migrateResult = await execAsync('npx prisma migrate deploy', {
      cwd: process.cwd()
    });
    if (migrateResult.stdout) {
      console.log(migrateResult.stdout);
    }

    console.log('✅ 数据表初始化成功');
  } catch (error) {
    console.error('❌ 数据表初始化失败:', error);
    throw error;
  }
}

// 执行种子数据
async function runSeed() {
  console.log('🔧 步骤3: 写入种子数据...');
  
  try {
    const seedResult = await execAsync('npm run db:seed', {
      cwd: process.cwd(),
      timeout: 30000 // 30秒超时
    });
    
    if (seedResult.stdout) {
      console.log(seedResult.stdout);
    }
    if (seedResult.stderr) {
      console.error(seedResult.stderr);
    }
    
    console.log('✅ 种子数据写入成功');
  } catch (error) {
    console.error('❌ 种子数据写入失败:', error);
    // 如果是数据库连接问题，提供更友好的错误信息
    if (error.message && error.message.includes('password authentication failed')) {
      console.error('请检查数据库连接配置，确保数据库服务已启动且密码正确');
    }
    throw error;
  }
}

// 主函数
async function initializeDatabase() {
  console.log('🚀 开始数据库完整初始化...');
  console.log(`目标数据库: ${dbName}`);
  console.log(`数据库连接: ${getDatabaseUrl()}`);
  console.log('================================');
  
  try {
    // 步骤1: 创建数据库
    await createDatabase();
    console.log('');
    
    // 步骤2: 初始化数据表
    await runMigrations();
    console.log('');
    
    // 步骤3: 写入种子数据
    await runSeed();
    console.log('');
    
    console.log('🎉 数据库初始化完成!');
    console.log('================================');
    console.log('现在你可以启动应用程序了:');
    console.log('npm run dev');
    console.log('');
    console.log('管理员登录信息:');
    console.log('用户名: admin');
    console.log('密码: admin123456');
    console.log('登录地址: http://localhost:3000/admin/sign-in');
    
  } catch (error) {
    console.error('💥 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
数据库初始化脚本

用法:
  npx tsx scripts/init-db.ts [选项]

选项:
  --help, -h        显示帮助信息
  --force, -f       强制重新初始化（会删除现有数据）

环境变量:
  DATABASE_URL     PostgreSQL 连接字符串
                   格式: postgresql://username:password@host:port/database

示例:
  npx tsx scripts/init-db.ts
  DATABASE_URL=postgresql://postgres:password@localhost:5432/my_voting_system npx tsx scripts/init-db.ts
  `);
  process.exit(0);
}

// 处理强制模式和运行初始化
async function main() {
  if (args.includes('--force') || args.includes('-f')) {
    console.log('⚠️ 强制模式：将删除现有数据库重新创建');

    const postgresUrl = getPostgresUrl();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: postgresUrl,
        },
      },
    });

    try {
      await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
      console.log(`🗑️ 已删除现有数据库: ${dbName}`);
    } catch (error) {
      console.log('数据库不存在或删除失败，继续执行...');
    } finally {
      await prisma.$disconnect();
    }
  }

  // 运行初始化
  await initializeDatabase();
}

main().catch((error) => {
  console.error('💥 初始化过程中发生错误:', error);
  process.exit(1);
});