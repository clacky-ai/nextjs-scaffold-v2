import { create } from 'zustand';
import { RouteUtils, PageInfo } from '@/utils/router';
import { ADMIN_ROUTES, USER_ROUTES } from '@/router';

interface NavigationStore {
  // State
  currentPath: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Actions
  setCurrentPath: (path: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  // Computed
  getPageInfo: (path: string) => PageInfo;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  currentPath: ADMIN_ROUTES.getDefaultPath(),
  breadcrumbs: [],
  
  // Actions
  setCurrentPath: (currentPath) => set({ currentPath }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  // Computed - 使用 RouteUtils 统一处理
  getPageInfo: (path: string) => {
    return RouteUtils.getPageInfo(path, ADMIN_ROUTES, USER_ROUTES);
  },
}));
