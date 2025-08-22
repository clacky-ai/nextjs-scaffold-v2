import { Router } from 'express';

const router = Router();

// API 根路径
router.get('/', (req, res) => {
  res.json({
    message: 'API Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 健康检查路径
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
