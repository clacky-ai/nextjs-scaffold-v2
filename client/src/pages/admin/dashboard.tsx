import { useLocation } from 'wouter';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar, AdminSidebarItem } from '@/components/admin/AdminSidebar';
import { AdminContentLayout } from '@/components/admin/AdminContentLayout';
import { Dashboard } from '@/components/admin/pages/Dashboard';
import { UsersManagement } from '@/components/admin/pages/UsersManagement';
import { ProjectsManagement } from '@/components/admin/pages/ProjectsManagement';
import { VotesManagement } from '@/components/admin/pages/VotesManagement';
import { ResultsStatistics } from '@/components/admin/pages/ResultsStatistics';
import { SystemSettings } from '@/components/admin/pages/SystemSettings';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Vote,
  Settings,
  BarChart3
} from 'lucide-react';

// 管理端导航配置
const sidebarItems: AdminSidebarItem[] = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    path: '/admin/users',
  },
  {
    id: 'projects',
    label: '项目管理',
    icon: FolderOpen,
    path: '/admin/projects',
  },
  {
    id: 'votes',
    label: '投票管理',
    icon: Vote,
    path: '/admin/votes',
  },
  {
    id: 'results',
    label: '结果统计',
    icon: BarChart3,
    path: '/admin/results',
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: Settings,
    path: '/admin/settings',
  },
];

// 根据路径获取页面信息
function getPageInfo(path: string) {
  switch (path) {
    case '/admin':
      return {
        title: '仪表盘',
        description: '系统概览和关键指标',
        breadcrumbs: [{ label: '仪表盘' }],
      };
    case '/admin/users':
      return {
        title: '用户管理',
        description: '管理系统用户和权限',
        breadcrumbs: [{ label: '用户管理' }],
      };
    case '/admin/projects':
      return {
        title: '项目管理',
        description: '管理参赛项目和审核',
        breadcrumbs: [{ label: '项目管理' }],
      };
    case '/admin/votes':
      return {
        title: '投票管理',
        description: '管理投票流程和规则',
        breadcrumbs: [{ label: '投票管理' }],
      };
    case '/admin/results':
      return {
        title: '结果统计',
        description: '查看投票结果和数据分析',
        breadcrumbs: [{ label: '结果统计' }],
      };
    case '/admin/settings':
      return {
        title: '系统设置',
        description: '配置系统参数和选项',
        breadcrumbs: [{ label: '系统设置' }],
      };
    default:
      return {
        title: '管理后台',
        description: '',
        breadcrumbs: [],
      };
  }
}

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
  const [location] = useLocation();
  const pageInfo = getPageInfo(location);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar items={sidebarItems} />
        <AdminContentLayout breadcrumbs={pageInfo.breadcrumbs}>
          {renderContent(location)}
        </AdminContentLayout>
      </div>
    </SidebarProvider>
  );
}
