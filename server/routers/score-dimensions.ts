import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// 获取所有评分维度
router.get('/', async (req, res) => {
  try {
    const dimensions = await storage.getScoreDimensions();
    res.json({ dimensions });
  } catch (error) {
    console.error('获取评分维度错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
