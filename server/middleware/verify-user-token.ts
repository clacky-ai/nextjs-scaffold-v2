import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { storage } from '../storage';
import { AuthRequest } from './route-auth';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const verifyUserToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 首先尝试从cookie中获取token
    let token = req.cookies?.user_token;

    // 如果cookie中没有，再尝试从Authorization header获取
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({ message: '访问令牌缺失' });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // 获取用户信息
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: '账户已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: '访问令牌无效' });
    }
    
    console.error('认证中间件错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
