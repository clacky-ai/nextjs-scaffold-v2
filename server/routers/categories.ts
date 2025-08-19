import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// 获取所有项目分类
router.get('/', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

export default router;
