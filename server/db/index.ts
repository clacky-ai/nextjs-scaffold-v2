import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma_client: PrismaClient | undefined;
}

// 单例模式，避免重复创建连接
function createPrismaClient() {
  if (globalThis.__prisma_client) {
    return globalThis.__prisma_client;
  }

  // 直接使用 DATABASE_URL 环境变量
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // 在非生产环境下缓存连接，避免热重载时重复创建
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma_client = client;
  }

  return client;
}

// 导出 Prisma Client 实例
export const db = createPrismaClient();

// 检查数据库连接
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // 使用 Prisma Client 执行一个简单的查询来测试连接
    await db.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接成功');
    return { connected: true };
  } catch (error: any) {
    const errorMessage = error.code === 'ECONNREFUSED'
      ? `数据库连接被拒绝。请确保PostgreSQL服务正在运行并检查 DATABASE_URL 配置`
      : `数据库连接失败: ${error.message}`;

    console.error('❌ 数据库连接错误:', {
      message: error.message,
      code: error.code,
    });

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