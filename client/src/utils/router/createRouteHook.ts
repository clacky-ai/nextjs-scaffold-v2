import { useLocation } from 'wouter';
import { RouteConfig, PageInfo } from './RouteConfig';
import { PathFormatter, RouteParams } from './PathFormatter';
import { RouteUtils } from './RouteUtils';

// 路由Hook选项
export interface RouteHookOptions {
  queryParams?: RouteParams;
  style?: 'path' | 'query';
  replace?: boolean;
}

// 基础路由Hook
export function createRouteHook<T extends RouteConfig>(
  routeConfig: T,
  otherRouteConfig?: RouteConfig
) {
  return function useRoutes() {
    const [location, navigate] = useLocation();
    
    // 计算当前路由键，这样会在 location 变化时重新计算
    const currentRouteKey = routeConfig.getRouteKeyFromPath(location);
    const pageInfo = RouteUtils.getPageInfo(location, routeConfig);
    
    return {
      location,
      currentRouteKey,
      pageInfo,
      
      // 通用导航方法
      navigate: (
        routeKey: keyof T['routes'],
        params: RouteParams = {},
        options?: RouteHookOptions
      ) => {
        const route = routeConfig.routes[routeKey as string];
        if (!route) {
          throw new Error(`Route "${String(routeKey)}" not found`);
        }
        
        const formattedPath = PathFormatter.formatPath(
          route.fullPath,
          params,
          options?.queryParams || {},
          options?.style || 'path'
        );
        
        if (options?.replace) {
          navigate(formattedPath, { replace: true });
        } else {
          navigate(formattedPath);
        }
      },
      
      // 获取路径（不导航）
      getPath: (
        routeKey: keyof T['routes'],
        params: RouteParams = {},
        options?: Omit<RouteHookOptions, 'replace'>
      ) => {
        const route = routeConfig.routes[routeKey as string];
        if (!route) {
          throw new Error(`Route "${String(routeKey)}" not found`);
        }
        
        return PathFormatter.formatPath(
          route.fullPath,
          params,
          options?.queryParams || {},
          options?.style || 'path'
        );
      },
      
      // 检查当前路由
      isCurrentRoute: (routeKey: keyof T['routes']) => {
        return RouteUtils.isCurrentRoute(location, String(routeKey), routeConfig);
      },

      // 获取当前路由键（向后兼容）
      getCurrentRouteKey: (): string | null => {
        return currentRouteKey;
      },
      
      // 获取当前页面信息（向后兼容）
      getPageInfo: (): PageInfo => {
        return pageInfo;
      },
      
      // 路由配置
      routes: routeConfig
    };
  };
}
