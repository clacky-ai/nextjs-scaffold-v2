import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

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

async function createDatabase() {
  const dbName = getDatabaseName();

  // 连接到默认的postgres数据库
  const postgresUrl = getPostgresUrl();
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: postgresUrl,
      },
    },
  });

  try {
    // 检查数据库是否已存在
    const result = await prisma.$queryRaw<Array<{ exists: number }>>`
      SELECT 1 as exists FROM pg_database WHERE datname = ${dbName}
    `;

    if (result.length === 0) {
      // 创建数据库
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ 数据库 ${dbName} 创建成功`);
    } else {
      console.log(`ℹ️ 数据库 ${dbName} 已存在`);
    }
  } catch (error) {
    console.error('❌ 创建数据库失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDatabase();
