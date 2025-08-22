import { LucideIcon } from 'lucide-react';

// Admin 侧边栏项接口 (重构后符合新的路由配置系统)
export interface AdminSidebarItem {
  id: string;
  path: string;
  title: string;
  icon?: LucideIcon; // 直接使用 LucideIcon 组件
  order: number;
  badge?: string | number;
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