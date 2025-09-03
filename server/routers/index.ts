import { Express } from 'express';
import { type Server } from 'http';
import { routeAuthMiddleware } from '../middleware/route-auth';

// 直接导入各个路由文件
import userAuthRouter from './users/auth';
import userProjectsRouter from './users/projects';
import userVotesRouter from './users/votes';
import adminAuthRouter from './admin/auth';
import adminUsersRouter from './admin/users';
import adminProjectsRouter from './admin/projects';
import adminVotesRouter from './admin/votes';
import adminProfileRouter from './admin/profile';
import categoriesRouter from './categories';
import scoreDimensionsRouter from './score-dimensions';
import apiRouter from './api';


export function registerRoutes(app: Express, server?: Server): Promise<void> {
  // 先注册公开 API（不需要认证）
  app.use('/api', apiRouter);
  app.use('/api/categories', categoriesRouter);

  // 然后应用全局路由认证中间件
  app.use(routeAuthMiddleware);
  
  // user 相关 API
  app.use('/api/auth', userAuthRouter);
  app.use('/api/projects', userProjectsRouter);
  app.use('/api/votes', userVotesRouter);
  app.use('/api/score-dimensions', scoreDimensionsRouter);

  // admin 相关 API
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/users', adminUsersRouter);
  app.use('/api/admin/projects', adminProjectsRouter);
  app.use('/api/admin/votes', adminVotesRouter);
  app.use('/api/admin/profile', adminProfileRouter);

  // 如果没有传入 server，这是向后兼容的处理
  return Promise.resolve();
}
