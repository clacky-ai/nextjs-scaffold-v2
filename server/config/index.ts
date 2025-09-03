import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

export const JWT_SECRET = process.env.JWT_SECRET || 'user-secret-key-change-in-production';
export const ADMIN_JWT_SECRET = 'admin-secret-key-change-in-production';

// 数据库配置
export const DB_NAME = process.env.DB_NAME || 'your_database_name';
export const DB_PASSWORD = process.env.DB_PASSWORD || '123456';
export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_PORT = process.env.DB_PORT || '5432';

// 构建数据库连接URL
export function buildDatabaseUrl(): string {
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

export const DATABASE_URL = buildDatabaseUrl();

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// WebSocket 配置
export const WEBSOCKET_PATH = process.env.WEBSOCKET_PATH || '/ws';
export const WEBSOCKET_CORS_ORIGIN = process.env.WEBSOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000';
