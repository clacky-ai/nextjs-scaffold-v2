import { useNavigate, useLocation } from 'react-router';
import { generatePath, matchPath } from 'react-router';
import { routeConfig } from '@/router';
import { extractRouteMap, generateRouteKeys } from '@/utils/router/routeMapper';

// 延迟加载路由配置以避免循环依赖
let allRoutes: Record<string, string> | null = null;
let ROUTE_KEYS: Record<string, string> | null = null;

function getRouteMap() {
  if (allRoutes === null) {
    allRoutes = extractRouteMap(routeConfig);
    ROUTE_KEYS = generateRouteKeys(allRoutes);
  }
  return allRoutes;
}

function getRouteKeys() {
  getRouteMap(); // 确保已初始化
  return ROUTE_KEYS!;
}

// 导出路由键常量（延迟计算）
export { getRouteKeys as ROUTE_KEYS };

// 路由键类型
export type RouteKey = string;

/**
 * 通用路由 Hook
 */
export function useRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeMap = getRouteMap();

  // 获取当前路由键
  const getCurrentRouteKey = (): RouteKey | null => {
    const currentPath = location.pathname;
    for (const [key, path] of Object.entries(routeMap)) {
      // 使用 React Router 的 matchPath 进行路径匹配
      if (currentPath === path || matchPath({ path }, currentPath)) {
        return key as RouteKey;
      }
    }
    return null;
  };

  // 通用导航方法
  const navigateToRoute = (
    routeKey: RouteKey,
    params?: {
      path?: Record<string, string>;
      query?: Record<string, string>;
    }
  ) => {
    const template = routeMap[routeKey];
    if (!template) {
      console.warn(`Unknown route key: ${routeKey}`);
      return;
    }

    let pathname = template;
    
    // 处理路径参数
    if (params?.path) {
      pathname = generatePath(template, params.path);
    }

    // 处理查询参数
    let search = '';
    if (params?.query) {
      search = new URLSearchParams(params.query).toString();
    }

    navigate({
      pathname,
      search
    });
  };

  // 获取路径（不导航）
  const getPath = (
    routeKey: RouteKey,
    params?: {
      path?: Record<string, string>;
      query?: Record<string, string>;
    }
  ): string => {
    const template = routeMap[routeKey];
    if (!template) {
      console.warn(`Unknown route key: ${routeKey}`);
      return '/';
    }

    let pathname = template;
    
    // 处理路径参数
    if (params?.path) {
      pathname = generatePath(template, params.path);
    }

    // 处理查询参数
    if (params?.query) {
      const queryString = new URLSearchParams(params.query).toString();
      return `${pathname}?${queryString}`;
    }

    return pathname;
  };

  // 检查是否为当前路由
  const isCurrentRoute = (routeKey: RouteKey): boolean => {
    return getCurrentRouteKey() === routeKey;
  };

  return {
    // 核心导航方法
    navigate: navigateToRoute,
    getPath,

    // 状态获取
    currentRouteKey: getCurrentRouteKey(),
    location: location.pathname,
    isCurrentRoute,

    // 路由信息
    routeMap,
    availableRoutes: Object.keys(routeMap) as RouteKey[],
  };
}

