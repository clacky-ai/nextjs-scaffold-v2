import { LucideIcon, LayoutDashboard, Users, FolderOpen, Vote, Settings, BarChart3 } from 'lucide-react';
import { ADMIN_ROUTES } from './admin-routes';

// Admin 侧边栏项接口
export interface AdminSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
  permissions?: string[];
}

// 导航菜单项接口
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  fullPath: string;
  title: string;
  description?: string;
  badge?: string | number;
  permissions?: string[];
  children?: NavigationItem[];
}

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

// 动态生成侧边栏菜单项的工具函数
export function createAdminSidebarItems(
  items: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
    routeKey: string;  // 对应 ADMIN_ROUTES 中的 key
    badge?: string | number;
    permissions?: string[];
  }>
): AdminSidebarItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    path: ADMIN_ROUTES.getFullPath(item.routeKey),
    badge: item.badge,
    permissions: item.permissions
  }));
}

// 使用配置生成侧边栏菜单项（可选的方式）
export const ADMIN_SIDEBAR_CONFIG = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, routeKey: 'dashboard' },
  { id: 'users', label: '用户管理', icon: Users, routeKey: 'users' },
  { id: 'projects', label: '项目管理', icon: FolderOpen, routeKey: 'projects' },
  { id: 'votes', label: '投票管理', icon: Vote, routeKey: 'votes' },
  { id: 'results', label: '结果统计', icon: BarChart3, routeKey: 'results' },
  { id: 'settings', label: '系统设置', icon: Settings, routeKey: 'settings' },
] as const;

// 从配置生成的侧边栏菜单项
export const ADMIN_SIDEBAR_ITEMS_FROM_CONFIG = createAdminSidebarItems(ADMIN_SIDEBAR_CONFIG);
