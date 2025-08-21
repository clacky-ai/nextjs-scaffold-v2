import { PageInfo, RouteConfig } from "./RouteConfig_old";
import { BreadcrumbBuilder } from "./BreadcrumbBuilder";

const defaultFallback = {
  title: "页面",
  description: "",
  breadcrumbs: [],
};

export class RouteUtils {
  static getPageInfo(currentPath: string, routes: RouteConfig): PageInfo {
    const matchedKey = routes.getRouteKeyFromPath(currentPath);

    if (matchedKey) {
      const route = routes.routes[matchedKey];


      const breadcrumbBuilder = new BreadcrumbBuilder(routes);
      const breadcrumbs = breadcrumbBuilder.build(currentPath, matchedKey);

      return {
        title: route.title,
        description: route.description || "",
        breadcrumbs,
      };
    }

    return defaultFallback;
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
