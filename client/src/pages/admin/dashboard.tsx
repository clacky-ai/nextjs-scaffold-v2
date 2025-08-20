import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { Dashboard } from '@/components/admin/pages/Dashboard';
import { UsersManagement } from '@/components/admin/pages/UsersManagement';
import { ProjectsManagement } from '@/components/admin/pages/ProjectsManagement';
import { VotesManagement } from '@/components/admin/pages/VotesManagement';
import { ResultsStatistics } from '@/components/admin/pages/ResultsStatistics';
import { SystemSettings } from '@/components/admin/pages/SystemSettings';
import { ADMIN_SIDEBAR_ITEMS } from '@/router';
import { useAdminRoutes } from '@/hooks/useAdminRoutes';

// 根据路径渲染对应的内容组件
function renderContent(path: string) {
  switch (path) {
    case '/admin':
      return <Dashboard />;
    case '/admin/users':
      return <UsersManagement />;
    case '/admin/projects':
      return <ProjectsManagement />;
    case '/admin/votes':
      return <VotesManagement />;
    case '/admin/results':
      return <ResultsStatistics />;
    case '/admin/settings':
      return <SystemSettings />;
    default:
      return <Dashboard />;
  }
}

export default function AdminDashboard() {
  const routes = useAdminRoutes();
  const pageInfo = routes.getPageInfo();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={ADMIN_SIDEBAR_ITEMS} />
        <AdminContentLayout breadcrumbs={pageInfo.breadcrumbs}>
          {renderContent(routes.location)}
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
