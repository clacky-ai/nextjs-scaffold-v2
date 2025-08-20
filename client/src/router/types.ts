import { LucideIcon } from 'lucide-react';

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