import { AdminSidebarItem } from './types';
import { ADMIN_ROUTES } from './admin-routes';
import { LayoutDashboard, Users, FolderOpen, Vote, Settings, BarChart3 } from 'lucide-react';

// 侧边栏菜单项配置（决定哪些路由显示在侧边栏中）
export const ADMIN_SIDEBAR_ITEMS: AdminSidebarItem[] = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
    path: ADMIN_ROUTES.getFullPath('dashboard'),
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    path: ADMIN_ROUTES.getFullPath('users'),
  },
  {
    id: 'projects',
    label: '项目管理',
    icon: FolderOpen,
    path: ADMIN_ROUTES.getFullPath('projects'),
  },
  {
    id: 'votes',
    label: '投票管理',
    icon: Vote,
    path: ADMIN_ROUTES.getFullPath('votes'),
  },
  {
    id: 'results',
    label: '结果统计',
    icon: BarChart3,
    path: ADMIN_ROUTES.getFullPath('results'),
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: Settings,
    path: ADMIN_ROUTES.getFullPath('settings'),
  },
];
