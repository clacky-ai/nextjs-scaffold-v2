import { Express } from 'express';
import { createServer, type Server } from 'http';
import { routeAuthMiddleware } from '../middleware/route-auth';

// 直接导入各个路由文件
import userAuthRouter from './users/auth';
import adminAuthRouter from './admin/auth';
import adminUsersRouter from './admin/users';
import apiRouter from './api';


export function registerRoutes(app: Express): Server {
  // 先注册公开 API（不需要认证）
  app.use('/api', apiRouter);

  // 然后应用全局路由认证中间件
  app.use(routeAuthMiddleware);
  
  // user 相关 API
  app.use('/api/auth', userAuthRouter);

  // admin 相关 API
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/users', adminUsersRouter);

  // 创建并返回 HTTP 服务器
  return createServer(app);
}
