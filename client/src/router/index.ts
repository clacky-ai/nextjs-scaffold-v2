// 路由配置导出
export { USER_ROUTES } from './user-routes';
export type { UserRouteKey } from './user-routes';

export { ADMIN_ROUTES } from './admin-routes';
export type { AdminRouteKey } from './admin-routes';

export { 
  ADMIN_SIDEBAR_ITEMS, 
  ADMIN_SIDEBAR_ITEMS_FROM_CONFIG,
  createAdminSidebarItems 
} from './admin-sidebar';
export type { AdminSidebarItem, NavigationItem } from './admin-sidebar';

// 统一的路由配置
// export const ROUTES = {
//   USER: USER_ROUTES,
//   ADMIN: ADMIN_ROUTES
// } as const;
