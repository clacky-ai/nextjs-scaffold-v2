import { RouteConfig } from './RouteConfig';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbConfig {
  // 自定义面包屑构建函数
  build?: (params: Record<string, string>) => BreadcrumbItem[];
  // 是否禁用自动推导
  disableAutoInfer?: boolean;
  // 自定义父路由
  parent?: string;
  // 动态标题生成函数
  dynamicTitle?: (params: Record<string, string>) => string;
}

export class BreadcrumbBuilder {
  constructor(private routeConfig: RouteConfig) {}

  /**
   * 构建面包屑
   * @param currentPath 当前完整路径
   * @param routeKey 匹配到的路由键
   * @returns 面包屑数组
   */
  build(currentPath: string, routeKey: string): BreadcrumbItem[] {
    const route = this.routeConfig.routes[routeKey];
    if (!route) return [];

    // 获取路由的面包屑配置
    const breadcrumbConfig = (route as any).breadcrumb as BreadcrumbConfig | undefined;

    // 如果有自定义构建函数，使用自定义构建
    if (breadcrumbConfig?.build) {
      const params = this.extractParams(currentPath, route.fullPath);
      return breadcrumbConfig.build(params);
    }

    // 如果禁用自动推导，只返回当前页面
    if (breadcrumbConfig?.disableAutoInfer) {
      return [{ label: this.getDynamicTitle(route, currentPath, breadcrumbConfig) }];
    }

    // 使用自动推导
    return this.autoInferBreadcrumbs(currentPath, routeKey, breadcrumbConfig);
  }

  /**
   * 基于路径结构自动推导面包屑
   */
  private autoInferBreadcrumbs(
    currentPath: string, 
    routeKey: string,
    breadcrumbConfig?: BreadcrumbConfig
  ): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const route = this.routeConfig.routes[routeKey];
    
    // 如果配置了自定义父路由，使用配置的父路由
    if (breadcrumbConfig?.parent) {
      const parentBreadcrumbs = this.getParentBreadcrumbs(breadcrumbConfig.parent);
      breadcrumbs.push(...parentBreadcrumbs);
    } else {
      // 否则基于路径结构自动推导
      const pathBreadcrumbs = this.inferFromPathStructure(currentPath, routeKey);
      breadcrumbs.push(...pathBreadcrumbs);
    }

    // 添加当前页面
    const currentTitle = this.getDynamicTitle(route, currentPath, breadcrumbConfig);
    breadcrumbs.push({ label: currentTitle });

    return breadcrumbs;
  }

  /**
   * 基于路径结构推导父级面包屑
   */
  private inferFromPathStructure(currentPath: string, currentRouteKey: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const pathSegments = this.getPathSegments(currentPath);
    
    // 构建可能的父路径并查找对应的路由
    // 从最短的路径开始，逐步增加长度
    for (let i = 1; i < pathSegments.length; i++) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/');
      const parentRouteKey = this.findRouteByPath(parentPath);
      
      if (parentRouteKey && parentRouteKey !== currentRouteKey) {
        const parentRoute = this.routeConfig.routes[parentRouteKey];
        breadcrumbs.push({
          label: parentRoute.title,
          path: parentRoute.fullPath
        });
      }
    }

    return breadcrumbs;
  }

  /**
   * 获取指定路由的面包屑（递归获取父级）
   */
  private getParentBreadcrumbs(parentRouteKey: string): BreadcrumbItem[] {
    const parentRoute = this.routeConfig.routes[parentRouteKey];
    if (!parentRoute) return [];

    const parentBreadcrumbConfig = (parentRoute as any).breadcrumb as BreadcrumbConfig | undefined;
    
    // 递归获取父级的父级
    const grandParentBreadcrumbs = parentBreadcrumbConfig?.parent 
      ? this.getParentBreadcrumbs(parentBreadcrumbConfig.parent)
      : [];

    return [
      ...grandParentBreadcrumbs,
      {
        label: parentRoute.title,
        path: parentRoute.fullPath
      }
    ];
  }

  /**
   * 获取动态标题
   */
  private getDynamicTitle(
    route: any, 
    currentPath: string, 
    breadcrumbConfig?: BreadcrumbConfig
  ): string {
    if (breadcrumbConfig?.dynamicTitle) {
      const params = this.extractParams(currentPath, route.fullPath);
      return breadcrumbConfig.dynamicTitle(params);
    }
    return route.title;
  }

  /**
   * 从路径中提取参数
   */
  private extractParams(currentPath: string, routePattern: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    const pathSegments = currentPath.split('/').filter(s => s);
    const patternSegments = routePattern.split('/').filter(s => s);
    
    patternSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        const paramValue = pathSegments[index];
        if (paramValue) {
          params[paramName] = paramValue;
        }
      }
    });
    
    return params;
  }

  /**
   * 获取路径段数组
   */
  private getPathSegments(path: string): string[] {
    return path.split('/').filter(segment => segment.length > 0);
  }

  /**
   * 根据路径查找对应的路由键
   */
  private findRouteByPath(targetPath: string): string | null {
    // 首先尝试精确匹配
    for (const [key, route] of Object.entries(this.routeConfig.routes)) {
      if (route.fullPath === targetPath) {
        return key;
      }
    }

    // 如果精确匹配失败，尝试前缀匹配（用于处理动态路由的父路径）
    for (const [key, route] of Object.entries(this.routeConfig.routes)) {
      if (route.fullPath.includes(':')) continue; // 跳过动态路由
      if (targetPath.startsWith(route.fullPath)) {
        return key;
      }
    }

    return null;
  }
}