import { AdminSidebarItem } from './types';
import { ADMIN_ROUTES } from './admin-routes';
import { LayoutDashboard, Users } from 'lucide-react';

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
];
