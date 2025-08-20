import { create } from 'zustand';
import { RouteUtils, PageInfo } from '@/utils/router';
import { ADMIN_ROUTES } from '@/router';

export interface BreadcrumbUIItem {
  label: string;
  path?: string;
}

interface NavigationStore {
  // State
  currentPath: string;
  currentRouteKey: string | null;
  pageInfo: PageInfo;
  breadcrumbs: BreadcrumbUIItem[];
  
  // Actions
  updateNavigation: (path: string) => void;
  navigateToRoute: (routeKey: string) => void;
  
  // Computed
  getPageInfo: (path: string) => PageInfo;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  currentPath: ADMIN_ROUTES.getDefaultPath(),
  currentRouteKey: ADMIN_ROUTES.getDefaultRouteKey(),
  pageInfo: {
    title: '仪表盘',
    description: '系统概览和关键指标',
    breadcrumbs: [{ label: '仪表盘' }]
  },
  breadcrumbs: [{ label: '仪表盘' }],
  
  // Actions
  updateNavigation: (path: string) => {
    const routeKey = ADMIN_ROUTES.getRouteKeyFromPath(path);
    const pageInfo = RouteUtils.getPageInfo(path, ADMIN_ROUTES);
    
    set({
      currentPath: path,
      currentRouteKey: routeKey,
      pageInfo,
      breadcrumbs: pageInfo.breadcrumbs
    });
  },
  
  navigateToRoute: (routeKey: string) => {
    const route = ADMIN_ROUTES.routes[routeKey];
    if (route) {
      const path = route.fullPath;
      get().updateNavigation(path);
      
      // 这里可以触发实际的路由导航
      // 注意：这里不直接调用 window.history 或路由库，
      // 而是通过组件层面的路由 hook 来处理
    }
  },
  
  // Computed - 使用 RouteUtils 统一处理
  getPageInfo: (path: string) => {
    return RouteUtils.getPageInfo(path, ADMIN_ROUTES);
  },
}));
