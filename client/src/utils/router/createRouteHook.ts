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
    
    return {
      location,
      
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
      
      // 获取当前页面信息
      getPageInfo: (): PageInfo => {
        return RouteUtils.getPageInfo(location, routeConfig, otherRouteConfig);
      },

      // 获取当前路由键
      getCurrentRouteKey: (): string | null => {
        return routeConfig.getRouteKeyFromPath(location);
      },
      
      // 路由配置
      routes: routeConfig
    };
  };
}
