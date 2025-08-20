// 路由定义接口（用于配置）
export interface RouteDefinition {
  path: string;
  title: string;
  description?: string;
}

// 路由基础接口（计算后的完整路由信息）
export interface BaseRoute extends RouteDefinition {
  fullPath: string;
}

// 页面信息接口
export interface PageInfo {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
}

// 路由配置类
export class RouteConfig {
  public readonly routes: Record<string, BaseRoute>;

  constructor(
    public readonly basePrefix: string = '',
    routeDefinitions: Record<string, RouteDefinition> = {}
  ) {
    // 自动计算 fullPath
    this.routes = Object.entries(routeDefinitions).reduce((acc, [key, definition]) => {
      acc[key] = {
        ...definition,
        fullPath: this.computeFullPath(definition.path)
      };
      return acc;
    }, {} as Record<string, BaseRoute>);
  }

  // 计算完整路径
  private computeFullPath(path: string): string {
    // 如果没有前缀，直接返回路径
    if (!this.basePrefix) {
      return path;
    }

    // 如果路径为空或根路径，返回前缀
    if (!path || path === '/') {
      return this.basePrefix;
    }

    // 组合前缀和路径
    return `${this.basePrefix}${path}`;
  }

  // 获取完整路径
  getFullPath(routeKey: string): string {
    const route = this.routes[routeKey];
    if (!route) {
      throw new Error(`Route "${routeKey}" not found`);
    }
    return route.fullPath;
  }

  // 获取相对路径（不含前缀）
  getPath(routeKey: string): string {
    const route = this.routes[routeKey];
    if (!route) {
      throw new Error(`Route "${routeKey}" not found`);
    }
    return route.path;
  }

  // 检查路径是否匹配
  isMatch(currentPath: string, routeKey: string): boolean {
    const route = this.routes[routeKey];
    if (!route) return false;
    
    // 对于根路径，需要精确匹配
    if (route.path === '' || route.path === '/') {
      return currentPath === route.fullPath;
    }
    
    return currentPath.startsWith(route.fullPath);
  }

  // 获取所有路由
  getAllRoutes(): Record<string, BaseRoute> {
    return { ...this.routes };
  }

  // 根据路径获取对应的路由键
  getRouteKeyFromPath(currentPath: string): string | null {
    for (const [key, route] of Object.entries(this.routes)) {
      if (this.isMatch(currentPath, key)) {
        return key;
      }
    }
    return null;
  }
}
