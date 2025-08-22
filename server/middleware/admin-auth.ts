import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production";

// Admin User type
type AdminUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: AdminUser;
}

export const authenticateAdminToken = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
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

    req.adminUser = adminUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: '管理员访问令牌无效' });
    }
    
    console.error('管理员认证中间件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 中间件：确保只有管理员路由才能访问
export const requireAdminPath = (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/admin')) {
    return res.status(403).json({ message: '访问被拒绝：需要管理员权限' });
  }
  next();
};
