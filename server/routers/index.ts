import { Express } from 'express';
import { createServer, type Server } from 'http';
import { authRouter as userAuthRouter, projectsRouter, votesRouter } from './users';
import { authRouter as adminAuthRouter, users as adminUsersRouter, projects as adminProjectsRouter, votes as adminVotesRouter } from './admin';
import categoriesRouter from './categories';
import scoreDimensionsRouter from './score-dimensions';
import { authenticateToken } from '../middleware/auth';
import { authenticateAdminToken } from '../middleware/admin-auth';

export function registerRoutes(app: Express): Server {
  // 公开路由 (不需要认证)
  app.use('/api/auth', userAuthRouter);
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/categories', categoriesRouter);

  // 用户认证路由 (需要用户认证)
  app.use('/api/projects', authenticateToken, projectsRouter);
  app.use('/api/votes', authenticateToken, votesRouter);
  app.use('/api/score-dimensions', authenticateToken, scoreDimensionsRouter);

  // 管理员认证路由 (需要管理员认证)
  app.use('/api/admin/users', authenticateAdminToken, adminUsersRouter);
  app.use('/api/admin/projects', authenticateAdminToken, adminProjectsRouter);
  app.use('/api/admin/votes', authenticateAdminToken, adminVotesRouter);

  // 创建并返回 HTTP 服务器
  return createServer(app);
}
