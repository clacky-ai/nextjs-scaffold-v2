import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

export const JWT_SECRET = process.env.JWT_SECRET || 'user-secret-key-change-in-production';
export const ADMIN_JWT_SECRET = 'admin-secret-key-change-in-production';

export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:123456@127.0.0.1:5432/your_database_name';

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// WebSocket 配置
export const WEBSOCKET_PATH = process.env.WEBSOCKET_PATH || '/ws';
export const WEBSOCKET_CORS_ORIGIN = process.env.WEBSOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000';
