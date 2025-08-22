import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __db_client: postgres.Sql<{}> | undefined;
  var __db_instance: ReturnType<typeof drizzle> | undefined;
}

// 获取数据库连接配置（延迟获取环境变量）
function getDbConfig() {
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "default",
    ssl: process.env.DB_SSL === "true",
    prepare: false,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || "10"), // 最大连接数
    idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || "20"), // 空闲超时时间（秒）
    max_lifetime: parseInt(process.env.DB_MAX_LIFETIME || "1800"), // 连接最大生存时间（秒）
  };
}

// 单例模式，避免重复创建连接
function createDbClient() {
  if (globalThis.__db_client) {
    return globalThis.__db_client;
  }

  const dbConfig = getDbConfig();
  const client = postgres(dbConfig);

  // 监听连接错误
  client.listen("connect", () => {
    console.log("✅ 数据库连接成功");
  });

  client.listen("error", (err: any) => {
    console.error("❌ 数据库连接错误:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
    });
  });

  // 在非生产环境下缓存连接，避免热重载时重复创建
  if (process.env.NODE_ENV !== "production") {
    globalThis.__db_client = client;
  }

  return client;
}

// 延迟初始化数据库实例
function getDb() {
  if (globalThis.__db_instance) {
    return globalThis.__db_instance;
  }

  const client = createDbClient();
  const dbInstance = drizzle(client, { schema });

  // 在非生产环境下缓存实例
  if (process.env.NODE_ENV !== "production") {
    globalThis.__db_instance = dbInstance;
  }

  return dbInstance;
}

// 导出一个getter函数而不是直接导出实例
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const dbInstance = getDb();
    return dbInstance[prop as keyof typeof dbInstance];
  }
});

// 检查数据库连接
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  let client: any = null;
  try {
    const dbConfig = getDbConfig();
    // 创建一个临时客户端用于测试，不使用全局缓存
    client = postgres({
      ...dbConfig,
      max: 1, // 只使用一个连接进行测试
      idle_timeout: 5, // 5秒超时
      connect_timeout: 5, // 5秒连接超时
    });

    // 执行一个简单的查询来测试连接
    await client`SELECT 1`;
    return { connected: true };
  } catch (error: any) {
    const errorMessage = error.code === 'ECONNREFUSED'
      ? `数据库连接被拒绝。请确保PostgreSQL服务正在运行并监听端口 ${process.env.DB_PORT || 5432}`
      : `数据库连接失败: ${error.message}`;

    return {
      connected: false,
      error: errorMessage
    };
  } finally {
    // 确保关闭测试连接
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // 忽略关闭连接时的错误
      }
    }
  }
}