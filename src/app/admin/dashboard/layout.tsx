'use client'

import { useRouter } from 'next/navigation'
import { Users, Settings, Wifi } from 'lucide-react'
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminWebSocketProvider } from '@/components/providers/admin-websocket-provider'
import { AdminSidebar } from './components/admin-sidebar';
import { AdminStoreProvider } from '@/components/providers/admin-store-provider'
import type { MenuItem } from '@/stores/admin'

const menuItems: MenuItem[] = [
  {
    id: 'users',
    path: '/admin/dashboard/users',
    label: '用户管理',
    icon: Users,
    description: '管理所有注册用户'
  },
  {
    id: 'online-users',
    path: '/admin/dashboard/online-users',
    label: '在线用户',
    icon: Wifi,
    description: '查看在线用户并发送消息'
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
      <AdminStoreProvider>
        <AdminWebSocketProvider>
          <div className="flex h-screen bg-gray-50">
            <AdminSidebar 
              menuItems={menuItems}
              onNavigate={handleNavigation}
            />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </AdminWebSocketProvider>
      </AdminStoreProvider>
    </AdminAuthGuard>
  );
}
