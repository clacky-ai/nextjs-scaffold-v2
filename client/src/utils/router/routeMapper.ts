import { RouteConfig } from "@/utils/router/routes";

/**
 * 从路由配置中提取路由映射
 */
export function extractRouteMap(routes: RouteConfig[], basePath = ''): Record<string, string> {
  const routeMap: Record<string, string> = {};

  function processRoute(route: RouteConfig, parentPath = '') {
    let currentPath = parentPath;
    
    if (route.path) {
      currentPath = parentPath + '/' + route.path;
    } else if (route.index) {
      currentPath = parentPath;
    }
    
    // 清理路径（移除重复的斜杠）
    currentPath = currentPath.replace(/\/+/g, '/');
    
    // 添加到映射中
    if (route.id) {
      routeMap[route.id] = currentPath;
    }
    
    // 递归处理子路由
    if (route.children) {
      route.children.forEach(child => {
        processRoute(child, currentPath);
      });
    }
  }

  routes.forEach(route => {
    processRoute(route, basePath);
  });

  return routeMap;
}

/**
 * 过滤特定前缀的路由
 */
export function filterRoutesByPrefix(routeMap: Record<string, string>, prefix: string): Record<string, string> {
  const filtered: Record<string, string> = {};
  
  Object.entries(routeMap).forEach(([key, path]) => {
    if (key.startsWith(prefix)) {
      // 移除前缀，例如 "admin-dashboard" -> "dashboard"
      const shortKey = key.replace(new RegExp(`^${prefix}-?`), '');
      filtered[shortKey] = path;
    }
  });
  
  return filtered;
}

/**
 * 生成路由常量，用于类型检查
 */
export function generateRouteKeys<T extends Record<string, string>>(routeMap: T): {
  [K in keyof T]: K
} {
  const keys = {} as any;
  Object.keys(routeMap).forEach(key => {
    keys[key] = key;
  });
  return keys;
}