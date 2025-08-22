import { Request, Response, NextFunction } from 'express';
import { verifyUserToken } from './verify-user-token';
import { verifyAdminToken } from './verify-admin-token';

export interface AuthRequest extends Request {
  user?: any;
}

// 用户相关公开路径 - 在用户路径下但不需要认证
const PUBLIC_USER_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
];

// 管理员相关公开路径 - 在管理员路径下但不需要认证
const PUBLIC_ADMIN_PATHS = [
  '/api/admin/auth/login',
  '/api/admin/auth/register',
];

/**
 * 全局路由认证中间件
 * 根据路径自动判断是否需要认证以及需要什么类型的认证
 */
export const routeAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const normalizedPath = normalizePath(req.path);

  // 1. 首先检查是否是公开路径
  if (isPublicPath(normalizedPath)) {
    return next();
  }

  // 2. 检查是否需要管理员认证
  if (requiresAdminAuth(normalizedPath)) {
    return verifyAdminToken(req as AuthRequest, res, next);
  }

  // 3. 检查是否需要用户认证
  if (requiresUserAuth(normalizedPath)) {
    return verifyUserToken(req as AuthRequest, res, next);
  }

  // 4. 默认情况下不需要认证（公开路径）
  next();
};

/**
 * 检查路径是否是公开路径（任何类型的公开路径）
 * 注意：传入的路径应该已经被标准化
 */
function isPublicPath(path: string): boolean {
  return isUserPublicPath(path) || isAdminPublicPath(path);
}

/**
 * 检查路径是否在用户公开路径中
 */
function isUserPublicPath(path: string): boolean {
  return PUBLIC_USER_PATHS.includes(path);
}

/**
 * 检查路径是否在管理员公开路径中
 */
function isAdminPublicPath(path: string): boolean {
  return PUBLIC_ADMIN_PATHS.includes(path);
}

/**
 * 检查是否需要用户认证
 * 注意：公开路径的检查已经在主函数中完成，这里只需要判断路径规则
 */
function requiresUserAuth(path: string): boolean {
  // 所有以 /api/ 开头但不是管理员路径的都需要用户认证
  if (path.startsWith('/api/') && !path.startsWith('/api/admin/')) {
    return true;
  }

  return false;
}

/**
 * 检查是否需要管理员认证
 * 注意：公开路径的检查已经在主函数中完成，这里只需要判断路径规则
 */
function requiresAdminAuth(path: string): boolean {
  // 所有以 /api/admin/ 开头的路径都需要管理员认证
  if (path.startsWith('/api/admin/')) {
    return true;
  }

  return false;
}

/**
 * 标准化路径：移除尾部斜杠（但保留根路径 /）
 */
function normalizePath(path: string): string {
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}