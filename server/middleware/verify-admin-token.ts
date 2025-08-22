import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { storage } from '../storage';
import { type AuthRequest } from './route-auth';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production";

export const verifyAdminToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 首先尝试从cookie中获取token
    let token = req.cookies?.admin_token;
    
    // 如果cookie中没有，再尝试从Authorization header获取
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({ message: '管理员访问令牌缺失' });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as { adminUserId: string };
    
    // 获取管理员用户信息
    const adminUser = await storage.getAdminUser(decoded.adminUserId);
    if (!adminUser) {
      return res.status(401).json({ message: '管理员用户不存在' });
    }

    req.user = adminUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: '管理员访问令牌无效' });
    }
    
    console.error('管理员认证中间件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};