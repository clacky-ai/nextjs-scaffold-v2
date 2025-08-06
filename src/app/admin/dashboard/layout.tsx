'use client'

import { useRouter } from 'next/navigation'
import { Users, FolderOpen, Vote, Settings, BarChart3 } from 'lucide-react'
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminSidebar } from './components/admin-sidebar';

// 菜单项配置
export interface MenuItem {
  id: string
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    path: '/admin/dashboard/overview',
    label: '概览',
    icon: BarChart3,
    description: '系统统计和概览'
  },
  {
    id: 'users',
    path: '/admin/dashboard/users',
    label: '用户管理',
    icon: Users,
    description: '管理所有注册用户'
  },
  {
    id: 'projects',
    path: '/admin/dashboard/projects',
    label: '项目管理',
    icon: FolderOpen,
    description: '管理所有提交的项目'
  },
  {
    id: 'votes',
    path: '/admin/dashboard/votes',
    label: '投票管理',
    icon: Vote,
    description: '查看和管理投票记录'
  },
  {
    id: 'settings',
    path: '/admin/dashboard/settings',
    label: '管理员设置',
    icon: Settings,
    description: '管理管理员账号和个人设置'
  }
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter()

  // 页面路由处理函数
  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar 
          menuItems={menuItems}
          onNavigate={handleNavigation}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
