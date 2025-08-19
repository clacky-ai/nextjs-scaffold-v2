import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    realName: string;
  };
}

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 生成JWT token
export function generateToken(payload: { id: string; email: string; realName: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 验证JWT token
export function verifyToken(token: string): { id: string; email: string; realName: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; realName: string };
  } catch (error) {
    return null;
  }
}

// 认证中间件
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: '访问令牌缺失' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ message: '无效的访问令牌' });
    return;
  }

  // 验证用户是否仍然存在且活跃
  const user = await storage.getUser(decoded.id);
  if (!user || !user.isActive) {
    res.status(403).json({ message: '用户不存在或已被禁用' });
    return;
  }

  req.user = decoded;
  next();
}

// 可选认证中间件（用于获取当前用户信息，但不强制要求登录）
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = await storage.getUser(decoded.id);
      if (user && user.isActive) {
        req.user = decoded;
      }
    }
  }

  next();
}
