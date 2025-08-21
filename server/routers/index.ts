import { Express } from 'express';
import { createServer, type Server } from 'http';
import { authRouter as userAuthRouter } from './users';
import { authRouter as adminAuthRouter, users as adminUsersRouter } from './admin';
import { authenticateToken } from '../middleware/auth';
import { authenticateAdminToken } from '../middleware/admin-auth';

export function registerRoutes(app: Express): Server {
  // 公开路由 (不需要认证)
  app.use('/api/auth', userAuthRouter);
  app.use('/api/admin/auth', adminAuthRouter);

  // 用户认证路由 (需要用户认证)

  // 管理员认证路由 (需要管理员认证)
  app.use('/api/admin/users', authenticateAdminToken, adminUsersRouter);

  // 创建并返回 HTTP 服务器
  return createServer(app);
}
