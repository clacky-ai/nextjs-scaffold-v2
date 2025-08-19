import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../../storage';
import { authenticateAdminToken, type AuthenticatedAdminRequest } from '../../middleware/admin-auth';

const router = Router();

// 获取所有用户列表
router.get('/', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const users = await storage.getAllUsers();
    
    // 转换数据格式以匹配前端期望的格式
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.realName || user.email,
      email: user.email,
      phone: user.phone,
      team: user.organization || user.department,
      isBlocked: false, // TODO: 添加用户封禁状态字段到数据库
      createdAt: user.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 更新用户状态（封禁/解封）
router.patch('/:userId/status', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = z.object({
      isBlocked: z.boolean()
    }).parse(req.body);

    // TODO: 实现用户封禁/解封逻辑
    // 目前只是模拟响应，需要在数据库中添加相应字段
    console.log(`${isBlocked ? '封禁' : '解封'}用户: ${userId}`);

    res.json({
      success: true,
      message: `用户已${isBlocked ? '封禁' : '解封'}`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 获取用户详情
router.get('/:userId', authenticateAdminToken, async (req: AuthenticatedAdminRequest, res) => {
  try {
    const { userId } = req.params;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const formattedUser = {
      id: user.id,
      name: user.realName || user.email,
      email: user.email,
      phone: user.phone,
      team: user.organization || user.department,
      isBlocked: false, // TODO: 添加用户封禁状态字段到数据库
      createdAt: user.createdAt.toISOString(),
    };

    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

export default router;
