import { create } from 'zustand';

interface NavigationStore {
  // State
  currentPath: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Actions
  setCurrentPath: (path: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  // Computed
  getPageInfo: (path: string) => {
    title: string;
    description: string;
    breadcrumbs: Array<{ label: string; path?: string }>;
  };
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  // Initial state
  currentPath: '/admin',
  breadcrumbs: [],
  
  // Actions
  setCurrentPath: (currentPath) => set({ currentPath }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  // Computed
  getPageInfo: (path: string) => {
    switch (path) {
      case '/admin':
        return {
          title: '仪表盘',
          description: '系统概览和关键指标',
          breadcrumbs: [{ label: '仪表盘' }],
        };
      case '/admin/users':
        return {
          title: '用户管理',
          description: '管理系统用户和权限',
          breadcrumbs: [{ label: '用户管理' }],
        };
      case '/admin/projects':
        return {
          title: '项目管理',
          description: '管理参赛项目和审核',
          breadcrumbs: [{ label: '项目管理' }],
        };
      case '/admin/votes':
        return {
          title: '投票管理',
          description: '管理投票流程和规则',
          breadcrumbs: [{ label: '投票管理' }],
        };
      case '/admin/results':
        return {
          title: '结果统计',
          description: '查看投票结果和数据分析',
          breadcrumbs: [{ label: '结果统计' }],
        };
      case '/admin/settings':
        return {
          title: '系统设置',
          description: '配置系统参数和选项',
          breadcrumbs: [{ label: '系统设置' }],
        };
      default:
        return {
          title: '管理后台',
          description: '',
          breadcrumbs: [],
        };
    }
  },
}));
