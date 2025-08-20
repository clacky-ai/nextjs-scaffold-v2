import { PageInfo } from './RouteConfig';

export class RouteUtils {
  // 检查是否为管理端路径
  // static isAdminRoute(path: string): boolean {
  //   return path.startsWith('/admin');
  // }

  // 根据当前路径获取页面信息（需要传入路由配置）
  static getPageInfo(
    currentPath: string,
    adminRoutes?: any,
    userRoutes?: any
  ): PageInfo {
    // 检查是否为管理端
    if (currentPath.startsWith('/admin') && adminRoutes) {
      return this.getAdminPageInfo(currentPath, adminRoutes);
    } else if (userRoutes) {
      return this.getUserPageInfo(currentPath, userRoutes);
    }

    return {
      title: '页面',
      description: '',
      breadcrumbs: []
    };
  }

  // 获取管理端页面信息
  private static getAdminPageInfo(currentPath: string, adminRoutes: any): PageInfo {
    const routes = adminRoutes.getAllRoutes();
    
    for (const [key, route] of Object.entries(routes)) {
      if (adminRoutes.isMatch(currentPath, key)) {
        return {
          title: (route as any).title,
          description: (route as any).description || '',
          breadcrumbs: [{ label: (route as any).title }]
        };
      }
    }

    return {
      title: '管理后台',
      description: '',
      breadcrumbs: []
    };
  }

  // 获取用户端页面信息
  private static getUserPageInfo(currentPath: string, userRoutes: any): PageInfo {
    const routes = userRoutes.getAllRoutes();
    
    for (const [key, route] of Object.entries(routes)) {
      if (userRoutes.isMatch(currentPath, key)) {
        return {
          title: (route as any).title,
          description: (route as any).description || '',
          breadcrumbs: [{ label: (route as any).title }]
        };
      }
    }

    return {
      title: '投票系统',
      description: '',
      breadcrumbs: []
    };
  }

  // 检查当前路径是否匹配指定路由
  static isCurrentRoute(
    currentPath: string, 
    routeKey: string, 
    routeConfig: any
  ): boolean {
    return routeConfig.isMatch(currentPath, routeKey);
  }
}
