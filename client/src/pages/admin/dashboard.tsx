import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { Dashboard } from '@/components/admin/pages/Dashboard';
import { UsersManagement } from '@/components/admin/pages/UsersManagement';
import { ProjectsManagement } from '@/components/admin/pages/ProjectsManagement';
import { VotesManagement } from '@/components/admin/pages/VotesManagement';
import { ResultsStatistics } from '@/components/admin/pages/ResultsStatistics';
import { SystemSettings } from '@/components/admin/pages/SystemSettings';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';
import { ADMIN_SIDEBAR_ITEMS } from '@/router/admin-sidebar';

// 根据路由键渲染对应的内容组件
function renderContent(routeKey: string | null) {
  switch (routeKey) {
    case 'dashboard':
      return <Dashboard />;
    case 'users':
      return <UsersManagement />;
    case 'projects':
      return <ProjectsManagement />;
    case 'votes':
      return <VotesManagement />;
    case 'results':
      return <ResultsStatistics />;
    case 'settings':
      return <SystemSettings />;
    default:
      return <Dashboard />;
  }
}

export default function AdminDashboard() {
  const routes = useAdminRoutes();
  const pageInfo = routes.getPageInfo();
  const currentRouteKey = routes.getCurrentRouteKey();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={ADMIN_SIDEBAR_ITEMS} />
        <AdminContentLayout breadcrumbs={pageInfo.breadcrumbs}>
          {renderContent(currentRouteKey)}
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
