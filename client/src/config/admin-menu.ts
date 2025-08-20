import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Vote, 
  Settings
} from 'lucide-react';
import { MenuItem } from '@/stores/admin/types';

export const adminMenuItems: MenuItem[] = [
  {
    id: 'overview',
    label: '概览',
    path: '/admin',
    icon: LayoutDashboard,
    description: '系统概览和统计信息'
  },
  {
    id: 'users',
    label: '用户管理',
    path: '/admin/users',
    icon: Users,
    description: '管理系统用户'
  },
  {
    id: 'projects',
    label: '项目管理',
    path: '/admin/projects',
    icon: FolderOpen,
    description: '管理投票项目'
  },
  {
    id: 'votes',
    label: '投票管理',
    path: '/admin/votes',
    icon: Vote,
    description: '管理投票记录'
  },
  {
    id: 'settings',
    label: '设置',
    path: '/admin/settings',
    icon: Settings,
    description: '系统设置'
  }
];
