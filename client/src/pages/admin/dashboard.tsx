import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { UsersManagement } from '@/components/admin/pages/UsersManagement';
import { UserDetail } from '@/components/admin/pages/UserDetail';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';
import { useNavigationStore } from '@/stores/admin/navigationStore';
import { ADMIN_SIDEBAR_ITEMS } from '@/router/admin-sidebar';

// 根据路由键渲染对应的内容组件
function renderContent(routeKey: string | null, location: string) {
  switch (routeKey) {
    case 'users':
      return <UsersManagement />;
    case 'userDetail': {
      // 从路径中提取用户ID
      const match = location.match(/\/admin\/users\/([^\/]+)/);
      const userId = match?.[1];
      return userId ? <UserDetail userId={userId} /> : <UsersManagement />;
    }
    default:
      return null;
  }
}

export default function AdminDashboard() {
  const routes = useAdminRoutes();
  const { currentRouteKey, location } = routes;
  const { updateNavigation } = useNavigationStore();

  // 当路由变化时，更新 navigationStore
  useEffect(() => {
    updateNavigation(location);
  }, [location, updateNavigation]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={ADMIN_SIDEBAR_ITEMS} />
        <AdminContentLayout>
          {renderContent(currentRouteKey, location)}
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
