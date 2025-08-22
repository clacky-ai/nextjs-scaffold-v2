import { Express } from 'express';
import { createServer, type Server } from 'http';
import { routeAuthMiddleware } from '../middleware/route-auth';

// 直接导入各个路由文件
import userAuthRouter from './users/auth';
import userProjectsRouter from './users/projects';
import userVotesRouter from './users/votes';
import adminAuthRouter from './admin/auth';
import adminUsersRouter from './admin/users';
import adminProjectsRouter from './admin/projects';
import adminVotesRouter from './admin/votes';
import categoriesRouter from './categories';
import scoreDimensionsRouter from './score-dimensions';
import apiRouter from './api';


export function registerRoutes(app: Express): Server {
  // 应用全局路由认证中间件
  app.use(routeAuthMiddleware);

  // 通用 API
  app.use('/api', apiRouter);
  app.use('/api/health', apiRouter);
  
  // user 相关 API
  app.use('/api/auth', userAuthRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/projects', userProjectsRouter);
  app.use('/api/votes', userVotesRouter);
  app.use('/api/score-dimensions', scoreDimensionsRouter);

  // admin 相关 API
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/users', adminUsersRouter);
  app.use('/api/admin/projects', adminProjectsRouter);
  app.use('/api/admin/votes', adminVotesRouter);

  // 创建并返回 HTTP 服务器
  return createServer(app);
}
