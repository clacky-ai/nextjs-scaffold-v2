import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { AdminSidebar, AdminPageLayout } from '@/components/admin';
import { OverviewModule, UsersModule, ProjectsModule, VotesModule, SettingsModule } from '@/components/admin/modules';
import { useIsAdminAuthenticated, useAdminAuthLoading, useAdminAuth, useAdminUser } from '@/stores/admin/authStore';
import { useNavigationStore } from '@/stores/admin/navigationStore';
import { adminMenuItems } from '@/config/admin-menu';

export default function AdminDashboardPage() {
  const [location, setLocation] = useLocation();
  const isAuthenticated = useIsAdminAuthenticated();
  const isLoading = useAdminAuthLoading();
  const { logout } = useAdminAuth();
  const adminUser = useAdminUser();
  const { isMobileOpen, setMobileOpen } = useNavigationStore();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [setMobileOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Determine which module to render based on current route
  const renderCurrentModule = () => {
    // Remove trailing slash for consistent matching
    const normalizedLocation = location.replace(/\/$/, '') || '/admin';

    switch (normalizedLocation) {
      case '/admin':
        return <OverviewModule />;
      case '/admin/users':
        return <UsersModule />;
      case '/admin/projects':
        return <ProjectsModule />;
      case '/admin/votes':
        return <VotesModule />;
      case '/admin/settings':
        return <SettingsModule />;
      default:
        // Fallback to overview for unknown routes
        return <OverviewModule />;
    }
  };

  // Get page title and description based on current route
  const getPageInfo = () => {
    const normalizedLocation = location.replace(/\/$/, '') || '/admin';

    switch (normalizedLocation) {
      case '/admin':
        return { title: '概览', description: '系统概览和统计信息' };
      case '/admin/users':
        return { title: '用户管理', description: '管理系统中的所有用户账户' };
      case '/admin/projects':
        return { title: '项目管理', description: '管理系统中的所有投票项目' };
      case '/admin/votes':
        return { title: '投票管理', description: '管理系统中的所有投票记录' };
      case '/admin/settings':
        return { title: '系统设置', description: '管理系统配置和个人设置' };
      default:
        return { title: '概览', description: '系统概览和统计信息' };
    }
  };



  // 如果未认证，显示空白页面（路由会处理重定向）
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar menuItems={adminMenuItems} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar menuItems={adminMenuItems} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden mr-2"
                    onClick={() => setMobileOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Page Title */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  投票系统管理后台
                </h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {adminUser?.name || '管理员'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {adminUser?.email}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出登录</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <AdminPageLayout
            title={getPageInfo().title}
            description={getPageInfo().description}
          >
            {renderCurrentModule()}
          </AdminPageLayout>
        </main>
      </div>
    </div>
  );
}
