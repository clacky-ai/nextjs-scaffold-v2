import { Express } from 'express';
import { createServer, type Server } from 'http';
import authRouter from './auth';
import projectsRouter from './projects';
import categoriesRouter from './categories';
import votesRouter from './votes';
import scoreDimensionsRouter from './score-dimensions';

export function registerRoutes(app: Express): Server {
  // 注册所有路由
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/votes', votesRouter);
  app.use('/api/score-dimensions', scoreDimensionsRouter);

  // 创建并返回 HTTP 服务器
  return createServer(app);
}
