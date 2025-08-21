import { AdminSidebarItem } from './types';
import { LayoutDashboard, Users, FolderOpen, Vote, Settings, BarChart3 } from 'lucide-react';

// 侧边栏菜单项配置（使用路由键，路径由路由系统动态解析）
export const ADMIN_SIDEBAR_ITEMS: AdminSidebarItem[] = [
  {
    id: 'admin-dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
    routeKey: 'admin-dashboard',
  },
  {
    id: 'admin-users',
    label: '用户管理',
    icon: Users,
    routeKey: 'admin-users',
  },
  {
    id: 'admin-projects',
    label: '项目管理',
    icon: FolderOpen,
    routeKey: 'admin-projects',
  },
  {
    id: 'admin-votes',
    label: '投票管理',
    icon: Vote,
    routeKey: 'admin-votes',
  },
  {
    id: 'admin-results',
    label: '结果统计',
    icon: BarChart3,
    routeKey: 'admin-results',
  },
  {
    id: 'admin-settings',
    label: '系统设置',
    icon: Settings,
    routeKey: 'admin-settings',
  },
];
