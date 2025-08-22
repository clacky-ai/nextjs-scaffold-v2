import { Request, Response, NextFunction } from 'express';
import { verifyUserToken } from './verify-user-token';
import { verifyAdminToken } from './verify-admin-token';

export interface AuthRequest extends Request {
  user?: any;
}

// 通用公开路径 - 完全不需要认证
const PUBLIC_COMMON_PATHS = [
  '/api',
  '/api/health',
  '/api/categories',
];

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
  const path = req.path;

  // 通用公开路径不需要认证
  if (isCommonPublicPath(path)) {
    return next();
  }

  // 检查是否需要管理员认证
  if (requiresAdminAuth(path)) {
    return verifyAdminToken(req as AuthRequest, res, next);
  }

  // 检查是否需要用户认证
  if (requiresUserAuth(path)) {
    return verifyUserToken(req as AuthRequest, res, next);
  }

  // 默认情况下不需要认证（公开路径）
  next();
};

/**
 * 检查路径是否在通用公开路径中
 */
function isCommonPublicPath(path: string): boolean {
  return PUBLIC_COMMON_PATHS.includes(path);
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
 */
function requiresUserAuth(path: string): boolean {
  // 用户公开路径不需要认证
  if (isUserPublicPath(path)) {
    return false;
  }

  // 所有以 /api/ 开头但不是管理员路径的都需要用户认证
  if (path.startsWith('/api/') && !path.startsWith('/api/admin/')) {
    return true;
  }

  return false;
}

/**
 * 检查是否需要管理员认证
 */
function requiresAdminAuth(path: string): boolean {
  // 管理员公开路径不需要认证
  if (isAdminPublicPath(path)) {
    return false;
  }

  // 所有以 /api/admin/ 开头的路径都需要管理员认证
  if (path.startsWith('/api/admin/')) {
    return true;
  }

  return false;
}

/**
 * 获取所有公开路径列表
 */
export function getAllPublicPaths() {
  return {
    common: [...PUBLIC_COMMON_PATHS],
    user: [...PUBLIC_USER_PATHS],
    admin: [...PUBLIC_ADMIN_PATHS],
  };
}
