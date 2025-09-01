import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma_client: PrismaClient | undefined;
}

// 获取数据库连接URL
function getDatabaseUrl(): string {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const username = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'default';
  const ssl = process.env.DB_SSL === 'true' ? '?sslmode=require' : '';

  return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl}`;
}

// 单例模式，避免重复创建连接
function createPrismaClient() {
  if (globalThis.__prisma_client) {
    return globalThis.__prisma_client;
  }

  const databaseUrl = getDatabaseUrl();

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // 在非生产环境下缓存连接，避免热重载时重复创建
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma_client = client;
  }

  return client;
}

// 导出 Prisma 客户端实例
export const db = createPrismaClient();

// 检查数据库连接
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // 执行一个简单的查询来测试连接
    await db.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error: any) {
    const errorMessage = error.code === 'ECONNREFUSED'
      ? `数据库连接被拒绝。请确保PostgreSQL服务正在运行并监听端口 ${process.env.DB_PORT || 5432}`
      : `数据库连接失败: ${error.message}`;

    return {
      connected: false,
      error: errorMessage
    };
  }
}

// 优雅关闭数据库连接
export async function disconnectDatabase() {
  try {
    await db.$disconnect();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error);
  }
}