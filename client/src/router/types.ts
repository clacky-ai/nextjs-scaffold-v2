import { LucideIcon } from 'lucide-react';

// Admin 侧边栏项接口
export interface AdminSidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  routeKey: string; // 使用路由键而不是硬编码路径
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