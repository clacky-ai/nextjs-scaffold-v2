import { NextRequest, NextResponse } from "next/server";

// 端配置接口
interface EndpointConfig {
  name: string;
  pathPrefix: string;
  apiPrefix: string;
  cookieName: string;
  loginPath: string;
  publicPaths: string[];
  publicApiPaths: string[];
  authApiPaths: string[];  // 认证相关的 API（登录/注册）
  hasSecureCookie: boolean;
}

// 全局公开 API 配置
const GLOBAL_PUBLIC_APIS = [
  '/',
  '/api/ping',
  '/api/health',
  '/api/status'
];

// 认证检查结果
type AuthResult = 
  | { type: 'allow' }
  | { type: 'redirect', url: string }
  | { type: 'unauthorized' }  // 用于 API 返回 401

// 端配置表 - 将通过代码片段动态填充
const ENDPOINT_CONFIGS: EndpointConfig[] = [
  // 端配置将在这里通过代码片段添加
];

// 检查是否为全局公开路径
function isGlobalPublicPath(pathname: string): boolean {
  return GLOBAL_PUBLIC_APIS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
}

// 通用认证检查函数
function checkEndpointAuth(
  req: NextRequest, 
  config: EndpointConfig, 
  pathname: string,
  isApiPath: boolean
): AuthResult {
  // 检查是否为公开路径
  const publicPaths = isApiPath ? config.publicApiPaths : config.publicPaths;
  const authPaths = isApiPath ? config.authApiPaths : [];
  
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  if (isPublicPath || isAuthPath) {
    return { type: 'allow' };
  }

  // 检查认证 token
  let token = req.cookies.get(config.cookieName)?.value;
  
  // 如果支持安全 cookie，也检查安全版本
  if (config.hasSecureCookie && !token) {
    token = req.cookies.get(`__Secure-${config.cookieName}`)?.value;
  }

  if (!token) {
    if (isApiPath) {
      return { type: 'unauthorized' };
    } else {
      return { 
        type: 'redirect', 
        url: config.loginPath 
      };
    }
  }

  return { type: 'allow' };
}

// 路径匹配器：找到匹配的端配置
function findMatchingEndpoint(pathname: string): { config: EndpointConfig; isApiPath: boolean } | null {
  // 按路径前缀长度排序，确保更具体的路径优先匹配
  const sortedConfigs = ENDPOINT_CONFIGS.sort((a, b) => 
    b.pathPrefix.length - a.pathPrefix.length
  );

  for (const config of sortedConfigs) {
    // 优先检查 API 路径
    if (pathname.startsWith(config.apiPrefix)) {
      return { config, isApiPath: true };
    }
    
    // 再检查页面路径
    if (pathname.startsWith(config.pathPrefix)) {
      return { config, isApiPath: false };
    }
  }

  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 检查全局公开路径
  if (isGlobalPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 查找匹配的端配置
  const matchResult = findMatchingEndpoint(pathname);
  
  if (!matchResult) {
    // 没有匹配的端，默认拒绝访问未知的 API 路径
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'API endpoint not found' }, 
        { status: 404 }
      );
    }
    // 非 API 路径允许访问
    return NextResponse.next();
  }

  const { config, isApiPath } = matchResult;

  // 执行对应端的认证检查
  const authResult = checkEndpointAuth(req, config, pathname, isApiPath);

  // 根据检查结果返回响应
  switch (authResult.type) {
    case 'allow':
      return NextResponse.next();
    case 'redirect':
      return NextResponse.redirect(new URL(authResult.url, req.url));
    case 'unauthorized':
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    default:
      return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};